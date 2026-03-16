"""
app/schemas/graph_schemas.py  —  Pydantic v2 schemas for Graph endpoints
"""
from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class NodeSchema(BaseModel):
    id: str
    label: str
    weight: float = 1.0
    type: str = "word"          # "word" | "sentence"


class EdgeSchema(BaseModel):
    source: str
    target: str
    weight: float = 1.0
    relation: str = "co-occurrence"


class GraphResponse(BaseModel):
    id: str
    document_id: str
    node_count: int
    edge_count: int
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

    model_config = {"from_attributes": True}


class GraphGenerateRequest(BaseModel):
    document_id: str
    graph_type: str = "word"    # "word" | "sentence"
