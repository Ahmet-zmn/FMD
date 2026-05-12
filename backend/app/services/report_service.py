"""
Report generation service — Produces JSON and PDF reports for inference results.
"""

import io
import json
import logging
from datetime import datetime
from typing import Dict, Any

logger = logging.getLogger(__name__)


def generate_json_report(
    result: Dict[str, Any],
    filename: str,
) -> str:
    """
    Generate a structured JSON report from inference results.

    Args:
        result: Inference result dict from ModelService
        filename: Original uploaded filename

    Returns:
        JSON string of the report
    """
    # Remove binary data from report
    report_data = {
        "report": {
            "title": "Şap Hastalığı AI Analiz Raporu / FMD AI Analysis Report",
            "generated_at": datetime.now().isoformat(),
            "source_file": filename,
            "disclaimer_tr": "Bu rapor yalnızca karar destek amaçlıdır. Kesin tanı için veteriner hekim değerlendirmesi gereklidir.",
            "disclaimer_en": "This report is for decision support only. A veterinarian must confirm the final diagnosis.",
        },
        "image_info": {
            "original_size": result.get("original_size"),
        },
        "summary": {
            "total_detections": result.get("total_detections", 0),
            "class_counts": result.get("class_counts", {}),
            "interpretation": result.get("interpretation", {}),
        },
        "detections": [
            {
                "id": d["id"],
                "class_name": d["class_name"],
                "confidence": d["confidence"],
                "polygon": d["polygon"],
                "xywhr": d["xywhr"],
            }
            for d in result.get("detections", [])
        ],
    }

    return json.dumps(report_data, indent=2, ensure_ascii=False)


