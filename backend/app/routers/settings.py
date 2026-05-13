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
    """List available models from models.json and check existence."""
    import json
    
    # Yerel calisma (QuickStart.bat) icin yol ayari
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    weights_dir = project_root / "weights"
    config_path = weights_dir / "models.json"
    
    # Docker ortami kontrolu (opsiyonel fallback)
    if not weights_dir.exists():
        weights_dir = Path("/app/weights")
        project_root = Path("/app")
        config_path = weights_dir / "models.json"
    
    available_models = []
    
    # Check for TensorRT availability
    has_tensorrt = importlib.util.find_spec("tensorrt") is not None
    # Check for OpenVINO availability
    has_openvino = importlib.util.find_spec("openvino") is not None

    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                models_config = json.load(f)
            
            for model in models_config:
                # Safeguard: check for library support
                if model.get("type") == "engine" and not has_tensorrt:
                    continue
                if model.get("type") == "openvino" and not has_openvino:
                    continue
                
                # Check if model exists on disk
                # Paths in models.json are relative to project root (e.g., "weights/pt/yolo11n.pt")
                model_full_path = project_root / model["path"]
                model["exists"] = model_full_path.exists()
                
                available_models.append(model)
        except Exception as e:
            print(f"Error reading models.json: {e}")
            # Fallback to empty list or basic scan if needed
    
    # If models.json doesn't exist or is empty, we could fallback to the old scanning logic
    # but the user explicitly asked for this file.

    # Check device availability
    devices = ["cpu"]
    if torch.cuda.is_available():
        devices.append("cuda")
        # Add specific GPU indices
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
        # Yerel calisma (QuickStart.bat) icin yol ayari
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        if not (project_root / "weights").exists():
            project_root = Path("/app") # Docker fallback
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
