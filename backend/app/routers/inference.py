import uuid
import os
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response, JSONResponse

from app.config import settings
from app.services.model_service import model_service
from app.services.report_service import generate_json_report, generate_pdf_report
from app.utils.validation import validate_upload, validate_file_size

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Inference"])

# In-memory result store (per-session; for production, use Redis or a DB)
_results_store: dict = {}


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Run FMD lesion detection on an uploaded image.

    Accepts: JPG, JPEG, PNG (max 10MB by default)
    Returns: Structured JSON with detections, class counts, interpretation,
             and links to download annotated image and reports.
    """
    # Validate file type
    validate_upload(file)

    # Read file content
    content = await file.read()

    # Validate file size
    validate_file_size(content)

    # Check model is ready
    if not model_service.is_loaded():
        raise HTTPException(status_code=503, detail="Model is not loaded. Please try again later.")

    # Run inference
    try:
        result = model_service.predict(content)
    except ValueError as e:
        logger.error(f"Inference value error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analiz sırasında bir hata oluştu / Inference failed.")

    # Generate a unique result ID
    result_id = str(uuid.uuid4())[:8]

    # Store annotated image and result for download endpoints
    _results_store[result_id] = {
        "annotated_image": result["annotated_image"],
        "original_filename": file.filename or "image.jpg",
        "result": {
            "detections": result["detections"],
            "class_counts": result["class_counts"],
            "interpretation": result["interpretation"],
            "total_detections": result["total_detections"],
            "original_size": result["original_size"],
            "model_name": result["model_name"],
            "inference_time_ms": result["inference_time_ms"],
        },
    }

    # Keep only last 50 results to avoid memory issues
    if len(_results_store) > 50:
        oldest_key = next(iter(_results_store))
        del _results_store[oldest_key]

    logger.info(f"Prediction complete: id={result_id}, detections={result['total_detections']}, latency={result['inference_time_ms']}ms")

    return {
        "result_id": result_id,
        "detections": result["detections"],
        "class_counts": result["class_counts"],
        "interpretation": result["interpretation"],
        "total_detections": result["total_detections"],
        "original_size": result["original_size"],
        "model_name": result["model_name"],
        "inference_time_ms": result["inference_time_ms"],
        "download_links": {
            "annotated_image": f"/api/predict/{result_id}/image",
            "report_json": f"/api/predict/{result_id}/report",
            "report_pdf": f"/api/predict/{result_id}/report/pdf",
        },
    }


@router.post("/predict/stream")
async def predict_stream(file: UploadFile = File(...)):
    """
    Optimized endpoint for real-time video stream frames.
    Skips report generation and storage for maximum performance.
    """
    if not model_service.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")

    content = await file.read()
    
    try:
        # Run inference (no_annotation=True to speed up if supported)
        result = model_service.predict(content)
        
        return {
            "detections": result["detections"],
            "inference_time_ms": result["inference_time_ms"],
            "model_name": result["model_name"]
        }
    except Exception as e:
        logger.error(f"Stream inference error: {e}")
        raise HTTPException(status_code=500, detail="Stream failed")


@router.get("/predict/{result_id}/image")
async def get_annotated_image(result_id: str):
    """Download the annotated image."""
    if result_id not in _results_store:
        raise HTTPException(status_code=404, detail="Result not found.")

    image_bytes = _results_store[result_id]["annotated_image"]
    filename = f"sap-analiz-{result_id}.png"

    return Response(
        content=image_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/predict/{result_id}/report")
async def get_json_report(result_id: str):
    """Download the JSON report."""
    if result_id not in _results_store:
        raise HTTPException(status_code=404, detail="Result not found.")

    stored = _results_store[result_id]
    report_json = generate_json_report(stored["result"], stored["original_filename"])
    filename = f"sap-analiz-raporu-{result_id}.json"

    return Response(
        content=report_json.encode("utf-8"),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/predict/{result_id}/report/pdf")
async def get_pdf_report(result_id: str, lang: str = "tr"):
    """Download the PDF report."""
    if result_id not in _results_store:
        raise HTTPException(status_code=404, detail="Result not found.")

    stored = _results_store[result_id]
    try:
        pdf_bytes = generate_pdf_report(
            result=stored["result"],
            filename=stored["original_filename"],
            annotated_image_bytes=stored["annotated_image"],
            lang=lang,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=501, detail=str(e))

    filename = f"sap-analiz-raporu-{result_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
