"""
app/plagiarism_engine/detector.py
─────────────────────────────────────────────────────────────────────────────
High-level plagiarism detection logic:
  • Reconstruct NetworkX graphs from stored JSON
  • Compute similarity score (graph-based + semantic)
  • Produce detailed highlighting data for side-by-side view
  • Generate full report dict
"""
from __future__ import annotations

from typing import Any, Dict, List

import networkx as nx

from app.plagiarism_engine.similarity import compute_similarity
from app.plagiarism_engine.semantic import (
    compute_semantic_similarity,
    find_semantic_matches,
)
from app.preprocessing import full_preprocess, tokenize_sentences
from app.config.logger import logger


def _graph_from_dict(nodes: List[Dict], edges: List[Dict]) -> nx.Graph:
    """Reconstruct a NetworkX graph from stored JSON node/edge lists."""
    G = nx.Graph()
    for n in nodes:
        G.add_node(n["id"], **{k: v for k, v in n.items() if k != "id"})
    for e in edges:
        G.add_edge(e["source"], e["target"], **{k: v for k, v in e.items() if k not in ("source", "target")})
    return G


def _matching_keywords(text_a: str, text_b: str) -> List[str]:
    """Return shared meaningful tokens between two documents."""
    set_a = set(full_preprocess(text_a))
    set_b = set(full_preprocess(text_b))
    shared = sorted(set_a & set_b)
    return shared[:50]   # cap at 50 for API response


def _matching_sentences_detailed(
    text_a: str,
    text_b: str,
    threshold: float = 0.4,
) -> List[Dict[str, Any]]:
    """
    Enhanced sentence matching with Jaccard similarity scores.
    Returns detailed match info for smart highlighting.

    Each match: {
        "sentence_a": str,
        "sentence_b": str,
        "index_a": int,
        "index_b": int,
        "similarity": float,
        "level": "high" | "partial" | "low"
    }
    """
    sents_a = tokenize_sentences(text_a)
    sents_b = tokenize_sentences(text_b)

    def jaccard(s1: str, s2: str) -> float:
        t1 = set(full_preprocess(s1))
        t2 = set(full_preprocess(s2))
        if not t1 or not t2:
            return 0.0
        return len(t1 & t2) / len(t1 | t2)

    matches: List[Dict[str, Any]] = []
    for i, sa in enumerate(sents_a):
        best_score = 0.0
        best_j = -1
        best_sb = ""
        for j, sb in enumerate(sents_b):
            score = jaccard(sa, sb)
            if score >= threshold and score > best_score:
                best_score = score
                best_j = j
                best_sb = sb

        if best_j >= 0:
            level = "high" if best_score >= 0.7 else "partial" if best_score >= 0.4 else "low"
            matches.append({
                "sentence_a": sa,
                "sentence_b": best_sb,
                "index_a": i,
                "index_b": best_j,
                "similarity": round(best_score, 4),
                "level": level,
            })

    # Sort by similarity (highest first)
    matches.sort(key=lambda m: m["similarity"], reverse=True)
    return matches[:50]   # cap at 50


