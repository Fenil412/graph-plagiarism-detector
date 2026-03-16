"""
app/routers/auth_router.py
─────────────────────────────────────────────────────────────────────────────
Authentication endpoints:
  POST /api/v1/auth/register
  POST /api/v1/auth/login
  GET  /api/v1/auth/me
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from prisma import Prisma

from app.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.services import register_user, login_user, get_user_by_id
from app.utils.dependencies import get_current_user_id
from app.prisma.client import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    payload: UserRegisterRequest,
    db: Prisma = Depends(get_db),
):
    """
    Create a new account.

    - **name**: Display name (2–100 characters)
    - **email**: Must be unique
    - **password**: Minimum 8 characters
    """
    return await register_user(payload, db)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive JWT",
)
async def login(
    payload: UserLoginRequest,
    db: Prisma = Depends(get_db),
):
    """Authenticate and receive a Bearer JWT token."""
    return await login_user(payload, db)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def me(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """Return the profile of the currently authenticated user."""
    return await get_user_by_id(user_id, db)