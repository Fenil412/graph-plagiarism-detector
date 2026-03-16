"""
app/schemas/document_schemas.py  —  Pydantic v2 schemas for Document endpoints
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    user_id: str
    file_name: str
    original_name: str
    mime_type: str
    file_size: int
    word_count: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int