def _build_highlight_map(
    text_a: str,
    text_b: str,
    sentence_matches: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Build highlighting data for the frontend side-by-side view.
    Returns:
    {
        "sentences_a": [ { "text": str, "index": int, "level": str|null, "similarity": float } ],
        "sentences_b": [ { "text": str, "index": int, "level": str|null, "similarity": float } ],
    }
    """
    sents_a = tokenize_sentences(text_a)
    sents_b = tokenize_sentences(text_b)

    # Build lookup maps
    match_map_a = {}  # index_a -> { level, similarity }
    match_map_b = {}  # index_b -> { level, similarity }
    for m in sentence_matches:
        ia, ib = m["index_a"], m["index_b"]
        if ia not in match_map_a or m["similarity"] > match_map_a[ia]["similarity"]:
            match_map_a[ia] = {"level": m["level"], "similarity": m["similarity"]}
        if ib not in match_map_b or m["similarity"] > match_map_b[ib]["similarity"]:
            match_map_b[ib] = {"level": m["level"], "similarity": m["similarity"]}

    highlights_a = []
    for i, s in enumerate(sents_a):
        info = match_map_a.get(i)
        highlights_a.append({
            "text": s,
            "index": i,
            "level": info["level"] if info else None,
            "similarity": info["similarity"] if info else 0.0,
        })

    highlights_b = []
    for i, s in enumerate(sents_b):
        info = match_map_b.get(i)
        highlights_b.append({
            "text": s,
            "index": i,
            "level": info["level"] if info else None,
            "similarity": info["similarity"] if info else 0.0,
        })

    return {
        "sentences_a": highlights_a,
        "sentences_b": highlights_b,
    }


def detect_plagiarism(
    nodes_a: List[Dict],
    edges_a: List[Dict],
    nodes_b: List[Dict],
    edges_b: List[Dict],
    text_a: str,
    text_b: str,
    algorithm: str = "node_overlap",
) -> Dict[str, Any]:
    """
    Full plagiarism detection pipeline — enhanced with smart highlighting
    and semantic analysis.

    Returns
    -------
    {
        "similarity_score":      float,
        "plagiarism_percentage": float,
        "algorithm_used":        str,
        "matching_keywords":     list,
        "matching_sentences":    list[str],        # backwards compat
        "sentence_matches":      list[dict],       # detailed matches
        "highlight_map":         dict,             # side-by-side data
        "semantic_score":        float,            # AI semantic score
        "semantic_matches":      list[dict],       # AI-detected paraphrases
        "node_overlap_count":    int,
        "edge_overlap_count":    int,
        "matching_subgraph":     dict,             # shared nodes/edges for graph viz
    }
    """
    G1 = _graph_from_dict(nodes_a, edges_a)
    G2 = _graph_from_dict(nodes_b, edges_b)

    # ── Graph similarity ──────────────────────────────────────────────────
    similarity_score = compute_similarity(G1, G2, algorithm)
    plagiarism_pct   = round(similarity_score * 100, 2)

    # ── Shared graph elements ─────────────────────────────────────────────
    shared_nodes = set(str(n) for n in G1.nodes()) & set(str(n) for n in G2.nodes())
    node_overlap_count = len(shared_nodes)

    def edge_set(G: nx.Graph):
        return {frozenset({str(u), str(v)}) for u, v in G.edges()}
    shared_edges_set = edge_set(G1) & edge_set(G2)
    edge_overlap_count = len(shared_edges_set)

    # ── Matching subgraph data (for graph visualization highlighting) ────
    matching_subgraph = {
        "shared_nodes": list(shared_nodes)[:100],
        "shared_edges": [list(e) for e in list(shared_edges_set)[:100]],
    }

    # ── Text-level analysis ───────────────────────────────────────────────
    matching_keywords = _matching_keywords(text_a, text_b)

    # Enhanced sentence matching with similarity scores
    sentence_matches = _matching_sentences_detailed(text_a, text_b, threshold=0.35)
    matching_sentences = [m["sentence_a"] for m in sentence_matches[:20]]

    # Build highlight map for side-by-side view
    highlight_map = _build_highlight_map(text_a, text_b, sentence_matches)

    # ── Semantic AI analysis ──────────────────────────────────────────────
    semantic_score = compute_semantic_similarity(text_a, text_b)
    semantic_matches = find_semantic_matches(text_a, text_b, threshold=0.3)

    result = {
        "similarity_score":      similarity_score,
        "plagiarism_percentage": plagiarism_pct,
        "algorithm_used":        algorithm,
        "matching_keywords":     matching_keywords,
        "matching_sentences":    matching_sentences,
        "sentence_matches":      sentence_matches,
        "highlight_map":         highlight_map,
        "semantic_score":        semantic_score,
        "semantic_matches":      semantic_matches[:30],
        "node_overlap_count":    node_overlap_count,
        "edge_overlap_count":    edge_overlap_count,
        "matching_subgraph":     matching_subgraph,
    }

    logger.info(
        f"Plagiarism detection complete — "
        f"score={similarity_score:.4f}  pct={plagiarism_pct}%  "
        f"semantic={semantic_score:.4f}  algo={algorithm}"
    )
    return result
