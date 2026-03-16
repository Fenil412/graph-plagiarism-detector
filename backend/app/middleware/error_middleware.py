"""
app/middleware/error_middleware.py
─────────────────────────────────────────────────────────────────────────────
Global exception handler — wraps unhandled exceptions in a JSON envelope.
"""
from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config.logger import logger


class GlobalErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.exception(f"Unhandled error on {request.method} {request.url.path}: {exc}")
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error. Please try again later.",
                    "type":   type(exc).__name__,
                },
            )
