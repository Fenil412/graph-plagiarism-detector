"""
app/graph_engine/graph_builder.py
─────────────────────────────────────────────────────────────────────────────
Converts preprocessed tokens / sentences into a NetworkX graph.

Two graph types are supported:
  • "word"     — co-occurrence graph  (nodes = unique words, edges = co-occurrence within a window)
  • "sentence" — sentence-level graph (nodes = sentence IDs, edges = shared-keyword similarity)
"""
from __future__ import annotations

from collections import Counter
from itertools import combinations
from typing import Any, Dict, List, Tuple

import networkx as nx

from app.preprocessing import full_preprocess, preprocess_sentences, tokenize_sentences
from app.config.logger import logger


# ─────────────────────────────────────────────────────────────────────────────
#  Word Co-occurrence Graph
# ─────────────────────────────────────────────────────────────────────────────

def build_word_graph(text: str, window: int = 2) -> nx.Graph:
    """
    Build a word co-occurrence graph.

    Parameters
    ----------
    text   : Raw document text.
    window : Number of adjacent tokens that form an edge (default 2 = bigram).

    Returns
    -------
    nx.Graph where:
      nodes have attribute ``weight`` = term frequency
      edges have attribute ``weight`` = co-occurrence count
    """
    tokens = full_preprocess(text)
    if not tokens:
        return nx.Graph()

    freq = Counter(tokens)
    G = nx.Graph()

    # Add nodes
    for word, count in freq.items():
        G.add_node(word, label=word, weight=count, type="word")

    # Add edges within the sliding window
    for i in range(len(tokens) - window + 1):
        window_tokens = tokens[i : i + window]
        for w1, w2 in combinations(set(window_tokens), 2):
            if w1 != w2:
                if G.has_edge(w1, w2):
                    G[w1][w2]["weight"] += 1
                else:
                    G.add_edge(w1, w2, weight=1, relation="co-occurrence")

    logger.debug(f"Word graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G


# ─────────────────────────────────────────────────────────────────────────────
#  Sentence Graph
# ─────────────────────────────────────────────────────────────────────────────

def _jaccard_similarity(set_a: set, set_b: set) -> float:
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def build_sentence_graph(text: str, threshold: float = 0.1) -> nx.Graph:
    """
    Build a sentence-similarity graph.

    Nodes  = sentences (indexed 0..N)
    Edges  = pairs whose Jaccard token similarity ≥ threshold
    """
    raw_sentences = tokenize_sentences(text)
    processed     = preprocess_sentences(text)

    G = nx.Graph()

    for idx, (raw, tokens) in enumerate(zip(raw_sentences, processed)):
        G.add_node(
            idx,
            label=raw[:80],      # short label for display
            tokens=tokens,
            weight=len(tokens),
            type="sentence",
        )

    for i, j in combinations(range(len(processed)), 2):
        sim = _jaccard_similarity(set(processed[i]), set(processed[j]))
        if sim >= threshold:
            G.add_edge(i, j, weight=round(sim, 4), relation="similarity")

    logger.debug(f"Sentence graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G


# ─────────────────────────────────────────────────────────────────────────────
#  Serialisation helpers
# ─────────────────────────────────────────────────────────────────────────────

def graph_to_dict(G: nx.Graph) -> Dict[str, Any]:
    """Convert a NetworkX graph to a JSON-serialisable dict (node-link format)."""
    data = nx.node_link_data(G)
    # Convert node keys to strings for JSON safety
    serialised = {
        "nodes": [
            {
                "id": str(n["id"]),
                "label": n.get("label", str(n["id"])),
                "weight": n.get("weight", 1),
                "type": n.get("type", "word"),
            }
            for n in data["nodes"]
        ],
        "edges": [
            {
                "source": str(e["source"]),
                "target": str(e["target"]),
                "weight": e.get("weight", 1),
                "relation": e.get("relation", ""),
            }
            for e in data["links"]
        ],
    }
    return serialised


def graph_metadata(G: nx.Graph) -> Dict[str, Any]:
    """Return useful graph statistics."""
    meta: Dict[str, Any] = {
        "node_count": G.number_of_nodes(),
        "edge_count": G.number_of_edges(),
        "density": round(nx.density(G), 6),
        "is_connected": nx.is_connected(G) if G.number_of_nodes() > 0 else False,
    }
    if G.number_of_nodes() > 0 and nx.is_connected(G):
        meta["diameter"] = nx.diameter(G)
        meta["avg_clustering"] = round(nx.average_clustering(G), 6)
    return meta
