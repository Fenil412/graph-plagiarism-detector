"""
app/utils/dependencies.py
─────────────────────────────────────────────────────────────────────────────
FastAPI dependency injection helpers — current user extraction from JWT,
database client access, etc.
"""
from __future__ import annotations

import time
from collections import defaultdict

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from jose import JWTError

from app.utils.auth import decode_access_token
from app.config.logger import logger

# Rate limiting: in-memory store (key: list of timestamps)
_rate_limits = defaultdict(list)

def check_rate_limit(client_ip: str, max_requests: int = 5, window_seconds: int = 60):
    """Check if client has exceeded rate limit. Raises 429 if so."""
    now = time.time()
    _rate_limits[client_ip] = [t for t in _rate_limits[client_ip] if now - t < window_seconds]
    if len(_rate_limits[client_ip]) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )
    _rate_limits[client_ip].append(now)

async def rate_limit_dependency(request: Request):
    """Dependency to enforce rate limiting based on client IP."""
    check_rate_limit(request.client.host)

bearer_scheme = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """Extract and validate the JWT bearer token; return the user ID."""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise JWTError("Subject claim missing")
        return user_id
    except JWTError as exc:
        logger.warning(f"JWT validation failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
