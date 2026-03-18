"""
app/services/scan_service.py
─────────────────────────────────────────────────────────────────────────────
Multi-document detection: compare 1 document against ALL stored documents.
Returns top-5 most similar documents + ranking.
"""
from __future__ import annotations

from fastapi import HTTPException
from prisma import Prisma, Json

from app.plagiarism_engine import detect_plagiarism, SUPPORTED_ALGORITHMS
from app.schemas import ScanResponse, ScanResultItem
from app.config.logger import logger


async def run_scan(
    document_id: str,
    algorithm: str,
    user_id: str,
    db: Prisma,
) -> ScanResponse:
    """
    Compare one document against ALL other user documents.
    Returns top-5 most similar with ranking.
    """
    if algorithm not in SUPPORTED_ALGORITHMS:
        raise HTTPException(status_code=400, detail=f"Unsupported algorithm: {algorithm}")

    # Fetch source document
    source_doc = await db.document.find_unique(where={"id": document_id})
    if not source_doc:
        raise HTTPException(status_code=404, detail="Source document not found.")
    if source_doc.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    if source_doc.status != "READY":
        raise HTTPException(status_code=400, detail="Source document graph is not ready.")

    source_graph = await db.graph.find_unique(where={"document_id": document_id})
    if not source_graph:
        raise HTTPException(status_code=404, detail="Source document graph not found.")

    # Fetch all other READY documents for the user
    all_docs = await db.document.find_many(
        where={
            "user_id": user_id,
            "status": "READY",
            "id": {"not": document_id},
        }
    )

    if not all_docs:
        raise HTTPException(status_code=400, detail="No other documents to compare against.")

    # Create scan job
    scan_job = await db.scanjob.create(
        data={
            "user_id":       user_id,
            "source_doc_id": document_id,
            "algorithm":     algorithm,
            "status":        "RUNNING",
        }
    )

    results = []

    for target_doc in all_docs:
        try:
            target_graph = await db.graph.find_unique(where={"document_id": target_doc.id})
            if not target_graph:
                continue

            result = detect_plagiarism(
                nodes_a=source_graph.nodes,
                edges_a=source_graph.edges,
                nodes_b=target_graph.nodes,
                edges_b=target_graph.edges,
                text_a=source_doc.content,
                text_b=target_doc.content,
                algorithm=algorithm,
            )

            results.append({
                "document_id": target_doc.id,
                "document_name": target_doc.original_name,
                "similarity_score": result["similarity_score"],
                "plagiarism_percentage": result["plagiarism_percentage"],
            })
        except Exception as exc:
            logger.warning(f"Scan: comparison failed for doc={target_doc.id}: {exc}")
            continue

    # Sort by similarity (highest first)
    results.sort(key=lambda r: r["similarity_score"], reverse=True)
    top_results = results[:10]  # Keep top 10

    highest = top_results[0]["similarity_score"] if top_results else 0.0

    # Update scan job
    await db.scanjob.update(
        where={"id": scan_job.id},
        data={
            "status":         "COMPLETED",
            "results":        Json(top_results),
            "total_compared": len(results),
            "highest_score":  highest,
        }
    )

    # Create notification
    try:
        pct = round(highest * 100, 1)
        notif_type = "warning" if pct >= 60 else "success"
        await db.notification.create(
            data={
                "user_id": user_id,
                "type":    notif_type,
                "title":   "Scan Complete",
                "message": f"Scanned {len(results)} documents. Highest similarity: {pct}%",
                "link":    f"/history",
            }
        )
    except Exception:
        pass

    logger.info(f"Scan complete: doc={document_id} compared={len(results)} top={highest:.4f}")

    return ScanResponse(
        scan_id=scan_job.id,
        source_document_id=document_id,
        source_document_name=source_doc.original_name,
        status="COMPLETED",
        algorithm=algorithm,
        total_compared=len(results),
        highest_score=highest,
        results=[ScanResultItem(**r) for r in top_results],
        created_at=scan_job.created_at,
    )


async def get_scan_history(user_id: str, db: Prisma) -> list:
    """Get all scan jobs for a user."""
    scans = await db.scanjob.find_many(
        where={"user_id": user_id},
        order={"created_at": "desc"},
        take=20,
    )
    result = []
    for s in scans:
        source_doc = await db.document.find_unique(where={"id": s.source_doc_id})
        result.append({
            "scan_id": s.id,
            "source_document_id": s.source_doc_id,
            "source_document_name": source_doc.original_name if source_doc else "Deleted",
            "status": s.status,
            "algorithm": s.algorithm,
            "total_compared": s.total_compared,
            "highest_score": s.highest_score,
            "results": s.results or [],
            "created_at": s.created_at.isoformat(),
        })
    return result
