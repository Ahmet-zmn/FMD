@echo off
echo ============================================================
echo      FMD AI Diagnosis System - Docker Launcher
echo ============================================================
echo.
echo [1/2] Docker servisi kontrol ediliyor...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Docker bulunamadi! Lutfen Docker Desktop'i kurun ve calistirin.
    pause
    exit /b
)

echo [2/2] Sistem ayaga kaldiriliyor (Bu islem ilk seferde vakit alabilir)...
docker-compose up --build

echo.
echo Sistem durduruldu.
pause
