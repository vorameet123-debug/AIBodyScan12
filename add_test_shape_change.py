"""
Add test measurement to demonstrate body shape change
This will add a measurement for Kirtan that changes shape from rectangle to hourglass
"""
import sys
sys.path.insert(0, 'd:/3Dmodel/api')

from sqlmodel import Session, create_engine
from db import MeasurementRecord
from datetime import datetime
import json

# Database setup
DB_PATH = "d:/3Dmodel/api/data.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"
engine = create_engine(DATABASE_URL)

def add_test_measurement():
    with Session(engine) as session:
        # Create a new measurement with hourglass shape ratios
        # Current Kirtan measurements show rectangle shape
        # New measurement will have hourglass ratios
        
        test_measurement = {
            "measurements": {
                "height": 173,
                "chest circumference": 95.0,  # Larger chest
                "waist circumference": 70.0,  # Smaller waist (creates hourglass)
                "hip circumference": 100.0,   # Larger hips
                "shoulder to crotch height": 64.3,
                "arm left length": 54.9,
                "arm right length": 54.9,
                "inside leg height": 82.5,
                "shoulder breadth": 42.0,
                "arm length (shoulder to elbow)": 32.5,
                "crotch height": 82.5,
                "Hip circumference max height": 95.0,
                "arm length (spine to wrist)": 60.0,
                "head circumference": 56.0,
                "neck circumference": 38.0,
                "wrist right circumference": 16.5,
                "bicep right circumference": 30.0,
                "forearm right circumference": 26.0,
                "thigh left circumference": 55.0,
                "calf left circumference": 36.0,
                "ankle left circumference": 23.0,
                "outseam length": 105.0
            },
            "size_recommendations": {
                "tops": {"recommended_size": "M", "confidence": 0.85},
                "bottoms": {"recommended_size": "M", "confidence": 0.85},
                "dresses": {"recommended_size": "M", "confidence": 0.85}
            },
            "metadata": {
                "gender": "male",
                "processing_time": 2.5
            }
        }
        
        new_record = MeasurementRecord(
            user_id=1,
            name="Kirtan",
            payload=test_measurement,
            created_at=datetime.utcnow()
        )
        
        session.add(new_record)
        session.commit()
        
        print(f"[SUCCESS] Added test measurement for Kirtan (ID: {new_record.id})")
        print(f"   Chest: 95.0, Waist: 70.0, Hips: 100.0")
        print(f"   Expected shape: Hourglass (changed from Rectangle)")
        print(f"   Created at: {new_record.created_at}")

if __name__ == "__main__":
    add_test_measurement()
