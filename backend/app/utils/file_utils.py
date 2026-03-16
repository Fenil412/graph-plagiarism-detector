"""
app/utils/file_utils.py
─────────────────────────────────────────────────────────────────────────────
Helpers for file validation, storage and text extraction.
"""
from __future__ import annotations

import os
import uuid
import aiofiles

from fastapi import HTTPException, UploadFile, status

from app.config.settings import settings
from app.config.logger import logger


def validate_file(file: UploadFile) -> None:
    """Raise 400 if the upload violates size or extension rules."""
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '.{ext}' is not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )


async def save_upload_file(file: UploadFile) -> tuple[str, str]:
    """
    Persist the uploaded file to FILE_UPLOAD_PATH.
    Returns (stored_filename, full_path).
    """
    os.makedirs(settings.FILE_UPLOAD_PATH, exist_ok=True)
    ext = (file.filename or "doc").rsplit(".", 1)[-1].lower()
    stored_name = f"{uuid.uuid4()}.{ext}"
    dest = os.path.join(settings.FILE_UPLOAD_PATH, stored_name)

    content = await file.read()
    if len(content) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {settings.MAX_FILE_SIZE_MB} MB limit.",
        )

    async with aiofiles.open(dest, "wb") as out:
        await out.write(content)

    logger.info(f"Saved upload → {dest}")
    return stored_name, dest


def extract_text(file_path: str, mime_type: str) -> str:
    """
    Extract raw text from .txt, .pdf or .docx files.
    Add more extractors here as needed.
    """
    ext = file_path.rsplit(".", 1)[-1].lower()

    if ext == "txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    if ext == "pdf":
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                return "\n".join(page.extract_text() or "" for page in pdf.pages)
        except ImportError:
            logger.warning("pdfplumber not installed. Install it for PDF support.")
            return ""

    if ext == "docx":
        try:
            import docx
            doc = docx.Document(file_path)
            return "\n".join(p.text for p in doc.paragraphs)
        except ImportError:
            logger.warning("python-docx not installed. Install it for DOCX support.")
            return ""

    return ""