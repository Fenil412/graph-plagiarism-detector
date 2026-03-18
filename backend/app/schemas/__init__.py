from app.schemas.user_schemas import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse
from app.schemas.document_schemas import DocumentResponse, DocumentListResponse
from app.schemas.graph_schemas import GraphResponse, GraphGenerateRequest, NodeSchema, EdgeSchema
from app.schemas.plagiarism_schemas import (
    CompareDocumentsRequest,
    ComparisonResponse,
    ReportResponse,
    PlagiarismSummary,
    SentenceMatch,
    HighlightMap,
    HighlightSentence,
)
from app.schemas.notification_schemas import (
    NotificationResponse,
    NotificationListResponse,
    NotificationMarkReadRequest,
)
from app.schemas.analytics_schemas import (
    AnalyticsOverview,
    AdminAnalytics,
    ScanRequest,
    ScanResponse,
    ScanResultItem,
)

__all__ = [
    "UserRegisterRequest", "UserLoginRequest", "UserResponse", "TokenResponse",
    "DocumentResponse", "DocumentListResponse",
    "GraphResponse", "GraphGenerateRequest", "NodeSchema", "EdgeSchema",
    "CompareDocumentsRequest", "ComparisonResponse", "ReportResponse", "PlagiarismSummary",
    "SentenceMatch", "HighlightMap", "HighlightSentence",
    "NotificationResponse", "NotificationListResponse", "NotificationMarkReadRequest",
    "AnalyticsOverview", "AdminAnalytics", "ScanRequest", "ScanResponse", "ScanResultItem",
]
