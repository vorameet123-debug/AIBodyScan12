"""
Script to clear duplicate trends from database
"""
from db import ExternalTrend, engine
from sqlmodel import Session, delete


def clear_duplicate_trends():
    """Clear all external trends to force fresh analysis"""
    with Session(engine) as session:
        # Delete all external trends
        statement = delete(ExternalTrend)
        result = session.exec(statement)
        session.commit()
        print(f"Deleted {result.rowcount} trend records")
        print("Database cleared. Fresh trends will be generated on next API call.")

if __name__ == "__main__":
    clear_duplicate_trends()

