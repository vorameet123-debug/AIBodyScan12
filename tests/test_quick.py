#!/usr/bin/env python
"""
Quick test script to verify measurement extraction works
Run this in the d:\3Dmodel directory
"""
import sys
import os
from pathlib import Path

# Setup paths
PROJECT_ROOT = Path(__file__).parent
SMPL_DIR = PROJECT_ROOT / "smpl_anthropometry"
sys.path.insert(0, str(SMPL_DIR))

print("Testing SMPL measurement extraction...")
print("=" * 60)

# Test 1: Import
print("\n[1] Importing modules...")
try:
    from measure import MeasureSMPL
    import torch
    print("    ✓ Imports successful")
except Exception as e:
    print(f"    ✗ Import failed: {e}")
    sys.exit(1)

# Test 2: Create measurer
print("\n[2] Creating MeasureSMPL instance...")
try:
    measurer = MeasureSMPL()
    print(f"    ✓ MeasureSMPL created")
except Exception as e:
    print(f"    ✗ Failed: {e}")
    sys.exit(1)

# Test 3: Create synthetic body
print("\n[3] Creating synthetic body from model...")
try:
    betas = torch.zeros((1, 10), dtype=torch.float32)
    measurer.from_body_model(gender="NEUTRAL", shape=betas)
    print(f"    ✓ Body model created")
    print(f"      Vertices: {measurer.verts.shape}")
    print(f"      Joints: {measurer.joints.shape}")
except Exception as e:
    print(f"    ✗ Failed: {e}")
    sys.exit(1)

# Test 4: Extract measurements
print("\n[4] Extracting measurements...")
try:
    measurer.measurements = {}
    test_meas = ['height', 'chest circumference', 'waist circumference', 'hip circumference']
    measurer.measure(test_meas)
    
    if measurer.measurements:
        print(f"    ✓ Got {len(measurer.measurements)} measurements:")
        for name, value in sorted(measurer.measurements.items()):
            print(f"      - {name}: {value:.2f} cm")
    else:
        print(f"    ✗ No measurements extracted")
        sys.exit(1)
except Exception as e:
    print(f"    ✗ Failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 5: Test from_verts (PARE input)
print("\n[5] Testing from_verts (PARE input path)...")
try:
    verts_copy = torch.from_numpy(measurer.verts).float()
    
    measurer2 = MeasureSMPL()
    measurer2.from_verts(verts=verts_copy)
    print(f"    ✓ Vertices loaded from PARE output")
    print(f"      Vertices: {measurer2.verts.shape}")
    print(f"      Joints: {measurer2.joints.shape}")
    
    # Try measuring from PARE output
    measurer2.measurements = {}
    measurer2.measure(['height'])
    if 'height' in measurer2.measurements:
        print(f"    ✓ Measurement successful: {measurer2.measurements['height']:.2f} cm")
    else:
        print(f"    ✗ Measurement not in dict")
        sys.exit(1)
except Exception as e:
    print(f"    ✗ Failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("✓ ALL TESTS PASSED")
print("=" * 60)
