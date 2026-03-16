from app.services.auth_service import register_user, login_user, get_user_by_id
from app.services.document_service import (
    upload_document,
    get_user_documents,
    get_document_by_id,
    delete_document,
)
from app.services.graph_service import generate_graph, get_graph
from app.services.plagiarism_service import compare_documents, get_report

__all__ = [
    "register_user", "login_user", "get_user_by_id",
    "upload_document", "get_user_documents", "get_document_by_id", "delete_document",
    "generate_graph", "get_graph",
    "compare_documents", "get_report",
]
