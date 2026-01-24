"""
Comprehensive diagnostic script for the measurement pipeline
"""
import sys
import os
from pathlib import Path
import numpy as np
import torch

# Fix encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("\n" + "=" * 80)
print("COMPREHENSIVE PIPELINE DIAGNOSTIC")
print("=" * 80)

# 1. Check directories
print("\n[1] Checking directory structure...")
PROJECT_ROOT = Path(__file__).parent
print(f"  Project root: {PROJECT_ROOT}")

SMPL_ANTHROPOMETRY_DIR = PROJECT_ROOT / "smpl_anthropometry"
print(f"  SMPL-Anthropometry dir: {SMPL_ANTHROPOMETRY_DIR}")
print(f"    - Exists: {SMPL_ANTHROPOMETRY_DIR.exists()}")

DATA_DIR = SMPL_ANTHROPOMETRY_DIR / "data"
print(f"  Data dir: {DATA_DIR}")
print(f"    - Exists: {DATA_DIR.exists()}")

SMPL_DATA = DATA_DIR / "smpl"
print(f"  SMPL data dir: {SMPL_DATA}")
print(f"    - Exists: {SMPL_DATA.exists()}")

if SMPL_DATA.exists():
    files = list(SMPL_DATA.glob("*"))
    print(f"    - Files: {[f.name for f in files]}")

# 2. Check imports
print("\n[2] Testing imports...")
sys.path.insert(0, str(SMPL_ANTHROPOMETRY_DIR))
sys.path.insert(0, str(PROJECT_ROOT / "pare"))

try:
    from measure import MeasureBody, MeasureSMPL
    print("  [✓] MeasureBody and MeasureSMPL imported")
except Exception as e:
    print(f"  [✗] Import failed: {e}")
    sys.exit(1)

try:
    from measurement_definitions import STANDARD_LABELS
    print("  [✓] measurement_definitions imported")
except Exception as e:
    print(f"  [✗] Import failed: {e}")
    sys.exit(1)

# 3. Test MeasureSMPL initialization
print("\n[3] Testing MeasureSMPL initialization...")
try:
    print(f"  Current working directory: {os.getcwd()}")
    measurer = MeasureSMPL()
    print(f"  [✓] MeasureSMPL instantiated successfully")
    print(f"    - body_model_root: {measurer.body_model_root}")
    print(f"    - body_model_path: {measurer.body_model_path}")
    print(f"    - num_joints: {measurer.num_joints}")
    print(f"    - num_points: {measurer.num_points}")
except Exception as e:
    print(f"  [✗] MeasureSMPL init failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 4. Test MeasureBody factory
print("\n[4] Testing MeasureBody factory...")
try:
    measure_body = MeasureBody('smpl')
    print(f"  [✓] MeasureBody('smpl') created successfully")
    print(f"    - Type: {type(measure_body)}")
    print(f"    - Has all_possible_measurements: {hasattr(measure_body, 'all_possible_measurements')}")
    if hasattr(measure_body, 'all_possible_measurements'):
        print(f"    - Number of measurements: {len(measure_body.all_possible_measurements)}")
        print(f"    - Sample: {list(measure_body.all_possible_measurements)[:5]}")
except Exception as e:
    print(f"  [✗] MeasureBody factory failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 5. Test loading body model
print("\n[5] Testing body model loading...")
try:
    betas = torch.zeros((1, 10), dtype=torch.float32)
    measure_body.from_body_model(gender="NEUTRAL", shape=betas)
    print(f"  [✓] Body model loaded successfully")
    print(f"    - Vertices shape: {measure_body.verts.shape if measure_body.verts is not None else 'None'}")
    print(f"    - Joints shape: {measure_body.joints.shape if measure_body.joints is not None else 'None'}")
except Exception as e:
    print(f"  [✗] Body model loading failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 6. Test measurement extraction
print("\n[6] Testing measurement extraction...")
try:
    test_measurements = [
        'height',
        'chest circumference',
        'waist circumference'
    ]
    
    measure_body.measure(test_measurements)
    
    if measure_body.measurements:
        print(f"  [✓] Measurements extracted: {len(measure_body.measurements)}")
        for name, value in sorted(measure_body.measurements.items()):
            print(f"    - {name}: {value:.2f} cm")
    else:
        print(f"  [✗] No measurements extracted!")
except Exception as e:
    print(f"  [✗] Measurement extraction failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 7. Test integration pipeline
print("\n[7] Testing integration pipeline...")
try:
    sys.path.insert(0, str(PROJECT_ROOT / "integrations"))
    from pipeline import MeasurementPipeline
    print(f"  [✓] MeasurementPipeline imported")
    
    pipeline = MeasurementPipeline()
    print(f"  [✓] MeasurementPipeline instantiated")
except Exception as e:
    print(f"  [✗] Pipeline import/init failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80 + "\n")
