"""
app/schemas/plagiarism_schemas.py  —  Pydantic v2 schemas for Plagiarism endpoints
"""
from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Algorithm(str, Enum):
    NODE_OVERLAP = "node_overlap"
    EDGE_SIMILARITY = "edge_similarity"
    SUBGRAPH = "subgraph"
    GRAPH_EDIT_DISTANCE = "graph_edit_distance"


class CompareDocumentsRequest(BaseModel):
    document_a_id: str
    document_b_id: str
    algorithm: Algorithm = Field(
        default=Algorithm.NODE_OVERLAP,
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
