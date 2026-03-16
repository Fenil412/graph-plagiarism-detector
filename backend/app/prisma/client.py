"""
app/prisma/client.py
─────────────────────────────────────────────────────────────────────────────
Prisma async client singleton.
Provides a FastAPI dependency (get_db) for per-request database access.
"""
from __future__ import annotations

from prisma import Prisma

# ── Singleton client instance ─────────────────────────────────────────────────
_db: Prisma | None = None


async def connect_db() -> None:
    """Called from app startup event to create a single global DB connection."""
    global _db
    _db = Prisma()
    await _db.connect()


async def disconnect_db() -> None:
    """Called from app shutdown event to cleanly close the DB connection."""
    global _db
    if _db and _db.is_connected():
        await _db.disconnect()


async def get_db() -> Prisma:
    """
    FastAPI dependency — yields the shared Prisma client.

    Usage in a router:
        db: Prisma = Depends(get_db)
    """
    if _db is None:
        raise RuntimeError("Database not connected. Ensure lifespan startup ran.")
    return _db
