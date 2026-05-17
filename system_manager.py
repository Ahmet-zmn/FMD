import subprocess
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI()

# Tarayıcıdan gelen isteklere izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parent

@app.post("/start")
async def start_system():
    try:
        # QuickStart.bat dosyasını yeni bir pencerede çalıştır
        subprocess.Popen(["cmd", "/c", "QuickStart.bat"], cwd=str(PROJECT_ROOT), creationflags=subprocess.CREATE_NEW_CONSOLE)
        return {"status": "success", "message": "Sistem başlatılıyor..."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/stop")
async def stop_system():
    try:
        # Docker konteynerlarını durdur
        subprocess.run(["docker-compose", "down"], cwd=str(PROJECT_ROOT), shell=True)
        return {"status": "success", "message": "Sistem durduruldu."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/health")
async def health():
    return {"status": "alive"}

if __name__ == "__main__":
    print("--- FMD Sistem Yöneticisi Çalışıyor (Port: 8989) ---")
    uvicorn.run(app, host="127.0.0.1", port=8989, log_level="error")
