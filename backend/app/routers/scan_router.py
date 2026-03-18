"""
app/routers/scan_router.py
─────────────────────────────────────────────────────────────────────────────
Multi-document scan endpoints:
  POST /api/v1/scan/run           — Run 1-vs-all scan
  GET  /api/v1/scan/history       — Get scan history
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from prisma import Prisma

from app.schemas import ScanRequest, ScanResponse
from app.services import run_scan, get_scan_history
from app.utils.dependencies import get_current_user_id
from app.prisma.client import get_db

router = APIRouter(prefix="/scan", tags=["Multi-Document Scan"])


@router.post(
    "/run",
    response_model=ScanResponse,
    summary="Scan a document against all stored documents",
)
async def scan(
    payload: ScanRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """
    Compare one document against all other user documents.
    Returns top-10 most similar documents ranked by score.
    """
    return await run_scan(payload.document_id, payload.algorithm, user_id, db)


@router.get(
    "/history",
    summary="Get scan job history",
)
async def scan_history(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    return await get_scan_history(user_id, db)
