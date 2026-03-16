"""
app/plagiarism_engine/detector.py
─────────────────────────────────────────────────────────────────────────────
High-level plagiarism detection logic:
  • Reconstruct NetworkX graphs from stored JSON
  • Compute similarity score
  • Convert to plagiarism percentage
  • Produce a detailed report dict
"""
from __future__ import annotations

from typing import Any, Dict, List

import networkx as nx

from app.plagiarism_engine.similarity import compute_similarity
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


def _matching_sentences(text_a: str, text_b: str, threshold: float = 0.4) -> List[str]:
    """
    Return sentences from doc_a that have high Jaccard similarity with
    any sentence in doc_b (indicative of directly copied passages).
    """
    sents_a = tokenize_sentences(text_a)
    sents_b = tokenize_sentences(text_b)

    def jaccard(s1: str, s2: str) -> float:
        t1 = set(full_preprocess(s1))
        t2 = set(full_preprocess(s2))
        if not t1 or not t2:
            return 0.0
        return len(t1 & t2) / len(t1 | t2)

    matches: List[str] = []
    for sa in sents_a:
        for sb in sents_b:
            if jaccard(sa, sb) >= threshold:
                matches.append(sa)
                break

    return matches[:20]   # cap at 20


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
    Full plagiarism detection pipeline.

    Parameters
    ----------
    nodes_a / edges_a : Serialised graph data for document A.
    nodes_b / edges_b : Serialised graph data for document B.
    text_a / text_b   : Raw document texts.
    algorithm         : Similarity algorithm to use.

    Returns
    -------
    {
        "similarity_score":      float,
        "plagiarism_percentage": float,
        "algorithm_used":        str,
        "matching_keywords":     list,
        "matching_sentences":    list,
        "node_overlap_count":    int,
        "edge_overlap_count":    int,
    }
    """
    G1 = _graph_from_dict(nodes_a, edges_a)
    G2 = _graph_from_dict(nodes_b, edges_b)

    similarity_score = compute_similarity(G1, G2, algorithm)
    plagiarism_pct   = round(similarity_score * 100, 2)

    # Additional diagnostics
    shared_nodes = set(str(n) for n in G1.nodes()) & set(str(n) for n in G2.nodes())
    node_overlap_count = len(shared_nodes)

    def edge_set(G: nx.Graph):
        return {frozenset({str(u), str(v)}) for u, v in G.edges()}
    edge_overlap_count = len(edge_set(G1) & edge_set(G2))

    matching_keywords = _matching_keywords(text_a, text_b)
    matching_sentences = _matching_sentences(text_a, text_b)

    result = {
        "similarity_score":      similarity_score,
        "plagiarism_percentage": plagiarism_pct,
        "algorithm_used":        algorithm,
        "matching_keywords":     matching_keywords,
        "matching_sentences":    matching_sentences,
        "node_overlap_count":    node_overlap_count,
        "edge_overlap_count":    edge_overlap_count,
    }

    logger.info(
        f"Plagiarism detection complete — "
        f"score={similarity_score:.4f}  pct={plagiarism_pct}%  "
        f"algo={algorithm}"
    )
    return result
