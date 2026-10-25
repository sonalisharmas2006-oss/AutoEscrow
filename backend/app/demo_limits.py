"""Bounded ASGI request admission for a single-process hackathon service.

Run ONE worker and ONE instance. A global ceiling does not trust forwarded
headers or client tokens; it protects even hosts whose proxy hides client IPs.
"""
import asyncio
from collections import OrderedDict, deque
from threading import Lock
import time

from fastapi.responses import JSONResponse
from starlette.requests import Request
from app.config import get_settings


class RateLimiter:
    def __init__(self):
        self.buckets = OrderedDict()
        self.lock = Lock()

    def allow(self, key, limit, now=None):
        now = time.monotonic() if now is None else now
        with self.lock:
            for old in list(self.buckets):
                if not self.buckets[old] or self.buckets[old][-1] <= now - 60:
                    del self.buckets[old]
            if key not in self.buckets and len(self.buckets) >= 2048:
                return False
            timestamps = self.buckets.setdefault(key, deque())
            while timestamps and timestamps[0] <= now - 60:
                timestamps.popleft()
            if len(timestamps) >= limit:
                return False
            timestamps.append(now)
            return True


class DemoLimits:
    def __init__(self, app):
        self.app = app
        self.limiter = RateLimiter()
        self.writes = asyncio.Lock()

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or not scope["path"].startswith("/api/v1"):
            return await self.app(scope, receive, send)
        request = Request(scope)
        settings = get_settings()
        protected = settings.app_env == "production" or bool(request.headers.get("X-Demo-Session")) or scope["path"].endswith("/demo/session")
        if not protected or scope["method"] == "OPTIONS":
            return await self.app(scope, receive, send)

        async def reject(status, detail):
            response = JSONResponse({"detail": detail}, status_code=status, headers={"Cache-Control": "no-store", **({"Retry-After": "60"} if status == 429 else {})})
            await response(scope, receive, send)

        host = request.client.host if request.client else "unknown"
        if not self.limiter.allow("global", 600) or not self.limiter.allow(f"ip:{host}", settings.demo_rate_limit_per_minute):
            return await reject(429, "Demo rate limit exceeded. Wait one minute, then refresh.")
        if scope["path"].rstrip("/") == "/api/v1/demo/session" and not self.limiter.allow(f"issue:{host}", 10):
            return await reject(429, "Too many new demo sessions. Wait one minute.")
        try:
            length = int(request.headers.get("content-length", "0"))
        except ValueError:
            return await reject(400, "Invalid Content-Length")
        if length < 0 or length > settings.demo_max_request_bytes:
            return await reject(413, "Demo request is too large")
        # Count actual bytes, including chunked bodies; never trust only a header.
        body = bytearray()
        try:
            async with asyncio.timeout(15):
                while True:
                    message = await receive()
                    if message["type"] == "http.disconnect":
                        return
                    body.extend(message.get("body", b""))
                    if len(body) > settings.demo_max_request_bytes:
                        return await reject(413, "Demo request is too large")
                    if not message.get("more_body", False):
                        break
        except TimeoutError:
            return await reject(408, "Request body timed out")
        delivered = False

        async def replay():
            nonlocal delivered
            if delivered:
                return await receive()
            delivered = True
            return {"type": "http.request", "body": bytes(body), "more_body": False}

        async def private_send(message):
            if message["type"] == "http.response.start":
                headers = [(name, value) for name, value in message.get("headers", []) if name.lower() != b"cache-control"]
                message = {**message, "headers": [*headers, (b"cache-control", b"no-store")]}
            await send(message)

        if scope["method"] in {"POST", "PUT", "PATCH", "DELETE"}:
            async with self.writes:
                return await self.app(scope, replay, private_send)
        return await self.app(scope, replay, private_send)
