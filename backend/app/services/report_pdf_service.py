"""
app/services/report_pdf_service.py
─────────────────────────────────────────────────────────────────────────────
PDF report generation using ReportLab.
"""
from __future__ import annotations

import io
from datetime import datetime

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from prisma import Prisma

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)

from app.config.logger import logger


async def generate_pdf_report(
    comparison_id: str,
    user_id: str,
    db: Prisma,
) -> StreamingResponse:
    """Generate a downloadable PDF report for a comparison."""
    comparison = await db.comparison.find_unique(where={"id": comparison_id})
    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found.")

    doc_a = await db.document.find_unique(where={"id": comparison.document_a_id})
    doc_b = await db.document.find_unique(where={"id": comparison.document_b_id})

    if doc_a and doc_a.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    report = await db.report.find_unique(where={"comparison_id": comparison_id})
    report_data = report.report_data if report else {}

    # ── Build PDF ─────────────────────────────────────────────────────────
    buffer = io.BytesIO()
    pdf = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=20*mm, leftMargin=20*mm,
        topMargin=25*mm, bottomMargin=20*mm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontSize=22, spaceAfter=12,
        textColor=colors.HexColor("#7c3aed"),
    )
    heading_style = ParagraphStyle(
        'CustomHeading', parent=styles['Heading2'],
        fontSize=14, spaceAfter=8, spaceBefore=16,
        textColor=colors.HexColor("#1e1b4b"),
    )
    body_style = styles['BodyText']

    elements = []

    # Title
    elements.append(Paragraph("📊 Plagiarism Detection Report", title_style))
    elements.append(Spacer(1, 6))
    elements.append(HRFlowable(width="100%", color=colors.HexColor("#7c3aed"), thickness=2))
    elements.append(Spacer(1, 12))

    # Summary table
    pct = comparison.plagiarism_percentage
    score_color = "#ef4444" if pct >= 60 else "#f59e0b" if pct >= 30 else "#10b981"

    summary_data = [
        ["Document A", doc_a.original_name if doc_a else "N/A"],
        ["Document B", doc_b.original_name if doc_b else "N/A"],
        ["Algorithm", comparison.algorithm_used.replace("_", " ").title()],
        ["Similarity Score", f"{comparison.similarity_score:.4f}"],
        ["Plagiarism %", f"{pct:.1f}%"],
        ["Status", comparison.status],
        ["Date", comparison.created_at.strftime("%Y-%m-%d %H:%M")],
    ]

    # Add semantic score if available
    semantic_score = report_data.get("semantic_score", 0)
    if semantic_score:
        summary_data.append(["Semantic AI Score", f"{semantic_score:.4f}"])

    elements.append(Paragraph("Summary", heading_style))
    t = Table(summary_data, colWidths=[140, 330])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f0f0ff")),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e0e0e0")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 16))

    # Matching Keywords
    keywords = report_data.get("matching_keywords", [])
    if keywords:
        elements.append(Paragraph("Matching Keywords", heading_style))
        kw_text = ", ".join(keywords[:30])
        elements.append(Paragraph(kw_text, body_style))
        elements.append(Spacer(1, 12))

    # Matching Sentences
    sentence_matches = report_data.get("sentence_matches", [])
    if sentence_matches:
        elements.append(Paragraph("Matched Sentences", heading_style))
        for i, m in enumerate(sentence_matches[:10]):
            level = m.get("level", "low")
            sim = m.get("similarity", 0)
            color_hex = "#ef4444" if level == "high" else "#f59e0b" if level == "partial" else "#94a3b8"

            elements.append(Paragraph(
                f'<b>Match {i+1}</b> (Similarity: {sim:.0%}) — '
                f'<font color="{color_hex}">{level.upper()}</font>',
                body_style,
            ))
            elements.append(Paragraph(f'<i>Doc A:</i> "{m.get("sentence_a", "")[:200]}"', body_style))
            elements.append(Paragraph(f'<i>Doc B:</i> "{m.get("sentence_b", "")[:200]}"', body_style))
            elements.append(Spacer(1, 6))

    # Semantic Matches
    semantic_matches = report_data.get("semantic_matches", [])
    if semantic_matches:
        elements.append(Paragraph("AI-Detected Paraphrases (Semantic)", heading_style))
        for i, m in enumerate(semantic_matches[:5]):
            sim = m.get("similarity", 0)
            elements.append(Paragraph(
                f'<b>Paraphrase {i+1}</b> (Cosine Similarity: {sim:.0%})',
                body_style,
            ))
            elements.append(Paragraph(f'<i>Doc A:</i> "{m.get("sentence_a", "")[:200]}"', body_style))
            elements.append(Paragraph(f'<i>Doc B:</i> "{m.get("sentence_b", "")[:200]}"', body_style))
            elements.append(Spacer(1, 6))

    # Footer
    elements.append(Spacer(1, 24))
    elements.append(HRFlowable(width="100%", color=colors.grey, thickness=0.5))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph(
        f"Generated by Graph Plagiarism Detector — {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        ParagraphStyle('Footer', parent=body_style, fontSize=8, textColor=colors.grey),
    ))

    pdf.build(elements)
    buffer.seek(0)

    filename = f"plagiarism_report_{comparison_id[:8]}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
