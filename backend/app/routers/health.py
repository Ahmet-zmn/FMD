"""
Health check endpoint.
"""

from fastapi import APIRouter
import socket
from app.services.model_service import model_service

router = APIRouter(prefix="/api", tags=["Health"])

def get_lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

import psutil
import platform
import torch

@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    Returns system status, whether the model is loaded, server LAN IP, and hardware info.
    """
    gpu_info = "None"
    if torch.cuda.is_available():
        gpu_info = torch.cuda.get_device_name(0)
    
    system_info = {
        "cpu": platform.processor(),
        "gpu": gpu_info,
        "ram": f"{round(psutil.virtual_memory().total / (1024**3), 2)} GB",
        "os": f"{platform.system()} {platform.release()}",
        "cuda_available": torch.cuda.is_available()
    }
    
    return {
        "status": "ok",
        "model_loaded": model_service.is_loaded(),
        "model_classes": model_service.class_names if model_service.is_loaded() else {},
        "lan_ip": get_lan_ip(),
        "system_info": system_info
    }

