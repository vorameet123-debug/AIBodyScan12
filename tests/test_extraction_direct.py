#!/usr/bin/env python
"""
Direct test of measurement extraction
Simulates what the API does
"""
import sys
import os
import numpy as np
import torch
from pathlib import Path

print("\n" + "="*80)
print("DIRECT MEASUREMENT EXTRACTION TEST")
print("="*80)

PROJECT_ROOT = Path(__file__).parent
SMPL_DIR = PROJECT_ROOT / "smpl_anthropometry"
sys.path.insert(0, str(SMPL_DIR))
sys.path.insert(0, str(PROJECT_ROOT / "pare"))
sys.path.insert(0, str(PROJECT_ROOT / "integrations"))

print(f"\nPython path setup:")
print(f"  - SMPL_DIR: {SMPL_DIR}")
print(f"  - PROJECT_ROOT: {PROJECT_ROOT}")

# Step 1: Create a body model to get vertices
print("\n[Step 1] Creating synthetic body model...")
try:
    from measure import MeasureSMPL
    measurer = MeasureSMPL()
    
    betas = torch.zeros((1, 10), dtype=torch.float32)
    measurer.from_body_model(gender="NEUTRAL", shape=betas)
    
    test_verts = measurer.verts.copy()
    print(f"  ✓ Got test vertices: {test_verts.shape}")
except Exception as e:
    print(f"  ✗ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 2: Load pipeline and try to extract measurements
print("\n[Step 2] Initializing pipeline...")
try:
    from pipeline import MeasurementPipeline
    pipeline = MeasurementPipeline()
    print(f"  ✓ Pipeline created")
except Exception as e:
    print(f"  ✗ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 3: Extract measurements
print("\n[Step 3] Extracting measurements from vertices...")
try:
    measurements = pipeline._extract_measurements(
        vertices=test_verts,
        measurements_to_get='all',
        user_height_cm=None
    )
    
    if measurements and len(measurements) > 0:
        print(f"  ✓ SUCCESS: Got {len(measurements)} measurements")
        for name, value in sorted(list(measurements.items())[:5]):
            print(f"    - {name}: {value} cm")
        if len(measurements) > 5:
            print(f"    ... and {len(measurements)-5} more")
    else:
        print(f"  ✗ FAILED: Got empty measurements dict")
        print(f"    Type: {type(measurements)}")
        print(f"    Value: {measurements}")
except Exception as e:
    print(f"  ✗ EXCEPTION: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*80)
print("TEST COMPLETE")
print("="*80 + "\n")

