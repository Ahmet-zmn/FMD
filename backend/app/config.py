"""
Application configuration using pydantic-settings.
All settings can be overridden via environment variables or .env file.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings with defaults suitable for local development."""

    # --- Model ---
    MODEL_PATH: str = str(Path(__file__).resolve().parent.parent.parent / "weights" / "onnx" / "yolo11n.onnx")
    DEFAULT_DEVICE: str = "cpu"
    CONFIDENCE_THRESHOLD: float = 0.15
    IOU_THRESHOLD: float = 0.45

    # --- Upload ---
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png"]

    # --- Server ---
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:5173", 
        "https://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://192.168.1.115:5173"
    ]

    # --- Logging ---
    LOG_LEVEL: str = "INFO"

    # --- Storage ---
    # Temp directory for inference results (annotated images, reports)
    RESULTS_DIR: str = str(Path(__file__).resolve().parent.parent / "results")

    # --- App Info ---
    APP_NAME: str = "FMD AI Diagnosis System"
    APP_VERSION: str = "1.0.0"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


# Singleton settings instance
settings = Settings()

# Ensure results directory exists
os.makedirs(settings.RESULTS_DIR, exist_ok=True)

# Ensure weights directories exist
WEIGHTS_DIR = Path(__file__).resolve().parent.parent.parent / "weights"
for fmt in ["pt", "onnx", "engine", "openvino"]:
    os.makedirs(WEIGHTS_DIR / fmt, exist_ok=True)
