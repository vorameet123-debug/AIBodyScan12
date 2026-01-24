@echo off
REM Ensure we're using the conda base environment Python
echo Activating conda base environment...
call C:\Users\voram\miniconda3\Scripts\activate.bat base

echo.
echo Starting FastAPI server...
echo.
python api\app.py
