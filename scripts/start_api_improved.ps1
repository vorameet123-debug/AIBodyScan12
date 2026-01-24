# Improved API Startup Script for PowerShell
# This script ensures the correct Python environment is used

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Fashion Intelligence API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory (project root)
$ScriptDir = Split-Path -Parent $PSScriptRoot
Set-Location $ScriptDir

# Check if we're in the right directory
if (-not (Test-Path "api\app.py")) {
    Write-Host "ERROR: Cannot find api\app.py" -ForegroundColor Red
    Write-Host "Current directory: $PWD" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Use conda Python (adjust path if needed)
$PythonPath = "C:\Users\voram\miniconda3\python.exe"

# Verify Python exists
if (-not (Test-Path $PythonPath)) {
    Write-Host "ERROR: Python not found at $PythonPath" -ForegroundColor Red
    Write-Host "Please update PYTHON_PATH in this script" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if FastAPI is installed
Write-Host "Checking Python environment..." -ForegroundColor Yellow
try {
    & $PythonPath -c "import fastapi" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "FastAPI not installed"
    }
} catch {
    Write-Host "ERROR: FastAPI is not installed in this Python environment" -ForegroundColor Red
    Write-Host "Please install dependencies: pip install -r api\requirements.txt" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Python: $PythonPath" -ForegroundColor Green
Write-Host "Working Directory: $PWD" -ForegroundColor Green
Write-Host ""
Write-Host "Starting FastAPI server..." -ForegroundColor Cyan
Write-Host "API will be available at: http://localhost:8000" -ForegroundColor Green
Write-Host "API docs at: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the API
try {
    & $PythonPath api\app.py
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: API failed to start" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Missing dependencies - Run: pip install -r api\requirements.txt" -ForegroundColor White
    Write-Host "2. Port 8000 already in use - Close other applications using port 8000" -ForegroundColor White
    Write-Host "3. Database issues - Check api\data.db exists" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
}
