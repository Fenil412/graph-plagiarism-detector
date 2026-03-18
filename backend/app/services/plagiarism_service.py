"""
app/services/plagiarism_service.py
─────────────────────────────────────────────────────────────────────────────
Orchestrates plagiarism comparison between two documents:
  1. Fetch stored graphs
  2. Run graph similarity + semantic AI analysis
  3. Persist Comparison + Report records
  4. Return structured result with smart highlighting data
"""
from __future__ import annotations

import uuid
from fastapi import HTTPException
from prisma import Prisma, Json

from app.plagiarism_engine import detect_plagiarism, SUPPORTED_ALGORITHMS
from app.schemas import CompareDocumentsRequest, ComparisonResponse, ReportResponse, PlagiarismSummary
from app.config.logger import logger


async def compare_documents(
    payload: CompareDocumentsRequest,
    user_id: str,
    db: Prisma,
) -> PlagiarismSummary:
    """
    Full comparison pipeline.  Both documents must belong to the requesting
    user and must have pre-built graphs.
    """
    if payload.algorithm not in SUPPORTED_ALGORITHMS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported algorithm. Choose from: {SUPPORTED_ALGORITHMS}",
        )

    # ── Fetch documents ───────────────────────────────────────────────────────
    doc_a = await db.document.find_unique(where={"id": payload.document_a_id})
    doc_b = await db.document.find_unique(where={"id": payload.document_b_id})

    for doc, label in [(doc_a, "Document A"), (doc_b, "Document B")]:
        if not doc:
            raise HTTPException(status_code=404, detail=f"{label} not found.")
        if doc.user_id != user_id:
            raise HTTPException(status_code=403, detail=f"Access denied to {label}.")
        if doc.status != "READY":
            raise HTTPException(
                status_code=400,
                detail=f"{label} is not ready (status={doc.status}). Please generate its graph first.",
            )

    # ── Fetch graphs ──────────────────────────────────────────────────────────
    graph_a = await db.graph.find_unique(where={"document_id": payload.document_a_id})
    graph_b = await db.graph.find_unique(where={"document_id": payload.document_b_id})

    for g, label in [(graph_a, "Document A"), (graph_b, "Document B")]:
        if not g:
            raise HTTPException(
                status_code=404,
                detail=f"Graph for {label} not found. Please generate it first.",
            )

    # ── Create pending Comparison record ─────────────────────────────────────
    comparison = await db.comparison.create(
        data={
            "document_a_id":  payload.document_a_id,
            "document_b_id":  payload.document_b_id,
            "algorithm_used": payload.algorithm,
            "status":         "RUNNING",
        }
    )

    try:
        # ── Run detection (enhanced with semantic + highlighting) ─────────
        result = detect_plagiarism(
            nodes_a=graph_a.nodes,
            edges_a=graph_a.edges,
            nodes_b=graph_b.nodes,
            edges_b=graph_b.edges,
            text_a=doc_a.content,
            text_b=doc_b.content,
            algorithm=payload.algorithm,
        )

        # ── Update Comparison record ──────────────────────────────────────
        comparison = await db.comparison.update(
            where={"id": comparison.id},
            data={
                "similarity_score":      result["similarity_score"],
                "plagiarism_percentage": result["plagiarism_percentage"],
                "status":                "COMPLETED",
            },
        )

        # ── Create Report ──────────────────────────────────────────────────
        share_token = str(uuid.uuid4())[:12]
        report_data = {
            "algorithm":          result["algorithm_used"],
            "similarity_score":   result["similarity_score"],
            "plagiarism_pct":     result["plagiarism_percentage"],
            "node_overlap_count": result["node_overlap_count"],
            "edge_overlap_count": result["edge_overlap_count"],
            "matching_keywords":  result["matching_keywords"],
            "matching_sentences": result["matching_sentences"],
            "sentence_matches":   result["sentence_matches"],
            "highlight_map":      result["highlight_map"],
            "semantic_score":     result["semantic_score"],
            "semantic_matches":   result["semantic_matches"],
            "matching_subgraph":  result["matching_subgraph"],
        }
        report = await db.report.create(
            data={
                "comparison_id": comparison.id,
                "report_data":   Json(report_data),
                "share_token":   share_token,
            }
        )

        logger.info(
            f"Comparison done: {payload.document_a_id} vs {payload.document_b_id} "
            f"→ {result['plagiarism_percentage']}% (semantic={result['semantic_score']:.4f})"
        )

        # ── Create notification ───────────────────────────────────────────
        pct = result["plagiarism_percentage"]
        notif_type = "warning" if pct >= 60 else "success" if pct < 30 else "info"
        notif_title = "High Plagiarism Detected!" if pct >= 60 else "Analysis Complete"
        notif_msg = (
            f"Comparison of documents found {pct}% similarity "
            f"using {payload.algorithm.replace('_', ' ')} algorithm."
        )
        try:
            await db.notification.create(
                data={
                    "user_id": user_id,
                    "type":    notif_type,
                    "title":   notif_title,
                    "message": notif_msg,
                    "link":    f"/reports?id={comparison.id}",
                }
            )
        except Exception:
            pass   # Non-critical — don't fail the comparison

        return PlagiarismSummary(
            comparison=_to_comparison(comparison),
            report=_to_report(report),
            matching_keywords=result["matching_keywords"],
            matching_sentences=result["matching_sentences"],
            sentence_matches=result["sentence_matches"],
            highlight_map=result["highlight_map"],
            semantic_score=result["semantic_score"],
            semantic_matches=result["semantic_matches"],
            matching_subgraph=result["matching_subgraph"],
        )

    except Exception as exc:
        # Mark comparison as failed
        await db.comparison.update(
            where={"id": comparison.id},
            data={"status": "FAILED"},
        )
        logger.error(f"Comparison failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(exc)}")


async def get_report(comparison_id: str, user_id: str, db: Prisma) -> ReportResponse:
    comparison = await db.comparison.find_unique(where={"id": comparison_id})
    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found.")

    # Verify ownership through document_a
    doc = await db.document.find_unique(where={"id": comparison.document_a_id})
    if not doc or doc.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    report = await db.report.find_unique(where={"comparison_id": comparison_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not generated yet.")

    return _to_report(report)


async def get_report_by_share_token(share_token: str, db: Prisma) -> ReportResponse:
    """Public access to a report via share link."""
    report = await db.report.find_first(where={"share_token": share_token})
    if not report:
        raise HTTPException(status_code=404, detail="Shared report not found.")
    return _to_report(report)


async def get_history(user_id: str, db: Prisma) -> list[ComparisonResponse]:
    docs = await db.document.find_many(where={"user_id": user_id})
    doc_ids = [d.id for d in docs]

    if not doc_ids:
        return []

    comparisons = await db.comparison.find_many(
        where={
            "document_a_id": {"in": doc_ids}
        },
        order={"created_at": "desc"}
    )
    return [_to_comparison(c) for c in comparisons]


def _to_comparison(c) -> ComparisonResponse:
    return ComparisonResponse(
        id=c.id,
        document_a_id=c.document_a_id,
        document_b_id=c.document_b_id,
        similarity_score=c.similarity_score,
        plagiarism_percentage=c.plagiarism_percentage,
        algorithm_used=c.algorithm_used,
        status=c.status,
        created_at=c.created_at,
    )


def _to_report(r) -> ReportResponse:
    return ReportResponse(
        id=r.id,
        comparison_id=r.comparison_id,
        report_data=r.report_data,
        share_token=getattr(r, 'share_token', None),
        generated_at=r.generated_at,
    )
