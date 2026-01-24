@echo off
echo ========================================
echo Python Environment Diagnostic Tool
echo ========================================
echo.

echo [1] Checking which Python is being used...
python --version
python -c "import sys; print('Python Path:', sys.executable)"
echo.

echo [2] Checking conda Python...
C:\Users\voram\miniconda3\python.exe --version
C:\Users\voram\miniconda3\python.exe -c "import sys; print('Conda Python Path:', sys.executable)"
echo.

echo [3] Checking if FastAPI is installed in default Python...
python -c "import fastapi; print('FastAPI version:', fastapi.__version__)" 2>&1
if errorlevel 1 (
    echo   ERROR: FastAPI NOT found in default Python
) else (
    echo   SUCCESS: FastAPI found in default Python
)
echo.

echo [4] Checking if FastAPI is installed in conda Python...
C:\Users\voram\miniconda3\python.exe -c "import fastapi; print('FastAPI version:', fastapi.__version__)" 2>&1
if errorlevel 1 (
    echo   ERROR: FastAPI NOT found in conda Python
) else (
    echo   SUCCESS: FastAPI found in conda Python
)
echo.

echo [5] Testing import of app.py dependencies...
echo   Testing with default Python:
python -c "from fastapi import FastAPI; from sqlmodel import Session; print('  SUCCESS: All imports work')" 2>&1
if errorlevel 1 (
    echo   ERROR: Import failed with default Python
)
echo.

echo   Testing with conda Python:
C:\Users\voram\miniconda3\python.exe -c "from fastapi import FastAPI; from sqlmodel import Session; print('  SUCCESS: All imports work')" 2>&1
if errorlevel 1 (
    echo   ERROR: Import failed with conda Python
)
echo.

echo [6] Checking current working directory...
cd
echo   Current directory: %CD%
echo.

echo [7] Checking if api\app.py exists...
if exist "api\app.py" (
    echo   SUCCESS: api\app.py found
) else (
    echo   ERROR: api\app.py NOT found
    echo   Please run this script from the project root (d:\3Dmodel)
)
echo.

echo ========================================
echo Diagnostic Complete
echo ========================================
echo.
echo RECOMMENDATION:
echo Use: scripts\start_api_improved.bat
echo Or: C:\Users\voram\miniconda3\python.exe api\app.py
echo.
pause
