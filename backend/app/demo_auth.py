"""Scoped, server-issued credentials for the public synthetic demo."""

from __future__ import annotations

import base64
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
import secrets
import re

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import DemoSessionRecord


DEMO_SESSION_HEADER = "X-Demo-Session"
DEMO_SESSION_VERSION = 1
_local_secret = secrets.token_bytes(32)


class DemoSessionError(ValueError):
    """Raised when a demo credential is missing, malformed, or expired."""


class DemoConfigurationError(RuntimeError):
    """Raised when production demo signing has not been configured safely."""


@dataclass(frozen=True)
class DemoSession:
    session_id: str
    token: str
    expires_at: datetime


def _secret() -> bytes:
    settings = get_settings()
    configured = settings.demo_session_secret.strip()
    if settings.app_env.lower() == "production" and (
        len(configured) < 32 or "replace-with" in configured or "local-only" in configured
    ):
        raise DemoConfigurationError("Configure a random private DEMO_SESSION_SECRET of at least 32 characters")
    if configured:
        return configured.encode("utf-8")
    if settings.app_env.lower() == "production":
        raise DemoConfigurationError(
            "DEMO_SESSION_SECRET must be configured before the public demo can be used"
        )
    return _local_secret


def _encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _signature(payload: str) -> str:
    return _encode(hmac.new(_secret(), payload.encode("ascii"), hashlib.sha256).digest())


def issue_demo_session() -> DemoSession:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(seconds=max(60, settings.demo_session_ttl_seconds))
    claims = {
        "v": DEMO_SESSION_VERSION,
        "sid": secrets.token_urlsafe(24),
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    payload = _encode(json.dumps(claims, separators=(",", ":"), sort_keys=True).encode("utf-8"))
    token = f"{payload}.{_signature(payload)}"
    return DemoSession(session_id=claims["sid"], token=token, expires_at=expires_at)


def verify_demo_session(token: str) -> DemoSession:
    if not token or len(token) > 512 or not re.fullmatch(r"[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+", token):
        raise DemoSessionError("demo session credential is invalid")
    payload, supplied_signature = token.split(".", 1)
    try:
        expected_signature = _signature(payload)
        claims = json.loads(_decode(payload).decode("utf-8"))
    except (DemoConfigurationError, ValueError, TypeError, json.JSONDecodeError, UnicodeError):
        raise DemoSessionError("demo session credential is invalid") from None
    if not hmac.compare_digest(supplied_signature, expected_signature):
        raise DemoSessionError("demo session credential is invalid")
    if not isinstance(claims, dict) or claims.get("v") != DEMO_SESSION_VERSION or not isinstance(claims.get("sid"), str):
        raise DemoSessionError("demo session credential is invalid")
    try:
        expires_at = datetime.fromtimestamp(int(claims["exp"]), tz=timezone.utc)
    except (KeyError, TypeError, ValueError, OSError, OverflowError):
        raise DemoSessionError("demo session credential is invalid") from None
    if expires_at <= datetime.now(timezone.utc):
        raise DemoSessionError("demo session credential has expired")
    return DemoSession(session_id=claims["sid"], token=token, expires_at=expires_at)


def get_demo_session(request: Request, *, required_in_production: bool = True) -> str | None:
    """Return the verified session id or raise a truthful API error."""

    token = request.headers.get(DEMO_SESSION_HEADER)
    if not token:
        if required_in_production and get_settings().app_env.lower() == "production":
            raise HTTPException(status_code=401, detail="a demo session is required")
        return None
    try:
        return verify_demo_session(token).session_id
    except DemoSessionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


def public_demo_operator(session_id: str | None) -> str | None:
    """Return the server-side operator identity for a scoped public demo."""

    settings = get_settings()
    if session_id and settings.demo_public_resolution_enabled:
        return settings.demo_resolution_operator
    return None


def enforce_demo_session(request: Request, db: Session = Depends(get_db)) -> None:
    """Router-wide fail-closed boundary, including future API routes.

    Legacy no-token development calls are local-only. Hosted deployments must
    use production mode. A signed token alone is insufficient after revocation.
    """
    if request.url.path.rstrip("/") == "/api/v1/demo/session":
        return
    session_id = get_demo_session(request)
    if session_id is None:
        return
    record = db.get(DemoSessionRecord, session_id)
    expiry = None if record is None else record.expires_at
    if expiry is not None and expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    if record is None or record.revoked or expiry is None or expiry <= datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Demo session expired or reset. Start a new session explicitly.")
    db.info["demo_session_id"] = session_id
    if request.method not in {"GET", "OPTIONS", "HEAD"} and not request.url.path.endswith("/reset"):
        if record.mutations >= get_settings().demo_max_mutations_per_session:
            raise HTTPException(status_code=429, detail="Demo action limit reached. Reset your sandbox.")
        record.mutations += 1
        db.commit()
