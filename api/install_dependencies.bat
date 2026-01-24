@echo off
echo Installing FastAPI dependencies...
echo.

pip install fastapi
pip install "uvicorn[standard]"
pip install python-multipart
pip install python-dotenv
pip install pydantic
pip install loguru

echo.
echo Installation complete!
echo.
echo To start the API server, run:
echo   python app.py
pause



