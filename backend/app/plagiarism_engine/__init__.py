from app.plagiarism_engine.similarity import compute_similarity, SUPPORTED_ALGORITHMS
from app.plagiarism_engine.detector import detect_plagiarism
from app.plagiarism_engine.semantic import (
    compute_semantic_similarity,
    find_semantic_matches,
)

__all__ = [
    "compute_similarity",
    "SUPPORTED_ALGORITHMS",
    "detect_plagiarism",
    "compute_semantic_similarity",
    "find_semantic_matches",
]
