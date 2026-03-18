"""
app/routers/plagiarism_router.py
─────────────────────────────────────────────────────────────────────────────
Plagiarism detection endpoints:
  POST /api/v1/plagiarism/compare
  GET  /api/v1/plagiarism/report/{comparison_id}
  GET  /api/v1/plagiarism/report/share/{share_token}
  GET  /api/v1/plagiarism/report/{comparison_id}/pdf
  GET  /api/v1/plagiarism/history
  GET  /api/v1/plagiarism/algorithms
  GET  /api/v1/plagiarism/status/{document_id}
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from prisma import Prisma

from app.schemas import CompareDocumentsRequest, PlagiarismSummary, ReportResponse, ComparisonResponse
from app.services import compare_documents, get_report, get_history, get_report_by_share_token, generate_pdf_report
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
    Compare two documents using graph-based similarity + semantic AI.

    Both documents must:
    - Belong to the authenticated user
    - Have status **READY** (graph already built)

    Returns similarity score, plagiarism percentage, smart highlighting data,
    matching keywords, sentences, and semantic AI analysis.
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
    "/report/share/{share_token}",
    response_model=ReportResponse,
    summary="Access a shared report via link",
)
async def shared_report(
    share_token: str,
    db: Prisma = Depends(get_db),
):
    """Public access to a report via unique share token."""
    return await get_report_by_share_token(share_token, db)


@router.get(
    "/report/{comparison_id}/pdf",
    summary="Download PDF report",
)
async def download_pdf(
    comparison_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """Generate and download a PDF report for a comparison."""
    return await generate_pdf_report(comparison_id, user_id, db)


@router.get(
    "/history",
    response_model=list[ComparisonResponse],
    summary="Get all comparisons for the current user",
)
async def history(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """Fetch all history or recent comparisons for a user."""
    return await get_history(user_id, db)


@router.get(
    "/status/{document_id}",
    summary="Get processing status of a document",
)
async def document_status(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """Poll document processing status for real-time progress UI."""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc or doc.user_id != user_id:
        return {"status": "NOT_FOUND", "step": 0, "total_steps": 4}

    steps = {
        "PENDING":    {"step": 1, "label": "Uploaded"},
        "PROCESSING": {"step": 2, "label": "Building Graph"},
        "READY":      {"step": 4, "label": "Ready"},
        "ERROR":      {"step": -1, "label": "Error"},
    }
    info = steps.get(doc.status, {"step": 0, "label": "Unknown"})
    graph = await db.graph.find_unique(where={"document_id": document_id})
    if graph and doc.status == "READY":
        info["step"] = 4
        info["label"] = "Ready"

    return {
        "document_id": doc.id,
        "status": doc.status,
        "step": info["step"],
        "total_steps": 4,
        "step_label": info["label"],
        "steps": ["Upload", "Processing", "Graph Build", "Ready"],
    }


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