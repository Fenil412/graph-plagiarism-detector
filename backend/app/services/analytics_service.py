"""
app/services/analytics_service.py
─────────────────────────────────────────────────────────────────────────────
Analytics aggregation for user dashboard and admin panel.
"""
from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

from prisma import Prisma

from app.schemas import AnalyticsOverview, AdminAnalytics
from app.config.logger import logger


async def get_user_analytics(user_id: str, db: Prisma) -> AnalyticsOverview:
    """Aggregate analytics for a specific user's dashboard."""

    # ── Fetch raw data ────────────────────────────────────────────────────
    docs = await db.document.find_many(where={"user_id": user_id})
    doc_ids = [d.id for d in docs]

    comparisons = []
    if doc_ids:
        comparisons = await db.comparison.find_many(
            where={"document_a_id": {"in": doc_ids}},
            order={"created_at": "desc"},
        )

    scans = await db.scanjob.find_many(
        where={"user_id": user_id},
        order={"created_at": "desc"},
    )

    graphs = await db.graph.find_many(
        where={"document_id": {"in": doc_ids}} if doc_ids else {"document_id": "___none___"},
    )

    # ── Documents by status ───────────────────────────────────────────────
    status_counts = Counter(d.status for d in docs)
    documents_by_status = dict(status_counts)

    # ── Average plagiarism % ──────────────────────────────────────────────
    completed = [c for c in comparisons if c.status == "COMPLETED"]
    avg_plag = 0.0
    if completed:
        avg_plag = round(sum(c.plagiarism_percentage for c in completed) / len(completed), 2)

    # ── Algorithm usage ───────────────────────────────────────────────────
    algo_counts = Counter(c.algorithm_used for c in comparisons)
    algorithm_usage = dict(algo_counts)

    # ── Top similar pairs ─────────────────────────────────────────────────
    top_pairs = sorted(completed, key=lambda c: c.plagiarism_percentage, reverse=True)[:5]
    top_similar_pairs = []
    for c in top_pairs:
        doc_a = next((d for d in docs if d.id == c.document_a_id), None)
        doc_b_record = await db.document.find_unique(where={"id": c.document_b_id})
        top_similar_pairs.append({
            "comparison_id": c.id,
            "doc_a_name": doc_a.original_name if doc_a else "Unknown",
            "doc_b_name": doc_b_record.original_name if doc_b_record else "Unknown",
            "plagiarism_pct": c.plagiarism_percentage,
            "algorithm": c.algorithm_used,
            "created_at": c.created_at.isoformat(),
        })

    # ── Recent comparisons ────────────────────────────────────────────────
    recent = comparisons[:10]
    recent_comparisons = []
    for c in recent:
        doc_a = next((d for d in docs if d.id == c.document_a_id), None)
        recent_comparisons.append({
            "id": c.id,
            "doc_a_name": doc_a.original_name if doc_a else "Unknown",
            "plagiarism_pct": c.plagiarism_percentage,
            "algorithm": c.algorithm_used,
            "status": c.status,
            "created_at": c.created_at.isoformat(),
        })

    # ── Activity over time (last 30 days) ─────────────────────────────────
    now = datetime.now(timezone.utc)
    activity = defaultdict(int)
    for c in comparisons:
        day = c.created_at.strftime("%Y-%m-%d")
        activity[day] += 1
    for d in docs:
        day = d.created_at.strftime("%Y-%m-%d")
        activity[day] += 1

    activity_over_time = [
        {"date": date, "count": count}
        for date, count in sorted(activity.items())[-30:]
    ]

    # ── Graph stats ───────────────────────────────────────────────────────
    total_nodes = sum(g.node_count for g in graphs)
    total_edges = sum(g.edge_count for g in graphs)
    graph_stats = {
        "total_graphs": len(graphs),
        "total_nodes": total_nodes,
        "total_edges": total_edges,
        "avg_nodes": round(total_nodes / len(graphs), 1) if graphs else 0,
        "avg_edges": round(total_edges / len(graphs), 1) if graphs else 0,
    }

    return AnalyticsOverview(
        total_documents=len(docs),
        total_comparisons=len(comparisons),
        total_scans=len(scans),
        avg_plagiarism_pct=avg_plag,
        documents_by_status=documents_by_status,
        recent_comparisons=recent_comparisons,
        algorithm_usage=algorithm_usage,
        top_similar_pairs=top_similar_pairs,
        activity_over_time=activity_over_time,
        graph_stats=graph_stats,
    )


async def get_admin_analytics(db: Prisma) -> AdminAnalytics:
    """Admin-only analytics across all users."""

    users = await db.user.find_many()
    active_users = [u for u in users if u.is_active]

    docs = await db.document.find_many()
    comparisons = await db.comparison.find_many(
        where={"status": "COMPLETED"},
        order={"created_at": "desc"},
    )

    avg_plag = 0.0
    if comparisons:
        avg_plag = round(sum(c.plagiarism_percentage for c in comparisons) / len(comparisons), 2)

    # Users over time
    user_activity = defaultdict(int)
    for u in users:
        day = u.created_at.strftime("%Y-%m-%d")
        user_activity[day] += 1
    users_over_time = [
        {"date": d, "count": c} for d, c in sorted(user_activity.items())[-30:]
    ]

    # High plagiarism cases
    high_cases = [c for c in comparisons if c.plagiarism_percentage >= 60][:10]
    high_plagiarism_cases = []
    for c in high_cases:
        doc_a = await db.document.find_unique(where={"id": c.document_a_id})
        doc_b = await db.document.find_unique(where={"id": c.document_b_id})
        high_plagiarism_cases.append({
            "comparison_id": c.id,
            "doc_a_name": doc_a.original_name if doc_a else "Unknown",
            "doc_b_name": doc_b.original_name if doc_b else "Unknown",
            "plagiarism_pct": c.plagiarism_percentage,
            "created_at": c.created_at.isoformat(),
        })

    return AdminAnalytics(
        total_users=len(users),
        active_users=len(active_users),
        total_documents=len(docs),
        total_comparisons=len(comparisons),
        avg_plagiarism_pct=avg_plag,
        users_over_time=users_over_time,
        high_plagiarism_cases=high_plagiarism_cases,
    )
