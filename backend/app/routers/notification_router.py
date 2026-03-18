"""
app/routers/notification_router.py
─────────────────────────────────────────────────────────────────────────────
Notification endpoints:
  GET    /api/v1/notifications/
  POST   /api/v1/notifications/read
  DELETE /api/v1/notifications/{id}
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from prisma import Prisma

from app.schemas import NotificationListResponse, NotificationMarkReadRequest
from app.services import get_notifications, mark_notifications_read, delete_notification
from app.utils.dependencies import get_current_user_id
from app.prisma.client import get_db

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "/",
    response_model=NotificationListResponse,
    summary="Get all notifications for the current user",
)
async def list_notifications(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    return await get_notifications(user_id, db)


@router.post(
    "/read",
    summary="Mark notifications as read",
)
async def mark_read(
    payload: NotificationMarkReadRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    return await mark_notifications_read(user_id, payload.notification_ids, db)


@router.delete(
    "/{notification_id}",
    summary="Delete a notification",
)
async def delete(
    notification_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    return await delete_notification(notification_id, user_id, db)
