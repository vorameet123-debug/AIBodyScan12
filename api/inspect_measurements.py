from sqlmodel import Session, select, create_engine
from db import MeasurementRecord, User
import os
from dotenv import load_dotenv

load_dotenv()

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), "data.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"
engine = create_engine(DATABASE_URL)

def inspect_measurements():
    with Session(engine) as session:
        # Get user
        user = session.exec(select(User).where(User.email == "vorameet123@gmail.com")).first()
        if not user:
            print("User vorameet123@gmail.com not found!")
            # Try to get first user
            user = session.exec(select(User)).first()
            if not user:
                print("No users found in database.")
                return
            print(f"Using first found user: {user.email} (ID: {user.id})")
        else:
            print(f"Found user: {user.email} (ID: {user.id})")

        # Get measurements
        measurements = session.exec(select(MeasurementRecord).where(MeasurementRecord.user_id == user.id)).all()
        
        print(f"\nTotal Measurements found: {len(measurements)}")
        print("-" * 80)
        print(f"{'ID':<5} | {'Name':<20} | {'Created At':<30} | {'Summary'}")
        print("-" * 80)
        
        for m in measurements:
            payload = m.payload.get('measurements', {})
            keys = list(payload.keys())
            print(f"{m.id:<5} | {m.name:<20} | {str(m.created_at):<30}")
            print(f"      Keys: {keys}")
            if 'chest' in payload: print(f"      Chest: {payload['chest']}")
            if 'waist' in payload: print(f"      Waist: {payload['waist']}")
            print("-" * 40)

if __name__ == "__main__":
    inspect_measurements()
