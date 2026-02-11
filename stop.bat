@echo off
title Stop embyIL Bot
color 0C
echo ================================================
echo    Stopping embyIL Bot
echo ================================================
echo.

tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Stopping all node.exe processes...
    taskkill /F /IM node.exe /T
    echo.
    echo ✓ Bot stopped successfully!
) else (
    echo No running bot instances found.
)

echo.
echo ================================================
pause
