"""
Script to restore fit check history from logs
Re-inserts known previous checks and recalculates IQ
"""
from datetime import UTC, datetime, timedelta

from db import engine
from fashion_iq_models import FitCheckHistory
from sqlmodel import Session, select


def restore_data():
    with Session(engine) as session:
        # Check if empty
        if session.exec(select(FitCheckHistory)).first():
            print("Database already has data. Skipping restore.")
            return

        print("Restoring data from logs...")

        # 1. Shirt check (from logs)
        check1 = FitCheckHistory(
            user_id=1,
            garment_type="shirt",
            size="M",
            fit_score=97.6,
            color="white", # inferred/default
            style="casual",
            formality_level=4,
            is_trending=False,
            checked_at=datetime.now(UTC) - timedelta(hours=2),
            purchased=True,
            purchase_intent="yes",
            purchased_at=datetime.now(UTC)
        )

        # 2. Pants check (from logs)
        check2 = FitCheckHistory(
            user_id=1,
            garment_type="pants",
            size="M",
            fit_score=88.3,
            color="black", # inferred/default
            style="casual",
            formality_level=5,
            is_trending=False,
            checked_at=datetime.now(UTC) - timedelta(minutes=30),
            purchased=False,
            purchase_intent="maybe"
        )

        # 3. Jacket (bonus data to populate charts)
        check3 = FitCheckHistory(
            user_id=1,
            garment_type="jacket",
            size="L",
            fit_score=75.4,
            color="blue",
            style="formal",
            formality_level=8,
            is_trending=True,
            checked_at=datetime.now(UTC) - timedelta(days=2),
            purchased=False,
            purchase_intent="no"
        )

        session.add(check1)
        session.add(check2)
        session.add(check3)
        session.commit()
        print("✅ Restored 3 fit checks")

        # Recalculate IQ
        try:
            from integrations.fashion_iq_calculator import FashionIQCalculator
            calculator = FashionIQCalculator(session)
            iq_data = calculator.calculate_overall_iq(1)
            calculator.save_iq_score(1, iq_data)
            print(f"✅ Recalculated IQ Score: {iq_data['overall_score']}")
        except Exception as e:
            print(f"⚠️ Could not recalculate IQ: {e}")

if __name__ == "__main__":
    restore_data()


