#!/usr/bin/env python
"""
Step-by-step diagnostic that replicates exact API flow
Run this when you get the error to see where it fails
"""
import sys
import os
from pathlib import Path
import numpy as np
import torch

print("\n" + "="*100)
print("DIAGNOSTIC: EXACT API FLOW REPLICATION")
print("="*100)

PROJECT_ROOT = Path(__file__).parent
SMPL_DIR = PROJECT_ROOT / "smpl_anthropometry"
PARE_DIR = PROJECT_ROOT / "pare"
INTEGRATIONS_DIR = PROJECT_ROOT / "integrations"

sys.path.insert(0, str(SMPL_DIR))
sys.path.insert(0, str(PARE_DIR))
sys.path.insert(0, str(INTEGRATIONS_DIR))

# TEST 1: Can we import everything?
print("\n[TEST 1] Checking imports...")
try:
    from measure import MeasureSMPL, MeasureBody
    print("  ✓ measure module")
except Exception as e:
    print(f"  ✗ measure module: {e}")
    sys.exit(1)

try:
    from measurement_definitions import SMPLMeasurementDefinitions
    print("  ✓ measurement_definitions module")
except Exception as e:
    print(f"  ✗ measurement_definitions module: {e}")
    sys.exit(1)

try:
    from joint_definitions import get_joint_regressor
    print("  ✓ joint_definitions module")
except Exception as e:
    print(f"  ✗ joint_definitions module: {e}")
    sys.exit(1)

try:
    from pipeline import MeasurementPipeline
    print("  ✓ pipeline module")
except Exception as e:
    print(f"  ✗ pipeline module: {e}")
    sys.exit(1)

# TEST 2: Can we create a measurer?
print("\n[TEST 2] Creating MeasureSMPL...")
try:
    measurer = MeasureSMPL()
    print(f"  ✓ MeasureSMPL created")
    print(f"    - body_model_root exists: {os.path.exists(measurer.body_model_root)}")
    print(f"    - all_possible_measurements: {len(measurer.all_possible_measurements)}")
except Exception as e:
    print(f"  ✗ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# TEST 3: Can we create a body model?
print("\n[TEST 3] Creating synthetic body...")
try:
    betas = torch.zeros((1, 10), dtype=torch.float32)
    measurer.from_body_model(gender="NEUTRAL", shape=betas)
    print(f"  ✓ Body model created")
    print(f"    - Vertices: {measurer.verts.shape}")
    print(f"    - Joints: {measurer.joints.shape}")
    test_verts = measurer.verts.copy()
except Exception as e:
    print(f"  ✗ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# TEST 4: Can we extract measurements directly?
print("\n[TEST 4] Extracting measurements from synthetic body...")
try:
    measurer2 = MeasureSMPL()
    measurer2.from_body_model(gender="NEUTRAL", shape=betas)
    measurer2.measurements = {}
    measurer2.measure(['height', 'chest circumference'])
    print(f"  ✓ Measurements extracted: {len(measurer2.measurements)}")
    for name, value in measurer2.measurements.items():
        print(f"    - {name}: {value:.2f}")
except Exception as e:
    print(f"  ✗ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# TEST 5: Can we load vertices with from_verts?
print("\n[TEST 5] Loading vertices with from_verts...")
try:
    measurer3 = MeasureSMPL()
    verts_tensor = torch.from_numpy(test_verts).float()
    print(f"    - Input shape: {verts_tensor.shape}")
    measurer3.from_verts(verts=verts_tensor)
    print(f"  ✓ Vertices loaded")
    print(f"    - Output verts: {measurer3.verts.shape}")
    print(f"    - Joints: {measurer3.joints.shape}")
except Exception as e:
    print(f"  ✗ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# TEST 6: Can we measure from from_verts loaded data?
print("\n[TEST 6] Measuring from from_verts data...")
try:
    measurer3.measurements = {}
    measurer3.measure(['height'])
    if 'height' in measurer3.measurements:
        print(f"  ✓ Measurement successful: {measurer3.measurements['height']:.2f} cm")
    else:
        print(f"  ✗ 'height' not in measurements dict")
        print(f"    - Dict keys: {list(measurer3.measurements.keys())}")
except Exception as e:
    print(f"  ✗ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# TEST 7: Can we initialize pipeline?
print("\n[TEST 7] Initializing MeasurementPipeline...")
try:
    pipeline = MeasurementPipeline()
    print(f"  ✓ Pipeline created")
except Exception as e:
    print(f"  ✗ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# TEST 8: Can we extract measurements through pipeline?
print("\n[TEST 8] Extracting measurements through pipeline...")
try:
    measurements = pipeline._extract_measurements(
        vertices=test_verts,
        measurements_to_get='all',
        user_height_cm=None
    )
    print(f"  ✓ Pipeline extraction complete")
    print(f"    - Type: {type(measurements)}")
    print(f"    - Length: {len(measurements)}")
    if measurements:
        print(f"    - First 5: {list(measurements.items())[:5]}")
    else:
        print(f"    - EMPTY! This is the problem!")
except Exception as e:
    print(f"  ✗ FAILED: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*100)
if measurements and len(measurements) > 0:
    print("✓ ALL TESTS PASSED - System should work!")
else:
    print("✗ MEASUREMENTS EMPTY - See TEST 8 above for error details")
print("="*100 + "\n")
