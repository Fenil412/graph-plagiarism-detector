"""
app/routers/plagiarism_router.py
─────────────────────────────────────────────────────────────────────────────
Plagiarism detection endpoints:
  POST /api/v1/plagiarism/compare
  GET  /api/v1/plagiarism/report/{comparison_id}
  GET  /api/v1/plagiarism/algorithms
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from prisma import Prisma

from app.schemas import CompareDocumentsRequest, PlagiarismSummary, ReportResponse
from app.services import compare_documents, get_report
from app.plagiarism_engine import SUPPORTED_ALGORITHMS
from app.utils.dependencies import get_current_user_id
from app.prisma.client import get_db

router = APIRouter(prefix="/plagiarism", tags=["Plagiarism Detection"])


@router.post(
    "/compare",
    response_model=PlagiarismSummary,
    status_code=status.HTTP_200_OK,
    summary="Compare two documents for plagiarism",
)
async def compare(
    payload: CompareDocumentsRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """
    Compare two documents using graph-based similarity.

    Both documents must:
    - Belong to the authenticated user
    - Have status **READY** (graph already built)

    Returns similarity score, plagiarism percentage, matching keywords and sentences.
    """
    return await compare_documents(payload, user_id, db)


@router.get(
    "/report/{comparison_id}",
    response_model=ReportResponse,
    summary="Retrieve a detailed plagiarism report",
)
async def report(
    comparison_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """Fetch the full detailed report for a previous comparison."""
    return await get_report(comparison_id, user_id, db)


@router.get(
    "/algorithms",
    summary="List all supported similarity algorithms",
)
async def algorithms():
    """Return the list of graph similarity algorithms available for comparison."""
    return {
        "algorithms": SUPPORTED_ALGORITHMS,
        "default": "node_overlap",
        "descriptions": {
            "node_overlap":        "Fast Jaccard similarity on node label sets",
            "edge_similarity":     "Jaccard similarity on edge sets (structure-aware)",
            "subgraph":            "Neighbourhood comparison for partial-match detection",
            "graph_edit_distance": "Exact GED similarity (best for small documents)",
        },
    }