"""
app/schemas/analytics_schemas.py  —  Pydantic v2 schemas for Analytics endpoints
"""
from __future__ import annotations
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_documents: int
    total_comparisons: int
    total_scans: int
    avg_plagiarism_pct: float
    documents_by_status: Dict[str, int]
    recent_comparisons: List[Dict[str, Any]]
    algorithm_usage: Dict[str, int]
    top_similar_pairs: List[Dict[str, Any]]
    activity_over_time: List[Dict[str, Any]]   # [{date, count}]
    graph_stats: Dict[str, Any]


class AdminAnalytics(BaseModel):
    total_users: int
    active_users: int
    total_documents: int
    total_comparisons: int
    avg_plagiarism_pct: float
    users_over_time: List[Dict[str, Any]]
    high_plagiarism_cases: List[Dict[str, Any]]


class ScanRequest(BaseModel):
    document_id: str
    algorithm: str = "node_overlap"


class ScanResultItem(BaseModel):
    document_id: str
    document_name: str
    similarity_score: float
    plagiarism_percentage: float


class ScanResponse(BaseModel):
    scan_id: str
    source_document_id: str
    source_document_name: str
    status: str
    algorithm: str
    total_compared: int
    highest_score: float
    results: List[ScanResultItem]
    created_at: datetime
