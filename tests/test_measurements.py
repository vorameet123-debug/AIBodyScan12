"""
Test script to verify measurement extraction is working
"""
import sys
import os
from pathlib import Path
import numpy as np
import torch

# Add paths
PROJECT_ROOT = Path(__file__).parent
SMPL_ANTHROPOMETRY_DIR = PROJECT_ROOT / "smpl_anthropometry"
sys.path.insert(0, str(SMPL_ANTHROPOMETRY_DIR))

print("=" * 60)
print("Testing SMPL Measurement Extraction")
print("=" * 60)

try:
    from measure import MeasureBody
    from measurement_definitions import STANDARD_LABELS
    print("[✓] Successfully imported MeasureBody")
except Exception as e:
    print(f"[✗] Failed to import MeasureBody: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("\nInitializing MeasureBody ('smpl')...")
    measurer = MeasureBody('smpl')
    print("[✓] MeasureBody initialized successfully")
except Exception as e:
    print(f"[✗] Failed to initialize MeasureBody: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("\nCreating test SMPL vertices (neutral pose)...")
    # Create a neutral SMPL mesh (mean shape)
    betas = torch.zeros((1, 10), dtype=torch.float32)
    measurer.from_body_model(gender="NEUTRAL", shape=betas)
    print("[✓] Test vertices loaded successfully")
    
    # Get measurement types
    print(f"\nAvailable measurements: {len(measurer.all_possible_measurements)}")
    print(f"Sample measurements: {list(measurer.all_possible_measurements)[:10]}")
    
    # Try to measure
    print("\nExtracting measurements...")
    measurements_to_try = [
        'height',
        'chest circumference',
        'waist circumference',
        'hip circumference',
        'arm left length',
        'inside leg height'
    ]
    
    measurer.measure(measurements_to_try)
    
    if measurer.measurements:
        print(f"\n[✓] Successfully extracted {len(measurer.measurements)} measurements:")
        for name, value in sorted(measurer.measurements.items()):
            print(f"  - {name}: {value:.2f} cm")
    else:
        print("[✗] No measurements were extracted!")
        
except Exception as e:
    print(f"[✗] Error during measurement extraction: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("Test completed successfully!")
print("=" * 60)
