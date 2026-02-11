@echo off
title embyIL - Telegram Bot + Dashboard
color 0A
echo ================================================
echo    embyIL Unified App Starter
echo ================================================
echo.

REM Stop any existing bot instances
echo [0/3] Checking for existing bot instances...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Found existing node.exe processes. Stopping them...
    taskkill /F /IM node.exe /T >NUL 2>&1
    timeout /t 2 /nobreak >NUL
    echo Old instances stopped.
) else (
    echo No existing instances found.
)
echo.

echo [1/3] Checking and installing dependencies...
npm install
if errorlevel 1 (
    echo.
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

echo [2/3] Verifying environment configuration...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and configure your bot token.
    pause
    exit /b 1
)
echo Environment file found.
echo.

echo ================================================
echo [3/3] Starting embyIL Bot + Dashboard...
echo ================================================
echo.
echo Bot Status: Starting...
echo Dashboard: http://localhost:3000
echo.
echo Press Ctrl+C to stop the application
echo ================================================
echo.
node app.js
