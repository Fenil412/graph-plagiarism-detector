"""
app/prisma/client.py
─────────────────────────────────────────────────────────────────────────────
Prisma async client singleton with retry logic for Neon cold-start.
Provides a FastAPI dependency (get_db) for per-request database access.
"""
from __future__ import annotations

import asyncio

from prisma import Prisma

from app.config.logger import logger

# ── Singleton client instance ─────────────────────────────────────────────────
_db: Prisma | None = None

# Retry settings for Neon cold-start (endpoint takes a few seconds to wake up)
MAX_RETRIES = 5
RETRY_DELAY_SECONDS = 3


async def connect_db() -> None:
    """
    Called from app startup event to create a single global DB connection.
    Retries up to MAX_RETRIES times to handle Neon free-tier cold starts
    where the compute endpoint needs time to wake up.
    """
    global _db
    _db = Prisma()

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            await _db.connect()
            logger.info("✅  Database connected successfully.")
            return
        except Exception as exc:
            if attempt < MAX_RETRIES:
                logger.warning(
                    f"⏳  DB connection attempt {attempt}/{MAX_RETRIES} failed: {exc}. "
                    f"Retrying in {RETRY_DELAY_SECONDS}s..."
                )
                await asyncio.sleep(RETRY_DELAY_SECONDS)
            else:
                logger.error(
                    f"❌  All {MAX_RETRIES} DB connection attempts failed. "
                    f"Last error: {exc}"
                )
                # Don't raise — let the app start anyway.
                # Requests will get a clear error via get_db().
                _db = None


async def disconnect_db() -> None:
    """Called from app shutdown event to cleanly close the DB connection."""
    global _db
    if _db and _db.is_connected():
        await _db.disconnect()


async def get_db() -> Prisma:
    """
    FastAPI dependency — yields the shared Prisma client.
    If the connection was lost or never established, attempts to reconnect.

    Usage in a router:
        db: Prisma = Depends(get_db)
    """
    global _db

    # If not connected, try to reconnect (handles Neon wake-up after idle)
    if _db is None or not _db.is_connected():
        logger.info("🔄  DB not connected — attempting to reconnect...")
        _db = Prisma()
        try:
            await _db.connect()
            logger.info("✅  DB reconnected successfully.")
        except Exception as exc:
            _db = None
            raise RuntimeError(
                f"Database is unavailable. Please try again in a moment. ({exc})"
            ) from exc

    return _db
