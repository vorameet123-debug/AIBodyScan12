from datetime import datetime
from pathlib import Path

# Import Fashion IQ models to register them with SQLModel
from sqlalchemy import JSON, Column
from sqlalchemy.pool import StaticPool
from sqlmodel import Field, Session, SQLModel, create_engine

DB_PATH = Path(__file__).parent / "data.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create engine with connection pooling
# StaticPool is recommended for SQLite in multi-threaded applications
# It maintains a single connection that's shared across threads
engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={
        "check_same_thread": False,
        "timeout": 30  # Wait up to 30s for database lock
    },
    poolclass=StaticPool,  # Use StaticPool for SQLite
    pool_pre_ping=True,  # Verify connections before using
)



class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False, unique=True)
    full_name: str | None = Field(default=None)
    phone_number: str | None = Field(default=None, index=True)  # For WhatsApp notifications
    hashed_password: str = Field(nullable=False)
    email_verified: bool = Field(default=False, nullable=False)
    google_user: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class RefreshToken(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, nullable=False)
    token: str = Field(index=True, nullable=False, unique=True)
    expires_at: datetime = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    revoked: bool = Field(default=False, nullable=False)


class MeasurementRecord(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", index=True)
    name: str | None = Field(default=None, nullable=True)  # User-provided name for the measurement set
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

        # Migration: Add email_verified and google_user columns to User if they don't exist
        if 'user' in inspector.get_table_names():
            user_columns = [col['name'] for col in inspector.get_columns('user')]
            with engine.connect() as conn:
                if 'email_verified' not in user_columns:
                    conn.execute(text('ALTER TABLE user ADD COLUMN email_verified BOOLEAN DEFAULT 0'))
                    print("Migration: Added 'email_verified' column to user table")
                if 'google_user' not in user_columns:
                    conn.execute(text('ALTER TABLE user ADD COLUMN google_user BOOLEAN DEFAULT 0'))
                    print("Migration: Added 'google_user' column to user table")
                conn.commit()

    except Exception:
        # Table might not exist yet, or column already exists - that's fine
        # SQLModel will create the table with the correct schema
        pass


def get_session():
    with Session(engine) as session:
        yield session

