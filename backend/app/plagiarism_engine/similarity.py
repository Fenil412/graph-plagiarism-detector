"""
app/plagiarism_engine/similarity.py
─────────────────────────────────────────────────────────────────────────────
Four graph similarity algorithms used for plagiarism detection.

Algorithm                  | Complexity | Best for
─────────────────────────────────────────────────────────────────────────────
node_overlap               | O(n)       | Fast approximate comparison
edge_similarity            | O(e)       | Structure-aware comparison  
subgraph_similarity        | O(n²)      | Partial-match detection
graph_edit_distance        | O(n!)      | Exact (small graphs only!)
─────────────────────────────────────────────────────────────────────────────
"""
from __future__ import annotations

from typing import Any, Dict, List, Tuple
from itertools import islice

import networkx as nx

from app.config.logger import logger


# ─────────────────────────────────────────────────────────────────────────────
#  1. Node Overlap (Jaccard on node label sets)
# ─────────────────────────────────────────────────────────────────────────────

def node_overlap_similarity(G1: nx.Graph, G2: nx.Graph) -> float:
    """
    Jaccard similarity between the sets of node labels.
    Fast and language-independent.

    Returns a float in [0, 1].
    """
    nodes1 = {str(n) for n in G1.nodes()}
    nodes2 = {str(n) for n in G2.nodes()}
    if not nodes1 and not nodes2:
        return 1.0
    if not nodes1 or not nodes2:
        return 0.0
    return len(nodes1 & nodes2) / len(nodes1 | nodes2)


# ─────────────────────────────────────────────────────────────────────────────
#  2. Edge Similarity (Jaccard on edge sets)
# ─────────────────────────────────────────────────────────────────────────────

def edge_similarity(G1: nx.Graph, G2: nx.Graph) -> float:
    """
    Jaccard similarity between the frozen sets of edges.
    Captures structural similarity better than node overlap.

    Returns a float in [0, 1].
    """
    def edge_set(G: nx.Graph) -> set[frozenset]:
        return {frozenset({str(u), str(v)}) for u, v in G.edges()}

    e1 = edge_set(G1)
    e2 = edge_set(G2)
    if not e1 and not e2:
        return 1.0
    if not e1 or not e2:
        return 0.0
    return len(e1 & e2) / len(e1 | e2)


# ─────────────────────────────────────────────────────────────────────────────
#  3. Subgraph Similarity (shared neighbourhood pattern)
# ─────────────────────────────────────────────────────────────────────────────

def subgraph_similarity(G1: nx.Graph, G2: nx.Graph) -> float:
    """
    For every shared node, compare the ratio of shared neighbours.
    Good for detecting partial plagiarism (copied sections).

    Returns a float in [0, 1].
    """
    shared_nodes = set(str(n) for n in G1.nodes()) & set(str(n) for n in G2.nodes())
    if not shared_nodes:
        return 0.0

    scores: List[float] = []
    for node in shared_nodes:
        n1_neighbors = {str(n) for n in G1.neighbors(node)} if G1.has_node(node) else set()
        n2_neighbors = {str(n) for n in G2.neighbors(node)} if G2.has_node(node) else set()
        union = n1_neighbors | n2_neighbors
        if union:
            scores.append(len(n1_neighbors & n2_neighbors) / len(union))
        else:
            scores.append(1.0)  # isolated node in both → match

    return sum(scores) / len(scores) if scores else 0.0


# ─────────────────────────────────────────────────────────────────────────────
#  4. Graph Edit Distance (exact — use only on small graphs ≤ 50 nodes)
# ─────────────────────────────────────────────────────────────────────────────

_GED_NODE_LIMIT = 50


def graph_edit_distance_similarity(G1: nx.Graph, G2: nx.Graph) -> float:
    """
    Normalised Graph Edit Distance similarity.

    GED is NP-hard — automatically falls back to node_overlap on large graphs.

    Returns a float in [0, 1]  (1 = identical, 0 = completely different).
    """
    if G1.number_of_nodes() > _GED_NODE_LIMIT or G2.number_of_nodes() > _GED_NODE_LIMIT:
        logger.warning(
            "GED: graphs too large for exact computation — falling back to node_overlap"
        )
        return node_overlap_similarity(G1, G2)

    try:
        # nx.graph_edit_distance is exact but expensive → use upper bound with timeout
        ged = next(islice(nx.optimize_graph_edit_distance(G1, G2), 1), None)
        if ged is None:
            return 0.0
        max_ops = G1.number_of_nodes() + G2.number_of_nodes() + G1.number_of_edges() + G2.number_of_edges()
        similarity = 1.0 - (ged / max_ops) if max_ops > 0 else 1.0
        return max(0.0, min(1.0, similarity))
    except Exception as exc:
        logger.error(f"GED computation error: {exc}")
        return node_overlap_similarity(G1, G2)


# ─────────────────────────────────────────────────────────────────────────────
#  Dispatcher
# ─────────────────────────────────────────────────────────────────────────────

_ALGORITHMS = {
    "node_overlap":        node_overlap_similarity,
    "edge_similarity":     edge_similarity,
    "subgraph":            subgraph_similarity,
    "graph_edit_distance": graph_edit_distance_similarity,
}

SUPPORTED_ALGORITHMS = list(_ALGORITHMS.keys())


def compute_similarity(G1: nx.Graph, G2: nx.Graph, algorithm: str = "node_overlap") -> float:
    """
    Run the chosen similarity algorithm on two graphs.

    Raises ValueError if the algorithm name is unknown.
    Returns a float in [0, 1].
    """
    fn = _ALGORITHMS.get(algorithm)
    if fn is None:
        raise ValueError(
            f"Unknown algorithm '{algorithm}'. "
            f"Choose from: {SUPPORTED_ALGORITHMS}"
        )
    score = fn(G1, G2)
    logger.info(f"Similarity[{algorithm}] = {score:.4f}")
    return round(score, 6)
