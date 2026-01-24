# Quick Fix for API Errors

## Problem
FastAPI and related packages are not installed.

## Solution

### Option 1: Run the batch file (Windows)
```bash
cd api
install_dependencies.bat
```

### Option 2: Install manually
```bash
cd api
pip install fastapi uvicorn[standard] python-multipart pydantic loguru Pillow sqlmodel passlib[bcrypt] python-jose
```

### Option 3: Install from requirements.txt
```bash
cd api
pip install -r requirements.txt
```

## Verify Installation

After installing, test with:
```bash
python -c "import fastapi; print('FastAPI installed!')"
```

## Start the API

Once installed, run:
```bash
python app.py
```

The API will start at: http://localhost:8000

## Common Issues

### Issue: "ModuleNotFoundError: No module named 'fastapi'"
**Solution:** Run the installation commands above

### Issue: Unicode encoding errors in terminal
**Solution:** The test script has been fixed to use ASCII characters

### Issue: Port 8000 already in use
**Solution:** Change the port in `app.py` or kill the process using port 8000



