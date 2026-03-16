"""
app/schemas/plagiarism_schemas.py  —  Pydantic v2 schemas for Plagiarism endpoints
"""
from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class CompareDocumentsRequest(BaseModel):
    document_a_id: str
    document_b_id: str
    algorithm: str = Field(
        default="node_overlap",
        description="node_overlap | edge_similarity | graph_edit_distance | subgraph",
    )


class ComparisonResponse(BaseModel):
    id: str
    document_a_id: str
    document_b_id: str
    similarity_score: float
    plagiarism_percentage: float
    algorithm_used: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    id: str
    comparison_id: str
    report_data: Dict[str, Any]
    generated_at: datetime

    model_config = {"from_attributes": True}


class PlagiarismSummary(BaseModel):
    comparison: ComparisonResponse
    report: Optional[ReportResponse] = None
    matching_sentences: List[str] = []
    matching_keywords: List[str] = []
