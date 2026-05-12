from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from pathlib import Path
import torch
import importlib.util

from app.services.model_service import model_service
from app.config import settings

router = APIRouter(prefix="/api/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    model_path: str
    device: str

@router.get("/available")
async def get_available_settings():
    """List available models and device capabilities."""
    weights_dir = Path(__file__).resolve().parent.parent.parent.parent / "weights"
    
    available_models = []
    
    # Check for TensorRT availability
    has_tensorrt = importlib.util.find_spec("tensorrt") is not None
    
    # Check for OpenVINO availability
    has_openvino = importlib.util.find_spec("openvino") is not None

    # Walk through weights directory to find supported model files
    for root, dirs, files in os.walk(weights_dir):
        # Check for files
        for file in files:
            # Safeguard: check for TensorRT if it's an .engine file
            if file.endswith(".engine") and not has_tensorrt:
                continue
                
            if file.endswith((".pt", ".onnx", ".engine")):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, weights_dir.parent)
                ext = file.split(".")[-1]
                
                # Determine supported devices
                supported = ["cpu"]
                if ext == "pt": supported = ["cpu", "cuda"]
                elif ext == "onnx": supported = ["cpu", "cuda"]
                elif ext == "engine": supported = ["cuda"]
                
                available_models.append({
                    "name": file,
                    "path": rel_path,
                    "type": ext,
                    "supported_devices": supported
                })
        
        # Check for OpenVINO directories
        for d in dirs:
            if d.endswith("_openvino_model"):
                # Safeguard: check for OpenVINO if it's an openvino model
                if not has_openvino:
                    continue
                    
                full_path = os.path.join(root, d)
                rel_path = os.path.relpath(full_path, weights_dir.parent)
                available_models.append({
                    "name": d.replace("_openvino_model", ""),
                    "path": rel_path,
                    "type": "openvino",
                    "supported_devices": ["cpu"]
                })

    # Check device availability
    devices = ["cpu"]
    if torch.cuda.is_available():
        devices.append("cuda")
        # Add specific GPU indices if needed
        for i in range(torch.cuda.device_count()):
            devices.append(f"cuda:{i}")
            
    return {
        "models": available_models,
        "devices": devices,
        "current": {
            "model_path": model_service.model_path,
            "device": model_service.device
        }
    }

@router.post("/update")
async def update_settings(update: SettingsUpdate):
    """Change the active model and device."""
    try:
        # Resolve path relative to the project root if it's not absolute
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        target_path = Path(update.model_path)
        
        if not target_path.is_absolute():
            target_path = project_root / update.model_path
            
        if not target_path.exists():
             raise HTTPException(status_code=404, detail=f"Model file not found: {update.model_path}")

        model_service.load_model(model_path=str(target_path), device=update.device)
        
        return {
            "status": "success",
            "message": f"Model loaded: {target_path.name} on {update.device}",
            "current": {
                "model_path": update.model_path,
                "device": update.device
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/current")
async def get_current_settings():
    """Get current active model and device."""
    return {
        "model_path": model_service.model_path,
        "device": model_service.device,
        "is_loaded": model_service.is_loaded()
    }
