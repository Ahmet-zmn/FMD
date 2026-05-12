"""
Backend tests — Inference endpoint integration test.
Requires a valid model file to be present.
"""

import pytest
import os
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _create_test_image() -> bytes:
    """Create a minimal valid JPEG image for testing."""
    import numpy as np
    import cv2
    # Create a simple 100x100 test image
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    img[20:80, 20:80] = (0, 200, 0)  # Green rectangle
    success, buffer = cv2.imencode(".jpg", img)
    return buffer.tobytes()


@pytest.fixture
def test_image_bytes():
    return _create_test_image()


def test_predict_with_image(test_image_bytes):
    """
    Test the predict endpoint with a valid image.
    This test will only pass if the model is correctly loaded.
    """
    from app.services.model_service import model_service
    if not model_service.is_loaded():
        pytest.skip("Model not loaded — skipping inference test.")

    from io import BytesIO
    response = client.post(
        "/api/predict",
        files={"file": ("test.jpg", BytesIO(test_image_bytes), "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()

    # Check response structure
    assert "result_id" in data
    assert "detections" in data
    assert "class_counts" in data
    assert "interpretation" in data
    assert "total_detections" in data
    assert "download_links" in data

    # Verify download links are accessible
    result_id = data["result_id"]

    # Test annotated image download
    img_response = client.get(f"/api/predict/{result_id}/image")
    assert img_response.status_code == 200
    assert img_response.headers["content-type"] == "image/png"

    # Test JSON report download
    json_response = client.get(f"/api/predict/{result_id}/report")
    assert json_response.status_code == 200


def test_predict_large_file():
    """Test that files exceeding the size limit are rejected."""
    from io import BytesIO
    from app.config import settings

    # Create a file just over the limit
    size = (settings.MAX_FILE_SIZE_MB * 1024 * 1024) + 1024
    large_content = b"\x00" * size
    response = client.post(
        "/api/predict",
        files={"file": ("large.jpg", BytesIO(large_content), "image/jpeg")},
    )
    assert response.status_code == 413
