"""
app/main.py
─────────────────────────────────────────────────────────────────────────────
FastAPI application entry point for the Graph-Based Plagiarism Detection System.

Startup lifecycle:
  1. Configure logger
  2. Connect Prisma DB client
  3. Register routers under /api/v1/...
  4. Register middleware (CORS, logging, error handling)
  5. Serve with Uvicorn

Run:
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.config.logger import configure_logger, logger
from app.prisma.client import connect_db, disconnect_db
from app.middleware import LoggingMiddleware, GlobalErrorMiddleware
from app.routers import (
    auth_router,
    document_router,
    graph_router,
    plagiarism_router,
)


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ───────────────────────────────────────────────────────────────
    configure_logger()
    logger.info(f"🚀  {settings.APP_NAME} starting [{settings.APP_ENV}]")
    try:
        await connect_db()
    except Exception as exc:
        logger.error(f"⚠️  Database connection failed on startup: {exc}")
        logger.info("ℹ️  Server will start anyway — DB will reconnect on first request.")
    yield
    # ── Shutdown ──────────────────────────────────────────────────────────────
    await disconnect_db()
    logger.info("👋  Database disconnected. Server shut down.")


# ── Application ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Graph-Based Plagiarism Detection System — REST API\n\n"
        "Powered by NetworkX graph algorithms and NLTK text preprocessing."
    ),
    version=settings.API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware (order matters — last added = outermost, runs first) ────────────
# Inner middleware first:
app.add_middleware(GlobalErrorMiddleware)
app.add_middleware(LoggingMiddleware)

# CORS must be outermost so ALL responses (including errors) get CORS headers:
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
BASE = f"/api/{settings.API_VERSION}"
app.include_router(auth_router,       prefix=BASE)
app.include_router(document_router,   prefix=BASE)
app.include_router(graph_router,      prefix=BASE)
app.include_router(plagiarism_router, prefix=BASE)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"], summary="Root health check")
async def root():
    return {
        "status":  "ok",
        "app":     settings.APP_NAME,
        "version": settings.API_VERSION,
        "docs":    f"{settings.BACKEND_URL}/docs",
    }


@app.get("/health", tags=["Health"], summary="Detailed health probe")
async def health():
    return {
        "status":      "healthy",
        "environment": settings.APP_ENV,
        "debug":       settings.DEBUG,
    }
