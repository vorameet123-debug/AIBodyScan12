"""
Detailed measurement extraction debugging script
Tests each step of the measurement pipeline independently
"""
import sys
import os
from pathlib import Path
import numpy as np
import torch

print("\n" + "=" * 100)
print("MEASUREMENT PIPELINE DEBUGGING SCRIPT")
print("=" * 100)

PROJECT_ROOT = Path(__file__).parent
SMPL_DIR = PROJECT_ROOT / "smpl_anthropometry"

sys.path.insert(0, str(SMPL_DIR))
sys.path.insert(0, str(PROJECT_ROOT / "pare"))

# Step 1: Test MeasureSMPL initialization
print("\n[STEP 1] Testing MeasureSMPL class initialization...")
try:
    from measure import MeasureSMPL
    
    print(f"  Current working directory: {os.getcwd()}")
    measurer = MeasureSMPL()
    print(f"  [✓] MeasureSMPL created")
    print(f"      - body_model_root: {measurer.body_model_root}")
    print(f"      - body_model_path: {measurer.body_model_path}")
    print(f"      - body_model_path exists: {os.path.exists(measurer.body_model_path)}")
    print(f"      - all_possible_measurements: {len(measurer.all_possible_measurements)} measurements")
    print(f"      - Sample: {list(measurer.all_possible_measurements)[:5]}")
except Exception as e:
    print(f"  [✗] MeasureSMPL init failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 2: Test from_body_model
print("\n[STEP 2] Testing from_body_model (create from scratch)...")
try:
    betas = torch.zeros((1, 10), dtype=torch.float32)
    measurer.from_body_model(gender="NEUTRAL", shape=betas)
    print(f"  [✓] from_body_model succeeded")
    print(f"      - verts shape: {measurer.verts.shape}")
    print(f"      - joints shape: {measurer.joints.shape}")
except Exception as e:
    print(f"  [✗] from_body_model failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 3: Test measure() function
print("\n[STEP 3] Testing measure() with body model...")
try:
    measurer.measurements = {}
    measurer.measure(['height'])
    print(f"  [✓] measure(['height']) completed")
    print(f"      - measurements dict: {len(measurer.measurements)} items")
    print(f"      - height value: {measurer.measurements.get('height', 'NOT FOUND')}")
except Exception as e:
    print(f"  [✗] measure() failed: {e}")
    import traceback
    traceback.print_exc()

# Step 4: Test from_verts (the critical path for PARE output)
print("\n[STEP 4] Testing from_verts (loading PARE vertices)...")
try:
    # Create test vertices from the body model we just created
    test_verts = torch.from_numpy(measurer.verts).float()
    print(f"  Test vertices shape: {test_verts.shape}")
    
    # Create a fresh measurer instance
    measurer2 = MeasureSMPL()
    
    print(f"  Calling from_verts...")
    measurer2.from_verts(verts=test_verts)
    print(f"  [✓] from_verts succeeded")
    print(f"      - verts shape: {measurer2.verts.shape if measurer2.verts is not None else 'None'}")
    print(f"      - joints shape: {measurer2.joints.shape if measurer2.joints is not None else 'None'}")
except Exception as e:
    print(f"  [✗] from_verts failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 5: Test measurement from vertices
print("\n[STEP 5] Testing measure() with from_verts loaded data...")
try:
    measurer2.measurements = {}
    measurer2.measure(['height', 'chest circumference'])
    print(f"  [✓] measure() completed")
    print(f"      - measurements dict: {len(measurer2.measurements)} items")
    for name, value in measurer2.measurements.items():
        print(f"      - {name}: {value:.2f} cm")
except Exception as e:
    print(f"  [✗] measure() failed: {e}")
    import traceback
    traceback.print_exc()

# Step 6: Test full measurement list
print("\n[STEP 6] Testing all 22 measurements...")
try:
    measurer3 = MeasureSMPL()
    betas = torch.zeros((1, 10), dtype=torch.float32)
    measurer3.from_body_model(gender="NEUTRAL", shape=betas)
    
    all_meas = list(measurer3.all_possible_measurements)
    print(f"  Total available measurements: {len(all_meas)}")
    print(f"  Attempting to measure all...")
    
    measurer3.measurements = {}
    measurer3.measure(all_meas)
    
    print(f"  [✓] Measurement attempt completed")
    print(f"      - Successfully measured: {len(measurer3.measurements)}/{len(all_meas)}")
    print(f"      - Measurements obtained:")
    for name, value in sorted(measurer3.measurements.items())[:10]:
        print(f"        - {name}: {value:.2f} cm")
    if len(measurer3.measurements) > 10:
        print(f"        ... and {len(measurer3.measurements)-10} more")
except Exception as e:
    print(f"  [✗] Full measurement test failed: {e}")
    import traceback
    traceback.print_exc()

# Step 7: Test MeasureBody factory
print("\n[STEP 7] Testing MeasureBody factory...")
try:
    from measure import MeasureBody
    mb = MeasureBody('smpl')
    print(f"  [✓] MeasureBody('smpl') created: {type(mb)}")
    print(f"      - Type: {mb.__class__.__name__}")
except Exception as e:
    print(f"  [✗] MeasureBody factory failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 100)
print("DEBUGGING COMPLETE")
print("=" * 100 + "\n")
