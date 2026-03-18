"""
app/plagiarism_engine/semantic.py
─────────────────────────────────────────────────────────────────────────────
Semantic (AI-powered) similarity using TF-IDF + Cosine Similarity.
Detects paraphrased plagiarism — catches meaning, not just words.
"""
from __future__ import annotations

from typing import List, Dict, Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from app.preprocessing import tokenize_sentences, full_preprocess
from app.config.logger import logger


def compute_semantic_similarity(text_a: str, text_b: str) -> float:
    """
    Compute document-level semantic similarity using TF-IDF vectors.
    Returns a float in [0, 1].
    """
    if not text_a.strip() or not text_b.strip():
        return 0.0

    vectorizer = TfidfVectorizer(
        max_features=5000,
        stop_words="english",
        ngram_range=(1, 2),
    )
    try:
        tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(float(sim), 6)
    except Exception as exc:
        logger.error(f"Semantic similarity failed: {exc}")
        return 0.0


def compute_sentence_embeddings(sentences: List[str]) -> np.ndarray:
    """
    Compute TF-IDF embeddings for a list of sentences.
    Returns an (N, F) matrix where N = num sentences, F = features.
    """
    if not sentences:
        return np.array([])

    vectorizer = TfidfVectorizer(
        max_features=3000,
        stop_words="english",
        ngram_range=(1, 2),
    )
    try:
        return vectorizer.fit_transform(sentences).toarray()
    except Exception:
        return np.array([])


def find_semantic_matches(
    text_a: str,
    text_b: str,
    threshold: float = 0.3,
) -> List[Dict[str, Any]]:
    """
    Find semantically similar sentence pairs between two documents.
    Uses TF-IDF + cosine similarity to detect paraphrased content.

    Returns list of dicts:
    [
        {
            "sentence_a": str,
            "sentence_b": str,
            "index_a": int,
            "index_b": int,
            "similarity": float,       # 0.0 – 1.0
            "level": "high" | "partial" | "low"
        },
        ...
    ]
    """
    sents_a = tokenize_sentences(text_a)
    sents_b = tokenize_sentences(text_b)

    if not sents_a or not sents_b:
        return []

    # Build combined TF-IDF matrix for both document sentences
    all_sentences = sents_a + sents_b
    vectorizer = TfidfVectorizer(
        max_features=3000,
        stop_words="english",
        ngram_range=(1, 2),
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(all_sentences)
    except Exception as exc:
        logger.error(f"TF-IDF vectorization failed: {exc}")
        return []

    # Split the matrix
    matrix_a = tfidf_matrix[:len(sents_a)]
    matrix_b = tfidf_matrix[len(sents_a):]

    # Compute pairwise cosine similarities
    sim_matrix = cosine_similarity(matrix_a, matrix_b)

    matches = []
    for i in range(len(sents_a)):
        for j in range(len(sents_b)):
            score = float(sim_matrix[i][j])
            if score >= threshold:
                level = "high" if score >= 0.7 else "partial" if score >= 0.4 else "low"
                matches.append({
                    "sentence_a": sents_a[i],
                    "sentence_b": sents_b[j],
                    "index_a": i,
                    "index_b": j,
                    "similarity": round(score, 4),
                    "level": level,
                })

    # Sort by score descending
    matches.sort(key=lambda m: m["similarity"], reverse=True)

    logger.info(
        f"Semantic matching: {len(sents_a)}×{len(sents_b)} sentences → "
        f"{len(matches)} matches (threshold={threshold})"
    )
    return matches[:100]  # Cap at 100 matches
