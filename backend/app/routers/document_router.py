"""
app/routers/document_router.py
─────────────────────────────────────────────────────────────────────────────
Document management endpoints:
  POST   /api/v1/documents/upload
  GET    /api/v1/documents/
  GET    /api/v1/documents/{document_id}
  DELETE /api/v1/documents/{document_id}
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, status
from prisma import Prisma

from app.schemas import DocumentResponse, DocumentListResponse
from app.services import upload_document, get_user_documents, get_document_by_id, delete_document
from app.utils.dependencies import get_current_user_id
from app.prisma.client import get_db

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a document for plagiarism analysis",
)
async def upload(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="PDF, TXT or DOCX file"),
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """
    Upload a document.  The file is saved, text is extracted,
    and graph construction starts automatically in the background.
    Document status moves from **PENDING → PROCESSING → READY**.
    """
    return await upload_document(file, user_id, db, background_tasks)


@router.get(
    "/",
    response_model=DocumentListResponse,
    summary="List all documents for the current user",
)
async def list_documents(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    return await get_user_documents(user_id, db)


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get a specific document",
)
async def get_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    return await get_document_by_id(document_id, user_id, db)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a document",
)
async def delete(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    return await delete_document(document_id, user_id, db)