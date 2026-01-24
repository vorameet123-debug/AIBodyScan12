#!/usr/bin/env python3
"""Test script to verify backend endpoint works"""
import os
import sys
import requests
from pathlib import Path

# Test if token is set
token = os.getenv("REPLICATE_API_TOKEN")
print(f"REPLICATE_API_TOKEN set: {bool(token)}")
if token:
    print(f"Token (first 20 chars): {token[:20]}...")

# Test endpoint
api_url = "http://localhost:8000/api/v1/virtual-try-on"
print(f"\nTesting endpoint: {api_url}")

# Create dummy test images (1x1 PNG)
test_image_path = Path("test_image.png")
if not test_image_path.exists():
    import struct
    import zlib
    # Minimal 1x1 PNG
    png_data = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
        b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf'
        b'\xc0\x00\x00\x00\x03\x00\x01\xf5\xff\xfe\xfe\x1f\x10\x8aT\x00\x00'
        b'\x00\x00IEND\xaeB`\x82'
    )
    test_image_path.write_bytes(png_data)
    print(f"Created test image: {test_image_path}")

# Make request
try:
    with open(test_image_path, "rb") as f:
        files = {
            "user_image": ("user.png", f, "image/png"),
            "garment_image": ("garment.png", f, "image/png"),
        }
        data = {
            "category": "upper_body"
        }
        response = requests.post(api_url, files=files, data=data, timeout=30)
        
    print(f"\nResponse status: {response.status_code}")
    print(f"Response body: {response.text}")
    
    if response.status_code != 200:
        print(f"\n❌ Error: {response.status_code}")
        print("Make sure:")
        print("1. Backend is running on localhost:8000")
        print("2. REPLICATE_API_TOKEN is set to your actual token")
        print("3. Token is valid and has credits")
    else:
        print(f"\n✓ Success!")
        
except requests.exceptions.ConnectionError:
    print("❌ Cannot connect to backend. Is it running?")
except Exception as e:
    print(f"❌ Error: {e}")
