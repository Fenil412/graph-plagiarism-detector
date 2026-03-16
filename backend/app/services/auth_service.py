"""
app/services/auth_service.py
─────────────────────────────────────────────────────────────────────────────
Handles user registration and login against the Prisma/PostgreSQL database.
"""
from __future__ import annotations

from datetime import timedelta

from fastapi import HTTPException, status
from prisma import Prisma

from app.config.settings import settings
from app.config.logger import logger
from app.utils.auth import hash_password, verify_password, create_access_token
from app.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse


async def register_user(payload: UserRegisterRequest, db: Prisma) -> UserResponse:
    """Create a new user.  Raises 409 if email already exists."""
    existing = await db.user.find_unique(where={"email": payload.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with that email address already exists.",
        )

    user = await db.user.create(
        data={
            "name":          payload.name,
            "email":         payload.email,
            "password_hash": hash_password(payload.password),
        }
    )
    logger.info(f"New user registered: {user.email} (id={user.id})")
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )


async def login_user(payload: UserLoginRequest, db: Prisma) -> TokenResponse:
    """Authenticate user; return JWT on success.  Raises 401 on bad credentials."""
    user = await db.user.find_unique(where={"email": payload.email})
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled.",
        )

    expire = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token  = create_access_token({"sub": user.id, "email": user.email}, expire)

    logger.info(f"User logged in: {user.email}")
    return TokenResponse(
        access_token=token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        ),
    )


async def get_user_by_id(user_id: str, db: Prisma) -> UserResponse:
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse(
        id=user.id, name=user.name, email=user.email,
        role=user.role, is_active=user.is_active, created_at=user.created_at,
    )
