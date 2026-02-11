# PowerShell Start Script for embyIL Bot
Write-Host "================================================" -ForegroundColor Green
Write-Host "   embyIL Unified App Starter" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Stop any existing bot instances
Write-Host "[0/3] Checking for existing bot instances..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) node.exe process(es). Stopping them..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Old instances stopped." -ForegroundColor Green
} else {
    Write-Host "No existing instances found." -ForegroundColor Green
}
Write-Host ""

# Install dependencies
Write-Host "[1/3] Checking and installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: npm install failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Verify environment
Write-Host "[2/3] Verifying environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure your bot token." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Environment file found." -ForegroundColor Green
Write-Host ""

# Start the bot
Write-Host "================================================" -ForegroundColor Green
Write-Host "[3/3] Starting embyIL Bot + Dashboard..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Bot Status: Starting..." -ForegroundColor Yellow
Write-Host "Dashboard: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

node app.js
