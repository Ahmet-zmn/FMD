"""
YOLO Model Service — Handles model loading and OBB inference.
Designed to be modular: swap the model file without changing the API layer.
"""

import io
import logging
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Any
import time
from ultralytics import YOLO

from app.config import settings
from app.utils.drawing import draw_obb_detections

logger = logging.getLogger(__name__)


class ModelService:
    """
    Singleton-style service for loading a YOLO OBB model and running inference.
    The model is loaded once at application startup and reused for all requests.
    """

    def __init__(self):
        self.model: Optional[YOLO] = None
        self.model_path: str = settings.MODEL_PATH
        self.device: str = settings.DEFAULT_DEVICE
        self.confidence_threshold: float = settings.CONFIDENCE_THRESHOLD
        self.iou_threshold: float = settings.IOU_THRESHOLD
        self.class_names: Dict[int, str] = {}

    def load_model(self, model_path: Optional[str] = None, device: Optional[str] = None) -> None:
        """
        Load the YOLO model from the specified path on the specified device.
        If path or device are not provided, uses current/default values.
        """
        if model_path:
            self.model_path = model_path
        if device:
            self.device = device

        target_path = Path(self.model_path)
        if not target_path.exists():
            model_name = target_path.name
            # Map model filenames to their direct Zenodo download URLs
            ZENODO_MAPPING = {
                "yolo11n.onnx": "https://zenodo.org/records/20171884/files/yolo11n.onnx?download=1",
                "yolo11s.onnx": "https://zenodo.org/records/20171884/files/yolo11s.onnx?download=1",
                "yolo11m.onnx": "https://zenodo.org/records/20171884/files/yolo11m.onnx?download=1",
                "yolo11l.onnx": "https://zenodo.org/records/20171884/files/yolo11l.onnx?download=1",
                "yolo26n.onnx": "https://zenodo.org/records/20171884/files/yolo26n.onnx?download=1",
                "yolo26s.onnx": "https://zenodo.org/records/20171884/files/yolo26s.onnx?download=1",
                "yolo26m.onnx": "https://zenodo.org/records/20171884/files/yolo26m.onnx?download=1",
                "yolo26l.onnx": "https://zenodo.org/records/20171884/files/yolo26l.onnx?download=1",
                "yolo11n.pt": "https://zenodo.org/records/20171884/files/yolo11n.pt?download=1",
                "yolo11s.pt": "https://zenodo.org/records/20171884/files/yolo11s.pt?download=1",
                "yolo11m.pt": "https://zenodo.org/records/20171884/files/yolo11m.pt?download=1",
                "yolo11l.pt": "https://zenodo.org/records/20171884/files/yolo11l.pt?download=1",
                "yolo26n.pt": "https://zenodo.org/records/20171884/files/yolo26n.pt?download=1",
                "yolo26s.pt": "https://zenodo.org/records/20171884/files/yolo26s.pt?download=1",
                "yolo26m.pt": "https://zenodo.org/records/20171884/files/yolo26m.pt?download=1",
                "yolo26l.pt": "https://zenodo.org/records/20171884/files/yolo26l.pt?download=1"
            }
            
            if model_name in ZENODO_MAPPING:
                logger.info(f"Model file missing. Automatically downloading {model_name} from Zenodo...")
                download_url = ZENODO_MAPPING[model_name]
                try:
                    import urllib.request
                    target_path.parent.mkdir(parents=True, exist_ok=True)
                    logger.info(f"Downloading from: {download_url} to: {target_path}")
                    urllib.request.urlretrieve(download_url, str(target_path))
                    logger.info(f"Successfully downloaded {model_name} directly to {target_path.parent}!")
                except Exception as e:
                    logger.error(f"Failed to automatically download model from Zenodo: {e}")
                    raise FileNotFoundError(f"Model file not found at: {target_path} and automated download failed: {e}")
            else:
                logger.error(f"Model file not found at: {target_path}")
                raise FileNotFoundError(f"Model file not found at: {target_path}")

        logger.info(f"Loading YOLO model from: {target_path} on device: {self.device}")
        
        # Load model
        # Explicitly specify task='obb' for exported formats (ONNX, OpenVINO, Engine)
        # because Ultralytics often fails to guess it from the file metadata.
        if target_path.suffix == '.pt':
            self.model = YOLO(str(target_path))
            self.model.to(self.device)
        else:
            self.model = YOLO(str(target_path), task='obb')
        
        self.class_names = self.model.names
        logger.info(f"Model loaded successfully. Task: {self.model.task}. Classes: {self.class_names}")

    def is_loaded(self) -> bool:
        """Check if the model is loaded."""
        return self.model is not None

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Run OBB inference on the provided image bytes.
        """
        if not self.is_loaded():
            raise RuntimeError("Model is not loaded. Call load_model() first.")

        # Decode image from bytes
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Could not decode image. File may be corrupted.")

        original_h, original_w = image.shape[:2]
        logger.info(f"Running inference on image: {original_w}x{original_h}")

        # Run YOLO inference
        start_time = time.perf_counter()
        results = self.model.predict(
            source=image,
            conf=self.confidence_threshold,
            iou=self.iou_threshold,
            device=self.device,
            verbose=False,
        )
        inference_time = (time.perf_counter() - start_time) * 1000

        detections = []
        class_counts: Dict[str, int] = {}

        if results and len(results) > 0:
            result = results[0]

            # Reverting strictly to OBB as per original code
            if hasattr(result, 'obb') and result.obb is not None and len(result.obb) > 0:
                obb_data = result.obb
                polygons = obb_data.xyxyxyxy.cpu().numpy()
                classes = obb_data.cls.cpu().numpy()
                confidences = obb_data.conf.cpu().numpy()
                xywhr = obb_data.xywhr.cpu().numpy()

                for i in range(len(classes)):
                    class_id = int(classes[i])
                    class_name = self.class_names.get(class_id, f"class_{class_id}")
                    confidence = float(confidences[i])
                    
                    detections.append({
                        "id": i,
                        "class_id": class_id,
                        "class_name": class_name,
                        "confidence": float(round(confidence, 4)),
                        "polygon": polygons[i].astype(float).tolist(),
                        "xywhr": xywhr[i].astype(float).tolist(),
                    })
                    class_counts[class_name] = class_counts.get(class_name, 0) + 1

        # Draw annotated image
        annotated_image = draw_obb_detections(image, detections)

        # Encode annotated image
        success, buffer = cv2.imencode(".png", annotated_image)
        if not success:
            raise RuntimeError("Failed to encode annotated image.")
        annotated_bytes = buffer.tobytes()

        # Generate interpretation
        interpretation = self._interpret(detections, class_counts)

        return {
            "detections": detections,
            "annotated_image": annotated_bytes,
            "class_counts": class_counts,
            "interpretation": interpretation,
            "total_detections": len(detections),
            "original_size": {"width": original_w, "height": original_h},
            "model_name": Path(self.model_path).name,
            "inference_time_ms": round(inference_time, 2),
        }

    def _interpret(self, detections: List[Dict], class_counts: Dict[str, int]) -> Dict[str, Any]:
        """
        Strict interpretation based on model classes.
        """
        suspicious_classes = {"Mouth Saliva", "Mouth Sores", "Nail Sores"}
        
        suspicious_count = 0
        for cls_name, count in class_counts.items():
            if cls_name in suspicious_classes:
                suspicious_count += count

        healthy_count = sum(class_counts.values()) - suspicious_count

        if suspicious_count > 0:
            level = "warning"
            message_tr = f"{suspicious_count} adet belirti saptandı. Şap hastalığı bulguları olabilir. Veteriner hekim değerlendirmesi gereklidir."
            message_en = f"{suspicious_count} symptom(s) detected. Possible signs of FMD. Veterinary evaluation required."
        else:
            level = "healthy"
            message_tr = "Herhangi bir hastalık bulgusuna rastlanmadı. Sağlıklı görünüyor."
            message_en = "No disease findings detected. Appears healthy."

        return {
            "level": level,
            "message_tr": message_tr,
            "message_en": message_en,
            "suspicious_count": suspicious_count,
            "healthy_count": healthy_count,
        }


# Global singleton instance
model_service = ModelService()
