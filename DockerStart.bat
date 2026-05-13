@echo off
echo ============================================================
echo      FMD AI Diagnosis System — Docker Launcher
echo ============================================================
echo.
echo [1/2] Checking Docker service...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found! Please install and start Docker Desktop.
    pause
    exit /b
)

echo [2/2] Building and starting the system (first run may take a while)...
docker-compose up --build

echo.
echo System stopped.
pause
