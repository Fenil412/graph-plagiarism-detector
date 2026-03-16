"""
app/routers/graph_router.py
─────────────────────────────────────────────────────────────────────────────
Graph generation and retrieval endpoints:
  POST /api/v1/graphs/generate
  GET  /api/v1/graphs/{document_id}
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from prisma import Prisma

from app.schemas import GraphResponse, GraphGenerateRequest
from app.services import generate_graph, get_graph
from app.utils.dependencies import get_current_user_id
from app.prisma.client import get_db

router = APIRouter(prefix="/graphs", tags=["Graphs"])


@router.post(
    "/generate",
    response_model=GraphResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a graph from a document",
)
async def generate(
    payload: GraphGenerateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """
    Explicitly (re-)generate a graph for an existing document.

    - **document_id**: ID of the target document
    - **graph_type**: `word` (co-occurrence) or `sentence` (similarity)
    """
    return await generate_graph(
        document_id=payload.document_id,
        user_id=user_id,
        db=db,
        graph_type=payload.graph_type,
    )


@router.get(
    "/{document_id}",
    response_model=GraphResponse,
    summary="Get the stored graph for a document",
)
async def get(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """Retrieve the pre-built graph for the specified document."""
    return await get_graph(document_id, user_id, db)