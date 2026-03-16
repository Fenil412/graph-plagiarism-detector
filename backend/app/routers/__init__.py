from app.routers.auth_router import router as auth_router
from app.routers.document_router import router as document_router
from app.routers.graph_router import router as graph_router
from app.routers.plagiarism_router import router as plagiarism_router

__all__ = ["auth_router", "document_router", "graph_router", "plagiarism_router"]
