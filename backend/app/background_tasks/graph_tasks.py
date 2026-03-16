"""
app/background_tasks/graph_tasks.py
─────────────────────────────────────────────────────────────────────────────
Background task that builds the word graph for a document after upload.
This runs asynchronously so the upload API returns immediately.
"""
from __future__ import annotations

from prisma import Prisma

from app.graph_engine import build_word_graph, graph_to_dict, graph_metadata
from app.config.logger import logger


async def build_graph_task(db: Prisma, document_id: str, text: str) -> None:
    """
    Called by FastAPI BackgroundTasks after a document is uploaded.
    1. Builds a word co-occurrence graph
    2. Persists the graph to the database
    3. Marks the document status as READY (or ERROR on failure)
    """
    try:
        logger.info(f"[BG] Building graph for document {document_id}")

        G    = build_word_graph(text)
        data = graph_to_dict(G)
        meta = graph_metadata(G)

        # Upsert graph
        existing = await db.graph.find_unique(where={"document_id": document_id})
        if existing:
            await db.graph.update(
                where={"document_id": document_id},
                data={
                    "nodes":      data["nodes"],
                    "edges":      data["edges"],
                    "node_count": meta["node_count"],
                    "edge_count": meta["edge_count"],
                    "metadata":   meta,
                },
            )
        else:
            await db.graph.create(
                data={
                    "document_id": document_id,
                    "nodes":       data["nodes"],
                    "edges":       data["edges"],
                    "node_count":  meta["node_count"],
                    "edge_count":  meta["edge_count"],
                    "metadata":    meta,
                }
            )

        # Mark document as READY
        await db.document.update(
            where={"id": document_id},
            data={"status": "READY"},
        )
        logger.info(
            f"[BG] Graph complete: doc={document_id}  "
            f"nodes={meta['node_count']}  edges={meta['edge_count']}"
        )

    except Exception as exc:
        logger.error(f"[BG] Graph build failed for doc={document_id}: {exc}")
        await db.document.update(
            where={"id": document_id},
            data={"status": "ERROR"},
        )
