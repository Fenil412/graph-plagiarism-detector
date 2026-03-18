"""
app/routers/analytics_router.py
─────────────────────────────────────────────────────────────────────────────
Analytics endpoints:
  GET /api/v1/analytics/overview     — user analytics
  GET /api/v1/analytics/admin        — admin-only analytics
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from prisma import Prisma

from app.schemas import AnalyticsOverview, AdminAnalytics
from app.services import get_user_analytics, get_admin_analytics
from app.utils.dependencies import get_current_user_id
from app.prisma.client import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get(
    "/overview",
    response_model=AnalyticsOverview,
    summary="Get analytics overview for the current user",
)
async def overview(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    return await get_user_analytics(user_id, db)


@router.get(
    "/admin",
    response_model=AdminAnalytics,
    summary="Get admin analytics (admin role required)",
)
async def admin_analytics(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    # Check if user is admin
    user = await db.user.find_unique(where={"id": user_id})
    if not user or user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return await get_admin_analytics(db)
