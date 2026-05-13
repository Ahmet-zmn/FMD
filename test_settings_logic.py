from pathlib import Path
import json

def test_logic():
    # Simulate settings.py logic
    # Uses relative paths from the project root
    
    project_root = Path(__file__).resolve().parent
    weights_dir = project_root / "weights"
    config_path = weights_dir / "models.json"
    
    print(f"Project root: {project_root}")
    print(f"Config path: {config_path}")
    print(f"Exists: {config_path.exists()}")
    
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            models_config = json.load(f)
        
        for model in models_config:
            model_full_path = project_root / model["path"]
            print(f"Model: {model['name']}, Path: {model_full_path}, Exists: {model_full_path.exists()}")

if __name__ == "__main__":
    test_logic()
