from app.services.auth_service import register_user, login_user, get_user_by_id
from app.services.document_service import (
    upload_document,
    get_user_documents,
    get_document_by_id,
    delete_document,
)
from app.services.graph_service import generate_graph, get_graph
from app.services.plagiarism_service import (
    compare_documents, get_report, get_history, get_report_by_share_token,
)
from app.services.notification_service import (
    get_notifications, mark_notifications_read, delete_notification, create_notification,
)
from app.services.analytics_service import get_user_analytics, get_admin_analytics
from app.services.scan_service import run_scan, get_scan_history
from app.services.report_pdf_service import generate_pdf_report

__all__ = [
    "register_user", "login_user", "get_user_by_id",
    "upload_document", "get_user_documents", "get_document_by_id", "delete_document",
    "generate_graph", "get_graph",
    "compare_documents", "get_report", "get_history", "get_report_by_share_token",
    "get_notifications", "mark_notifications_read", "delete_notification", "create_notification",
    "get_user_analytics", "get_admin_analytics",
    "run_scan", "get_scan_history",
    "generate_pdf_report",
]
