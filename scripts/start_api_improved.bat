@echo off
REM Improved API Startup Script
REM This script ensures the correct Python environment is used

echo ========================================
echo Starting Fashion Intelligence API
echo ========================================
echo.

REM Get the script directory (project root)
set SCRIPT_DIR=%~dp0..
cd /d "%SCRIPT_DIR%"

REM Check if we're in the right directory
if not exist "api\app.py" (
    echo ERROR: Cannot find api\app.py
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Use conda Python (adjust path if needed)
set PYTHON_PATH=C:\Users\voram\miniconda3\python.exe

REM Verify Python exists
if not exist "%PYTHON_PATH%" (
    echo ERROR: Python not found at %PYTHON_PATH%
    echo Please update PYTHON_PATH in this script
    pause
    exit /b 1
)

REM Check if FastAPI is installed
echo Checking Python environment...
"%PYTHON_PATH%" -c "import fastapi" 2>nul
if errorlevel 1 (
    echo ERROR: FastAPI is not installed in this Python environment
    echo Please install dependencies: pip install -r api\requirements.txt
    pause
    exit /b 1
)

echo.
echo Python: %PYTHON_PATH%
echo Working Directory: %CD%
echo.
echo Starting FastAPI server...
echo API will be available at: http://localhost:8000
echo API docs at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the API
"%PYTHON_PATH%" api\app.py

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: API failed to start
    echo ========================================
    echo.
    echo Common issues:
    echo 1. Missing dependencies - Run: pip install -r api\requirements.txt
    echo 2. Port 8000 already in use - Close other applications using port 8000
    echo 3. Database issues - Check api\data.db exists
    echo.
    pause
)
