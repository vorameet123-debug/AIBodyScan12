"""
Test script to feed PARE mesh (vertices) to SMPL-Anthropometry
and extract body measurements: chest, waist, hip, height
"""
import os
import sys
import numpy as np
import torch
import joblib
from pathlib import Path

# Add parent directory to path to access PARE data
sys.path.append(str(Path(__file__).parent))

from measure import MeasureBody
from measurement_definitions import STANDARD_LABELS

def load_pare_output(pare_output_path):
    """
    Load PARE output from .pkl file
    
    Args:
        pare_output_path: Path to PARE output .pkl file
        
    Returns:
        vertices: numpy array (6890, 3) of SMPL vertices
    """
    print(f"Loading PARE output from: {pare_output_path}")
    
    if not os.path.exists(pare_output_path):
        raise FileNotFoundError(f"PARE output not found: {pare_output_path}")
    
    # Load PARE output
    pare_output = joblib.load(pare_output_path)
    
    # PARE output structure: {person_id: {data_dict}}
    # Get first person's data
    if isinstance(pare_output, dict):
        first_person_id = list(pare_output.keys())[0]
        person_data = pare_output[first_person_id]
        print(f"Found person ID: {first_person_id}")
    else:
        person_data = pare_output
    
    # Extract vertices
    if 'verts' in person_data:
        verts = person_data['verts']
        # If multiple frames, take first frame
        if len(verts.shape) == 3:  # (n_frames, 6890, 3)
            verts = verts[0]
        print(f"Vertices shape: {verts.shape}")
        return verts
    else:
        raise KeyError("'verts' not found in PARE output")
    

def measure_from_pare_vertices(verts, measurements_to_get=None):
    """
    Measure body from PARE vertices using SMPL-Anthropometry
    
    Args:
        verts: numpy array (6890, 3) of SMPL vertices
        measurements_to_get: List of measurement names to extract
                           If None, gets: chest, waist, hip, height
    
    Returns:
        measurements: Dictionary of measurements in cm
        labeled_measurements: Dictionary with standard labels
    """
    print("\n" + "="*50)
    print("SMPL-Anthropometry Measurement Extraction")
    print("="*50)
    
    # Default measurements: chest, waist, hip, height
    if measurements_to_get is None:
        measurements_to_get = [
            'chest circumference',
            'waist circumference', 
            'hip circumference',
            'height'
        ]
    
    # Convert vertices to torch tensor
    if isinstance(verts, np.ndarray):
        verts_tensor = torch.from_numpy(verts).float()
    else:
        verts_tensor = verts.float()
    
    # Ensure correct shape (6890, 3)
    if verts_tensor.shape != torch.Size([6890, 3]):
        raise ValueError(f"Expected vertices shape (6890, 3), got {verts_tensor.shape}")
    
    # Initialize measurer
    print("\nInitializing MeasureBody (SMPL)...")
    measurer = MeasureBody('smpl')
    
    # Load vertices
    print("Loading vertices into measurer...")
    measurer.from_verts(verts=verts_tensor)
    
    # Get all possible measurements
    all_measurements = measurer.all_possible_measurements
    print(f"\nAvailable measurements: {len(all_measurements)}")
    
    # Verify requested measurements exist
    valid_measurements = []
    for m in measurements_to_get:
        if m in all_measurements:
            valid_measurements.append(m)
        else:
            print(f"Warning: '{m}' not in available measurements")
    
    if not valid_measurements:
        print("No valid measurements found. Using all available measurements.")
        valid_measurements = all_measurements
    
    # Perform measurements
    print(f"\nMeasuring: {valid_measurements}")
    measurer.measure(valid_measurements)
    
    # Get measurements (in cm)
    measurements = measurer.measurements
    print("\n" + "="*50)
    print("MEASUREMENTS (cm):")
    print("="*50)
    for name, value in measurements.items():
        print(f"  {name}: {value:.2f} cm")
    
    # Label measurements with standard labels
    measurer.label_measurements(STANDARD_LABELS)
    labeled_measurements = measurer.labeled_measurements
    
    print("\n" + "="*50)
    print("LABELED MEASUREMENTS:")
    print("="*50)
    for label, value in labeled_measurements.items():
        print(f"  {label} ({STANDARD_LABELS.get(label, 'N/A')}): {value:.2f} cm")
    
    # Extract key measurements
    key_measurements = {}
    for m_name in ['chest circumference', 'waist circumference', 'hip circumference', 'height']:
        if m_name in measurements:
            key_measurements[m_name] = measurements[m_name]
    
    return measurements, labeled_measurements, key_measurements


def test_with_dummy_vertices():
    """
    Test with dummy vertices (zero-shaped SMPL model)
    """
    print("\n" + "="*50)
    print("Testing with dummy vertices (zero-shaped SMPL)")
    print("="*50)
    
    # Create dummy vertices (6890, 3) - this would normally come from PARE
    # For testing, we'll create a simple shape
    dummy_verts = np.zeros((6890, 3), dtype=np.float32)
    
    # Add some basic shape (just for testing - real vertices come from PARE)
    print("Note: Using dummy vertices. In production, use PARE output.")
    
    try:
        measurements, labeled, key = measure_from_pare_vertices(dummy_verts)
        print("\n✓ Test completed successfully!")
        return True
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_with_pare_output(pare_output_path):
    """
    Test with actual PARE output file
    
    Args:
        pare_output_path: Path to PARE .pkl output file
    """
    print("\n" + "="*50)
    print("Testing with PARE output")
    print("="*50)
    
    try:
        # Load PARE vertices
        verts = load_pare_output(pare_output_path)
        
        # Measure
        measurements, labeled, key = measure_from_pare_vertices(verts)
        
        print("\n✓ Measurement extraction completed successfully!")
        print("\nKey Measurements:")
        print(f"  Chest: {key.get('chest circumference', 'N/A'):.2f} cm")
        print(f"  Waist: {key.get('waist circumference', 'N/A'):.2f} cm")
        print(f"  Hip:   {key.get('hip circumference', 'N/A'):.2f} cm")
        print(f"  Height: {key.get('height', 'N/A'):.2f} cm")
        
        return True
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Test SMPL-Anthropometry with PARE vertices')
    parser.add_argument('--pare_output', type=str, default=None,
                        help='Path to PARE output .pkl file')
    parser.add_argument('--dummy', action='store_true',
                        help='Test with dummy vertices')
    
    args = parser.parse_args()
    
    if args.dummy:
        success = test_with_dummy_vertices()
    elif args.pare_output:
        success = test_with_pare_output(args.pare_output)
    else:
        print("Please provide --pare_output <path> or use --dummy for testing")
        print("\nExample:")
        print("  python test_pare_mesh.py --dummy")
        print("  python test_pare_mesh.py --pare_output ../pare/logs/test_output/pare_output.pkl")
        success = False
    
    sys.exit(0 if success else 1)









