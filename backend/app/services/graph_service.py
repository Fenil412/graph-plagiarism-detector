"""
app/services/graph_service.py
─────────────────────────────────────────────────────────────────────────────
Builds and persists document graphs in the database.
"""
from __future__ import annotations

from fastapi import HTTPException
from prisma import Prisma

from app.graph_engine import build_word_graph, build_sentence_graph, graph_to_dict, graph_metadata
from app.schemas import GraphResponse
from app.config.logger import logger


async def generate_graph(
    document_id: str,
    user_id: str,
    db: Prisma,
    graph_type: str = "word",
) -> GraphResponse:
    """Build and store a graph for a document. Overwrites any existing graph."""
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    if not doc.content:
        raise HTTPException(status_code=400, detail="Document has no extractable text content.")

    # Build graph
    if graph_type == "sentence":
        G = build_sentence_graph(doc.content)
    else:
        G = build_word_graph(doc.content)

    data = graph_to_dict(G)
    meta = graph_metadata(G)

    # Upsert graph record
    existing = await db.graph.find_unique(where={"document_id": document_id})
    if existing:
        graph = await db.graph.update(
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
        graph = await db.graph.create(
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

    logger.info(f"Graph built: doc={document_id}  nodes={meta['node_count']}  edges={meta['edge_count']}")

    return GraphResponse(
        id=graph.id,
        document_id=graph.document_id,
        node_count=graph.node_count,
        edge_count=graph.edge_count,
        nodes=graph.nodes,
        edges=graph.edges,
        metadata=graph.metadata,
        created_at=graph.created_at,
    )


async def get_graph(document_id: str, user_id: str, db: Prisma) -> GraphResponse:
    doc = await db.document.find_unique(where={"id": document_id})
    if not doc or doc.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied or document not found.")

    graph = await db.graph.find_unique(where={"document_id": document_id})
    if not graph:
        raise HTTPException(
            status_code=404,
            detail="Graph not generated yet. Upload and process the document first.",
        )

    return GraphResponse(
        id=graph.id,
        document_id=graph.document_id,
        node_count=graph.node_count,
        edge_count=graph.edge_count,
        nodes=graph.nodes,
        edges=graph.edges,
        metadata=graph.metadata,
        created_at=graph.created_at,
    )
