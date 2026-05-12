"""
OBB (Oriented Bounding Box) drawing utilities.
Renders rotated bounding boxes on images using OpenCV polylines.
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple

# Professional color palette for each class — (B, G, R) format for OpenCV
# Professional color palette — keys should match or be close to model labels
CLASS_COLORS: Dict[str, Tuple[int, int, int]] = {
    "Mouth Saliva":   (0, 165, 255),
    "Mouth Sores":    (0, 0, 220),
    "Nail Sores":     (0, 0, 180),
    "Head":           (200, 150, 50),
    "Healthy Mouth":  (0, 180, 0),
    "Healthy Nails":  (0, 200, 100),
}

# Fallback color
DEFAULT_COLOR = (180, 180, 0)


def get_class_color(class_name: str) -> Tuple[int, int, int]:
    """Get the BGR color for a given class name."""
    return CLASS_COLORS.get(class_name, DEFAULT_COLOR)


def draw_obb_detections(
    image: np.ndarray,
    detections: List[Dict],
) -> np.ndarray:
    """
    Draw oriented bounding boxes on the image.

    Args:
        image: Original image as numpy array (BGR)
        detections: List of detection dicts, each containing:
            - class_name: str
            - confidence: float
            - polygon: list of 4 (x, y) corner points

    Returns:
        Annotated image with OBBs drawn
    """
    annotated = image.copy()
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.55
    thickness = 2
    label_thickness = 1

    for det in detections:
        class_name = det["class_name"]
        confidence = det["confidence"]
        polygon = np.array(det["polygon"], dtype=np.int32)
        color = get_class_color(class_name)

        # Draw the rotated bounding box as a closed polygon
        cv2.polylines(
            annotated,
            [polygon.reshape((-1, 1, 2))],
            isClosed=True,
            color=color,
            thickness=thickness,
        )

        # Prepare label text
        label = f"{class_name} {confidence:.0%}"
        (label_w, label_h), baseline = cv2.getTextSize(label, font, font_scale, label_thickness)

        # Position label at the top-left corner of the polygon
        top_left = polygon[0]
        label_x = int(top_left[0])
        label_y = int(top_left[1]) - 8

        # Ensure label stays within image bounds
        label_y = max(label_h + 4, label_y)
        label_x = max(0, min(label_x, annotated.shape[1] - label_w - 4))

        # Draw label background
        cv2.rectangle(
            annotated,
            (label_x - 2, label_y - label_h - 4),
            (label_x + label_w + 4, label_y + baseline + 2),
            color,
            cv2.FILLED,
        )

        # Draw label text in white
        cv2.putText(
            annotated,
            label,
            (label_x, label_y),
            font,
            font_scale,
            (255, 255, 255),
            label_thickness,
            cv2.LINE_AA,
        )

    return annotated
