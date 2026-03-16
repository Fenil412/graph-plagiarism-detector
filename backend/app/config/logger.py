"""
app/config/logger.py
─────────────────────────────────────────────────────────────────────────────
Centralised Loguru logger with file + console sinks.
Import anywhere:
    from app.config.logger import logger
"""

import sys
import os
from loguru import logger as _logger

from app.config.settings import settings


def configure_logger() -> None:
    """Set up Loguru sinks (called once during app startup)."""
    _logger.remove()  # Remove default handler

    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    # ── Console sink ─────────────────────────────────────────────────────────
    _logger.add(
        sys.stdout,
        format=log_format,
        level=settings.LOG_LEVEL,
        colorize=True,
    )

    # ── File sink (rotating) ─────────────────────────────────────────────────
    log_dir = os.path.dirname(settings.LOG_FILE)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)

    _logger.add(
        settings.LOG_FILE,
        format=log_format,
        level=settings.LOG_LEVEL,
        rotation="10 MB",
        retention="30 days",
        compression="zip",
        enqueue=True,       # Thread-safe async writes
    )


# Export the configured logger
logger = _logger
