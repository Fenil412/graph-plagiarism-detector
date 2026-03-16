"""
app/middleware/logging_middleware.py
─────────────────────────────────────────────────────────────────────────────
Starlette middleware that logs every request with timing information.
"""
from __future__ import annotations

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config.logger import logger


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()

        logger.info(
            f"[{request_id}] ▶  {request.method} {request.url.path}"
            f"  client={request.client.host if request.client else 'unknown'}"
        )

        try:
            response = await call_next(request)
            duration = (time.perf_counter() - start) * 1000
            logger.info(
                f"[{request_id}] ◀  {request.method} {request.url.path}"
                f"  status={response.status_code}  {duration:.1f}ms"
            )
            response.headers["X-Request-ID"] = request_id
            return response

        except Exception as exc:
            duration = (time.perf_counter() - start) * 1000
            logger.error(
                f"[{request_id}] ✗  {request.method} {request.url.path}"
                f"  error={exc}  {duration:.1f}ms"
            )
            raise
