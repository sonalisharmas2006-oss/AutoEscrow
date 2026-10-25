"""Public demo-session issuance and safe reset endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session
import hmac
from pydantic import BaseModel, ConfigDict, Field

from app.config import get_settings
from app.database import get_db
from app.demo_auth import DemoConfigurationError, get_demo_session, issue_demo_session
from app.services.demo_sessions import delete_demo_jobs
from app.models import DemoSessionRecord


router = APIRouter(prefix="/demo", tags=["demo"])


def _session_response(session) -> dict[str, object]:
    settings = get_settings()
    return {
        "token": session.token,
        "expires_at": session.expires_at.isoformat(),
        "session_scope": "synthetic demo jobs only",
        "max_jobs": settings.demo_max_jobs_per_session,
        "max_budget": settings.demo_max_job_budget,
        "simulated_escrow": True,
    }


class SessionAccess(BaseModel):
    model_config = ConfigDict(extra="forbid")
    access_code: str = Field(default="", max_length=200)


def _persist_session(db: Session, *, commit=True):
    session = issue_demo_session()
    db.add(DemoSessionRecord(id=session.session_id, expires_at=session.expires_at, revoked=False))
    if commit:
        db.commit()
    return session


@router.post("/session", summary="Start a short-lived synthetic demo session")
def start_demo_session(payload: SessionAccess | None = None, db: Session = Depends(get_db)) -> JSONResponse:
    settings = get_settings()
    if settings.app_env == "production" and not settings.demo_public_access:
        if len(settings.demo_access_code) < 16:
            raise HTTPException(status_code=503, detail="Demo admission is closed until an access code is configured.")
        if not hmac.compare_digest((payload.access_code if payload else "").encode(), settings.demo_access_code.encode()):
            raise HTTPException(status_code=403, detail="Enter the demo access code supplied by the presenter.")
    if (db.scalar(select(func.count()).select_from(DemoSessionRecord)) or 0) >= settings.demo_max_sessions:
        raise HTTPException(status_code=503, detail="Demo capacity reached. The presenter must clean up expired sessions.")
    try:
        return JSONResponse(_session_response(_persist_session(db)), headers={"Cache-Control": "no-store"})
    except DemoConfigurationError as exc:
        return JSONResponse(status_code=503, content={"detail": str(exc)})


@router.post("/session/reset", summary="Rotate the caller's demo session")
def reset_demo_session(request: Request, db: Session = Depends(get_db)) -> JSONResponse:
    # Verification makes reset a scoped operation; the old session remains
    # inaccessible to the caller after the new credential is issued.
    session_id = get_demo_session(request, required_in_production=True)
    if session_id is None:
        raise HTTPException(status_code=401, detail="a demo session is required")
    # Generate the replacement before deleting anything: configuration failures
    # cannot lose the current sandbox. Retain the original expiry to bound resets.
    old_session = db.get(DemoSessionRecord, session_id)
    if old_session is None:
        raise HTTPException(status_code=401, detail="Session no longer exists")
    replacement = issue_demo_session()
    delete_demo_jobs(db, session_id)
    db.delete(old_session)
    db.add(DemoSessionRecord(id=replacement.session_id, expires_at=old_session.expires_at, revoked=False))
    db.commit()
    response = _session_response(replacement)
    response["expires_at"] = old_session.expires_at.isoformat()
    return JSONResponse(response, headers={"Cache-Control": "no-store"})
