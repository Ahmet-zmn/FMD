import os
from pathlib import Path
from ultralytics import YOLO

def check_labels():
    weights_dir = Path("..") / "weights"
    
    for root, dirs, files in os.walk(weights_dir):
        for file in files:
            if file.endswith((".pt", ".onnx")):
                model_path = os.path.join(root, file)
                print(f"\nChecking model: {model_path}")
                try:
                    model = YOLO(model_path)
                    print(f"Task: {model.task}")
                    print(f"Classes: {model.names}")
                except Exception as e:
                    print(f"Error loading {model_path}: {e}")

if __name__ == "__main__":
    check_labels()
