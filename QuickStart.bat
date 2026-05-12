@echo off
setlocal

echo ============================================================
echo   FMD AI Diagnosis System - Quick Launcher
echo ============================================================

:: Check for backend venv
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Backend virtual environment not found in backend\venv.
    echo Please create it or run 'pip install -r requirements.txt' in backend folder.
    pause
    exit /b 1
)

:: Start Backend
echo [*] Starting Backend Server...
start "FMD Backend" /D "backend" cmd /c ".\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: Wait a bit for backend
timeout /t 3 /nobreak > nul

:: Start Frontend
echo [*] Starting Frontend Server...
start "FMD Frontend" /D "frontend" cmd /c "npm run dev"

:: Open QuickStart HTML
echo [*] Opening QuickStart Dashboard...
start QuickStart.html

echo.
echo ============================================================
echo   Servers are starting in separate windows.
echo   You can now use the QuickStart dashboard or go to:
echo   https://localhost:5173
echo ============================================================
echo.
pause
