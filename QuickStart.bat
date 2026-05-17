@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   FMD AI Diagnosis System - Automated Launcher ^& Setup
echo ============================================================
echo.

:: Check if /setup flag is passed
set SETUP_ONLY=0
if "%1"=="/setup" set SETUP_ONLY=1
if "%1"=="--setup" set SETUP_ONLY=1
if "%1"=="-setup" set SETUP_ONLY=1

:: Create weights subdirectories if they don't exist
if not exist "weights" mkdir "weights"
if not exist "weights\pt" mkdir "weights\pt"
if not exist "weights\onnx" mkdir "weights\onnx"
if not exist "weights\engine" mkdir "weights\engine"
if not exist "weights\openvino" mkdir "weights\openvino"

:: 1. Check Python installation
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo [HATA] Python kurulu degil veya PATH'e eklenmemis.
    echo.
    echo Lutfen Python 3.10+ yukleyin ve kurulum ekraninda "Add Python to PATH" secenegini isaretleyin.
    echo Please install Python 3.10+ and check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

:: 2. Check Node.js installation (only warning if missing, but required for frontend)
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Node.js/npm is not installed or not added to PATH.
    echo [UYARI] Node.js/npm kurulu degil veya PATH'e eklenmemis.
    echo Frontend calismayabilir. Lutfen Node.js kurun.
    echo Frontend might not work. Please install Node.js.
    echo.
)

:: 3. Install backend dependencies globally if not installed
if not exist "backend\.installed" (
    echo [*] Installing backend dependencies to global Python...
    echo [*] Python kutuphaneleri sisteme kuruluyor (requirements.txt)...
    echo [*] Bu islem internet hiziniz ve donaniminiza bagli olarak 1-2 dakika surebilir...
    python -m pip install -r backend\requirements.txt
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Failed to install Python dependencies.
        echo [HATA] Python kutuphaneleri kurulurken hata olustu.
        pause
        exit /b 1
    )
    echo. > backend\.installed
    echo [*] Python dependencies installed successfully.
)

:: 4. Install frontend dependencies (node_modules)
if not exist "frontend\node_modules" (
    echo [*] Frontend dependencies (node_modules) not found. Installing...
    echo [*] Frontend paketleri kuruluyor (npm install)...
    cd frontend
    call npm install
    if !ERRORLEVEL! neq 0 (
        echo [WARNING] Failed to install frontend dependencies.
        echo [UYARI] Frontend paketleri kurulurken hata olustu.
    )
    cd ..
    echo [*] Frontend dependencies installed successfully.
)

:: If setup-only, exit here
if %SETUP_ONLY%==1 (
    echo.
    echo ============================================================
    echo   Setup Completed Successfully! / Kurulum Basariyla Tamamlandi!
    echo ============================================================
    echo.
    timeout /t 3 > nul
    exit /b 0
)

:: Start Backend
echo [*] Starting Backend Server...
start "FMD Backend" /D "backend" cmd /c "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: Wait a bit for backend
timeout /t 5 /nobreak > nul

:: Start Frontend
echo [*] Starting Frontend Server...
start "FMD Frontend" /D "frontend" cmd /c "npm run dev"

:: Open QuickStart HTML
echo [*] Opening Dashboard...
start QuickStart.html

echo.
echo ============================================================
echo   Sistem baslatildi. Lutfen acilan pencereleri kapatmayin.
echo   System started. Please do not close the opened console windows.
echo ============================================================
echo.
pause