def generate_pdf_report(
    result: Dict[str, Any],
    filename: str,
    annotated_image_bytes: bytes,
    lang: str = "tr",
) -> bytes:
    """
    Generate a PDF report from inference results.
    Uses reportlab for PDF generation.

    Args:
        result: Inference result dict from ModelService
        filename: Original uploaded filename
        annotated_image_bytes: PNG bytes of annotated image
        lang: Target language ('tr' or 'en')

    Returns:
        PDF file as bytes
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import mm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
        )
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.pdfbase import pdfmetrics
        from pathlib import Path
    except ImportError:
        logger.warning("reportlab not installed. PDF generation unavailable.")
        raise RuntimeError("PDF generation requires reportlab. Install with: pip install reportlab")

    # Register Roboto fonts for full UTF-8 Turkish character support
    font_name = "Helvetica"
    font_bold = "Helvetica-Bold"
    try:
        if Path("Roboto-Regular.ttf").exists():
            pdfmetrics.registerFont(TTFont('Roboto', 'Roboto-Regular.ttf'))
            font_name = 'Roboto'
        if Path("Roboto-Bold.ttf").exists():
            pdfmetrics.registerFont(TTFont('Roboto-Bold', 'Roboto-Bold.ttf'))
            font_bold = 'Roboto-Bold'
    except Exception as e:
        logger.warning(f"Could not load custom fonts: {e}")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles mapped to font
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontName=font_bold,
        fontSize=18,
        textColor=colors.HexColor("#1B5E20"),
        spaceAfter=12,
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontName=font_bold,
        fontSize=13,
        textColor=colors.HexColor("#2E7D32"),
        spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["Normal"],
        fontName=font_name,
        fontSize=10,
        spaceAfter=6,
    )
    bold_body_style = ParagraphStyle(
        "BoldBody",
        parent=body_style,
        fontName=font_bold,
    )
    warning_style = ParagraphStyle(
        "Warning",
        parent=styles["Normal"],
        fontName=font_name,
        fontSize=9,
        textColor=colors.HexColor("#E65100"),
        backColor=colors.HexColor("#FFF3E0"),
        borderPadding=8,
        spaceAfter=12,
    )

    elements = []

    # Dictionary for localized labels
    labels = {
        "title": "Şap Hastalığı AI Analiz Raporu" if lang == "tr" else "FMD AI Analysis Report",
        "date": "Tarih" if lang == "tr" else "Date",
        "file": "Dosya" if lang == "tr" else "File",
        "size": "Boyut" if lang == "tr" else "Size",
        "disclaimer": "⚠ UYARI: Bu rapor yalnızca karar destek amaçlıdır. Kesin tanı için veteriner hekim değerlendirmesi gereklidir." if lang == "tr" else "⚠ WARNING: This report is for decision support only. A veterinarian must confirm the final diagnosis.",
        "interpretation": "Değerlendirme" if lang == "tr" else "Interpretation",
        "summary": "Bulgu Özeti" if lang == "tr" else "Detection Summary",
        "class": "Sınıf" if lang == "tr" else "Class",
        "count": "Adet" if lang == "tr" else "Count",
        "total": "TOPLAM" if lang == "tr" else "TOTAL",
        "no_findings": "Herhangi bir bulgu tespit edilemedi." if lang == "tr" else "No findings detected.",
        "annotated_image": "İşaretlenmiş Görsel" if lang == "tr" else "Annotated Image",
        "bad_image": "Görsel eklenemedi" if lang == "tr" else "Could not embed image.",
        "details": "Detaylı Bulgular" if lang == "tr" else "Detailed Findings",
        "conf": "Güven" if lang == "tr" else "Conf.",
        "position": "Konum (cx, cy)" if lang == "tr" else "Position",
    }

    # Title
    elements.append(Paragraph(labels["title"], title_style))
    elements.append(Spacer(1, 8))

    # Metadata
    now = datetime.now()
    elements.append(Paragraph(f"<b>{labels['date']}:</b> {now.strftime('%Y-%m-%d %H:%M:%S')}", body_style))
    elements.append(Paragraph(f"<b>{labels['file']}:</b> {filename}", body_style))

    original_size = result.get("original_size", {})
    if original_size:
        elements.append(Paragraph(
            f"<b>{labels['size']}:</b> {original_size.get('width', '?')}x{original_size.get('height', '?')} px",
            body_style,
        ))
    elements.append(Spacer(1, 10))

    # Disclaimer
    elements.append(Paragraph(labels["disclaimer"], warning_style))

    # Interpretation
    interp = result.get("interpretation", {})
    elements.append(Paragraph(labels["interpretation"], heading_style))
    
    interp_message = interp.get(f"message_{lang}", "")
    
    if interp.get("level") == "warning":
        elements.append(Paragraph(f"🔴 {interp_message}", body_style))
    elif interp.get("level") == "healthy":
        elements.append(Paragraph(f"🟢 {interp_message}", body_style))
    else:
        elements.append(Paragraph(f"⚪ {interp_message}", body_style))
    elements.append(Spacer(1, 10))

    # Summary table
    elements.append(Paragraph(labels["summary"], heading_style))
    class_counts = result.get("class_counts", {})
    if class_counts:
        table_data = [[labels["class"], labels["count"]]]
        for cls_name, count in class_counts.items():
            table_data.append([cls_name, str(count)])
        table_data.append([labels["total"], str(result.get("total_detections", 0))])

        table = Table(table_data, colWidths=[100 * mm, 40 * mm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8F5E9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1B5E20")),
            ("FONTNAME", (0, 0), (-1, 0), font_bold),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C8E6C9")),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#F1F8E9")),
            ("FONTNAME", (0, 1), (-1, -2), font_name), # Body rows font
            ("FONTNAME", (0, -1), (-1, -1), font_bold), # Total row font
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(table)
    else:
        elements.append(Paragraph(labels["no_findings"], body_style))

    elements.append(Spacer(1, 12))

    # Annotated image
    elements.append(Paragraph(labels["annotated_image"], heading_style))
    if annotated_image_bytes:
        img_io = io.BytesIO(annotated_image_bytes)
        try:
            img = RLImage(img_io)
            # Scale to fit page width
            max_width = 160 * mm
            aspect = img.imageWidth / img.imageHeight if img.imageHeight > 0 else 1
            img.drawWidth = max_width
            img.drawHeight = max_width / aspect
            # Cap height
            max_height = 120 * mm
            if img.drawHeight > max_height:
                img.drawHeight = max_height
                img.drawWidth = max_height * aspect
            elements.append(img)
        except Exception as e:
            logger.warning(f"Could not embed image in PDF: {e}")
            elements.append(Paragraph(labels["bad_image"], body_style))

    elements.append(Spacer(1, 12))

    # Detailed detections table
    detections = result.get("detections", [])
    if detections:
        elements.append(Paragraph(labels["details"], heading_style))

        det_table_data = [["#", labels["class"], labels["conf"], labels["position"]]]
        for d in detections:
            xywhr = d.get("xywhr", [0, 0, 0, 0, 0])
            cx, cy = round(xywhr[0], 1), round(xywhr[1], 1)
            det_table_data.append([
                str(d["id"] + 1),
                d["class_name"],
                f"{d['confidence']:.1%}",
                f"({cx}, {cy})",
            ])

        det_table = Table(det_table_data, colWidths=[12 * mm, 50 * mm, 30 * mm, 50 * mm])
        det_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8F5E9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1B5E20")),
            ("FONTNAME", (0, 0), (-1, 0), font_bold),
            ("FONTNAME", (0, 1), (-1, -1), font_name),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C8E6C9")),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (2, 0), (2, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(det_table)

    # Build PDF
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    logger.info(f"PDF report generated: {len(pdf_bytes)} bytes")
    return pdf_bytes

