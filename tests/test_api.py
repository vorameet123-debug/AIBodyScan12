"""Test script to check API imports and identify errors"""
import sys
import traceback

print("Testing API imports...")
print("=" * 50)

# Test 1: FastAPI
try:
    import fastapi
    print("[OK] FastAPI imported successfully")
except Exception as e:
    print(f"[ERROR] FastAPI import failed: {e}")
    traceback.print_exc()

# Test 2: Uvicorn
try:
    import uvicorn
    print("[OK] Uvicorn imported successfully")
except Exception as e:
    print(f"[ERROR] Uvicorn import failed: {e}")
    traceback.print_exc()

# Test 3: Other dependencies
try:
    from fastapi import FastAPI, File, UploadFile, Form, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    print("[OK] FastAPI components imported successfully")
except Exception as e:
    print(f"[ERROR] FastAPI components import failed: {e}")
    traceback.print_exc()

# Test 4: OpenCV and NumPy
try:
    import cv2
    import numpy as np
    print("[OK] OpenCV and NumPy imported successfully")
except Exception as e:
    print(f"[ERROR] OpenCV/NumPy import failed: {e}")
    traceback.print_exc()

# Test 5: Loguru
try:
    from loguru import logger
    print("[OK] Loguru imported successfully")
except Exception as e:
    print(f"[ERROR] Loguru import failed: {e}")
    traceback.print_exc()

# Test 6: Pipeline import
try:
    import sys
    from pathlib import Path
    PROJECT_ROOT = Path(__file__).parent.parent
    sys.path.insert(0, str(PROJECT_ROOT))
    sys.path.insert(0, str(PROJECT_ROOT / "integrations"))
    from integrations.pipeline import MeasurementPipeline
    print("[OK] Pipeline imported successfully")
except Exception as e:
    print(f"[ERROR] Pipeline import failed: {e}")
    traceback.print_exc()

# Test 7: Try importing app
try:
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent))
    from app import app
    print("[OK] App module imported successfully")
except Exception as e:
    print(f"[ERROR] App module import failed: {e}")
    traceback.print_exc()
    print("\nFull traceback:")
    traceback.print_exc()

print("=" * 50)
print("Test complete!")


