@echo off
title FMD System — Stopping Services
echo.
echo  [!] Stopping FMD AI services...
echo.

:: Terminate Python (Backend) processes
taskkill /f /im python.exe /t >nul 2>&1

:: Terminate Node/Vite (Frontend) processes
taskkill /f /im node.exe /t >nul 2>&1

echo  [OK] All services have been stopped.
echo.
timeout /t 3
