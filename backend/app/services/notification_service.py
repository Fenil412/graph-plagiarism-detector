"""
app/services/notification_service.py
─────────────────────────────────────────────────────────────────────────────
Notification CRUD operations.
"""
from __future__ import annotations

from prisma import Prisma

from app.schemas import NotificationResponse, NotificationListResponse
from app.config.logger import logger


async def get_notifications(user_id: str, db: Prisma) -> NotificationListResponse:
    """Fetch all notifications for a user, newest first."""
    notifications = await db.notification.find_many(
        where={"user_id": user_id},
        order={"created_at": "desc"},
        take=50,
    )
    unread_count = await db.notification.count(
        where={"user_id": user_id, "is_read": False},
    )
    return NotificationListResponse(
        notifications=[_to_response(n) for n in notifications],
        total=len(notifications),
        unread_count=unread_count,
    )


async def mark_notifications_read(
    user_id: str,
    notification_ids: list[str],
    db: Prisma,
) -> dict:
    """Mark specific notifications as read. If empty list, mark all as read."""
    if notification_ids:
        await db.notification.update_many(
            where={
                "id": {"in": notification_ids},
                "user_id": user_id,
            },
            data={"is_read": True},
        )
    else:
        await db.notification.update_many(
            where={"user_id": user_id, "is_read": False},
            data={"is_read": True},
        )
    return {"message": "Notifications marked as read."}


async def delete_notification(notif_id: str, user_id: str, db: Prisma) -> dict:
    notif = await db.notification.find_unique(where={"id": notif_id})
    if not notif or notif.user_id != user_id:
        return {"message": "Notification not found."}
    await db.notification.delete(where={"id": notif_id})
    return {"message": "Notification deleted."}


async def create_notification(
    user_id: str,
    title: str,
    message: str,
    db: Prisma,
    notif_type: str = "info",
    link: str | None = None,
) -> NotificationResponse:
    notif = await db.notification.create(
        data={
            "user_id": user_id,
            "type":    notif_type,
            "title":   title,
            "message": message,
            "link":    link,
        }
    )
    return _to_response(notif)


def _to_response(n) -> NotificationResponse:
    return NotificationResponse(
        id=n.id,
        user_id=n.user_id,
        type=n.type,
        title=n.title,
        message=n.message,
        is_read=n.is_read,
        link=n.link,
        created_at=n.created_at,
    )
