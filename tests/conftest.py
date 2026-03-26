"""
Pytest Configuration and Shared Fixtures
"""
import os
import sys
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "api"))
sys.path.insert(0, str(project_root / "integrations"))


# ============== Fixtures ==============

@pytest.fixture(scope="session")
def test_db():
    """Create a test database for the session."""
    from sqlmodel import SQLModel, create_engine, Session
    
    # Use in-memory SQLite for tests
    engine = create_engine("sqlite:///:memory:", echo=False)
    SQLModel.metadata.create_all(engine)
    
    yield engine
    
    # Cleanup
    engine.dispose()


@pytest.fixture
def db_session(test_db):
    """Create a new database session for each test."""
    from sqlmodel import Session
    
    with Session(test_db) as session:
        yield session
        session.rollback()


@pytest.fixture
def mock_user():
    """Create a mock user for testing."""
    return MagicMock(
        id=1,
        email="test@example.com",
        full_name="Test User",
        phone_number="+1234567890",
    )


@pytest.fixture
def sample_measurements():
    """Sample measurement data for testing."""
    return {
        "chest": 95.5,
        "chest circumference": 95.5,
        "waist": 82.0,
        "waist circumference": 82.0,
        "hips": 98.0,
        "hip circumference": 98.0,
        "shoulder_width": 45.0,
        "inseam": 78.0,
        "height": 175.0,
    }


@pytest.fixture
def sample_measurement_record(sample_measurements):
    """Create a sample measurement record."""
    from datetime import datetime
    
    return MagicMock(
        id=1,
        user_id=1,
        person_name="default",
        measurements=sample_measurements,
        created_at=datetime.now(),
    )


@pytest.fixture
def mock_razorpay_client():
    """Mock Razorpay client for payment tests."""
    client = MagicMock()
    client.order.create.return_value = {
        "id": "order_test123",
        "amount": 99900,
        "currency": "INR",
        "status": "created",
    }
    client.utility.verify_payment_signature.return_value = True
    return client


@pytest.fixture
def auth_headers():
    """Generate test auth headers with a mock JWT token."""
    return {"Authorization": "Bearer test_jwt_token_123"}


@pytest.fixture
def mock_env_vars(monkeypatch):
    """Set up mock environment variables for testing."""
    monkeypatch.setenv("JWT_SECRET_KEY", "test_secret_key_for_testing_only")
    monkeypatch.setenv("JWT_ALGORITHM", "HS256")
    monkeypatch.setenv("ENVIRONMENT", "test")
    monkeypatch.setenv("GROQ_API_KEY", "gsk_test_key_12345")
    monkeypatch.setenv("RAZORPAY_KEY_ID", "rzp_test_123")
    monkeypatch.setenv("RAZORPAY_KEY_SECRET", "test_secret_456")


# ============== Test Markers ==============

def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')")
    config.addinivalue_line("markers", "integration: marks tests as integration tests")
    config.addinivalue_line("markers", "unit: marks tests as unit tests")

