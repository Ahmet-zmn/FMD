"""
Backend tests — Health check endpoint.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_root():
    """Test root endpoint returns app info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "app" in data
    assert "version" in data


def test_health():
    """Test health endpoint returns status and model info."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "model_loaded" in data


def test_predict_no_file():
    """Test predict endpoint rejects requests without a file."""
    response = client.post("/api/predict")
    assert response.status_code == 422  # Validation error


def test_predict_invalid_file_type():
    """Test predict endpoint rejects non-image files."""
    from io import BytesIO
    fake_file = BytesIO(b"not an image")
    response = client.post(
        "/api/predict",
        files={"file": ("test.txt", fake_file, "text/plain")},
    )
    assert response.status_code == 400


def test_predict_result_not_found():
    """Test download endpoints return 404 for unknown result IDs."""
    response = client.get("/api/predict/nonexistent/image")
    assert response.status_code == 404

    response = client.get("/api/predict/nonexistent/report")
    assert response.status_code == 404
