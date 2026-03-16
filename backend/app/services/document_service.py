"""
app/services/document_service.py
─────────────────────────────────────────────────────────────────────────────
Handles all document CRUD and file-handling operations.
"""
from __future__ import annotations

from fastapi import HTTPException, UploadFile, status, BackgroundTasks
from prisma import Prisma

from app.config.logger import logger
from app.utils.file_utils import validate_file, save_upload_file, extract_text
from app.schemas import DocumentResponse, DocumentListResponse


async def upload_document(
    file: UploadFile,
    user_id: str,
    db: Prisma,
    background_tasks: BackgroundTasks,
) -> DocumentResponse:
    """
    Validate, save and persist a new document.
    Graph construction is queued as a background task after upload.
    """
    validate_file(file)
    stored_name, file_path = await save_upload_file(file)

    # Extract text content from the file
    text = extract_text(file_path, file.content_type or "")

    doc = await db.document.create(
        data={
            "user_id":       user_id,
            "file_name":     stored_name,
            "original_name": file.filename or stored_name,
            "mime_type":     file.content_type or "application/octet-stream",
            "file_size":     len(text.encode()),
            "content":       text,
            "word_count":    len(text.split()),
            "status":        "PENDING",
        }
    )
    logger.info(f"Document uploaded: id={doc.id}  user={user_id}")

    # Queue background graph construction
    from app.background_tasks.graph_tasks import build_graph_task
    background_tasks.add_task(build_graph_task, doc.id, text)

    return _to_response(doc)


async def get_user_documents(user_id: str, db: Prisma) -> DocumentListResponse:
    docs = await db.document.find_many(
        where={"user_id": user_id},
        order={"created_at": "desc"},
    )
    return DocumentListResponse(
        documents=[_to_response(d) for d in docs],
        total=len(docs),
    )


async def get_document_by_id(doc_id: str, user_id: str, db: Prisma):
    doc = await db.document.find_unique(where={"id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return _to_response(doc)


async def delete_document(doc_id: str, user_id: str, db: Prisma) -> dict:
    doc = await db.document.find_unique(where={"id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    if doc.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    await db.document.delete(where={"id": doc_id})
    logger.info(f"Document deleted: id={doc_id}  user={user_id}")
    return {"message": f"Document {doc_id} deleted successfully."}


def _to_response(doc) -> DocumentResponse:
    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        file_name=doc.file_name,
        original_name=doc.original_name,
        mime_type=doc.mime_type,
        file_size=doc.file_size,
        word_count=doc.word_count,
        status=doc.status,
        created_at=doc.created_at,
    )
