import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from sqlalchemy import Column, JSON
from sqlmodel import SQLModel, Field, Session, create_engine

# Import Fashion IQ models to register them with SQLModel
from fashion_iq_models import FitCheckHistory, FashionIQScore, UserBadge


DB_PATH = Path(__file__).parent / "data.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False, unique=True)
    full_name: Optional[str] = Field(default=None)
    hashed_password: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class MeasurementRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    name: Optional[str] = Field(default=None, nullable=True)  # User-provided name for the measurement set
    payload: dict = Field(sa_column=Column(JSON))  # Full measurement data including measurements, size_recommendations, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


def create_db_and_tables() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    SQLModel.metadata.create_all(engine)
    
    # Migration: Add 'name' column to MeasurementRecord if it doesn't exist
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        
        # Check if table exists
        if 'measurementrecord' in inspector.get_table_names():
            columns = [col['name'] for col in inspector.get_columns('measurementrecord')]
            
            if 'name' not in columns:
                with engine.connect() as conn:
                    conn.execute(text('ALTER TABLE measurementrecord ADD COLUMN name VARCHAR'))
                    conn.commit()
                print("Migration: Added 'name' column to measurementrecord table")
    except Exception as e:
        # Table might not exist yet, or column already exists - that's fine
        # SQLModel will create the table with the correct schema
        pass


def get_session():
    with Session(engine) as session:
        yield session
