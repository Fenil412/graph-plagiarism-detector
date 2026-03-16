from app.schemas.user_schemas import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse
from app.schemas.document_schemas import DocumentResponse, DocumentListResponse
from app.schemas.graph_schemas import GraphResponse, GraphGenerateRequest, NodeSchema, EdgeSchema
from app.schemas.plagiarism_schemas import (
    CompareDocumentsRequest,
    ComparisonResponse,
    ReportResponse,
    PlagiarismSummary,
)

__all__ = [
    "UserRegisterRequest", "UserLoginRequest", "UserResponse", "TokenResponse",
    "DocumentResponse", "DocumentListResponse",
    "GraphResponse", "GraphGenerateRequest", "NodeSchema", "EdgeSchema",
    "CompareDocumentsRequest", "ComparisonResponse", "ReportResponse", "PlagiarismSummary",
]
