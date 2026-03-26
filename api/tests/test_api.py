"""
Automated API Tests — Core endpoint verification.
Run with: pytest tests/ -v
"""
import os
import sys

# Add api directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool

# Set test environment variables BEFORE importing the app
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-ci-pipeline"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["ENVIRONMENT"] = "test"


@pytest.fixture(scope="module")
def test_app():
    """Create a test FastAPI app with an in-memory SQLite database."""
    from db import engine as _engine
    from app import app

    # Use in-memory DB for tests
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(test_engine)

    def get_test_session():
        with Session(test_engine) as session:
            yield session

    from db import get_session
    app.dependency_overrides[get_session] = get_test_session

    yield TestClient(app)

    app.dependency_overrides.clear()


@pytest.fixture(scope="module")
def auth_headers(test_app):
    """Register a test user and return auth headers."""
    response = test_app.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "StrongPass123!",
        "full_name": "Test User",
    })
    assert response.status_code == 200
    data = response.json()
    return {"Authorization": f"Bearer {data['access_token']}"}


# ─── Health & Info ─────────────────────────────────────

class TestHealthEndpoints:

    def test_root(self, test_app):
        resp = test_app.get("/")
        assert resp.status_code == 200
        assert "version" in resp.json()

    def test_health(self, test_app):
        resp = test_app.get("/api/v1/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"

    def test_info(self, test_app):
        resp = test_app.get("/api/v1/info")
        assert resp.status_code == 200
        assert "endpoints" in resp.json()


# ─── Authentication ───────────────────────────────────

class TestAuth:

    def test_register_success(self, test_app):
        resp = test_app.post("/api/v1/auth/register", json={
            "email": "newuser@example.com",
            "password": "NewPass123!",
            "full_name": "New User",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["email"] == "newuser@example.com"

    def test_register_duplicate_email(self, test_app):
        # Register first
        test_app.post("/api/v1/auth/register", json={
            "email": "dup@example.com",
            "password": "Pass123!",
            "full_name": "Dup User",
        })
        # Try again with same email
        resp = test_app.post("/api/v1/auth/register", json={
            "email": "dup@example.com",
            "password": "Pass123!",
            "full_name": "Dup User",
        })
        assert resp.status_code == 400

    def test_login_success(self, test_app, auth_headers):
        resp = test_app.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "StrongPass123!",
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_wrong_password(self, test_app):
        resp = test_app.post("/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "WrongPassword!",
        })
        assert resp.status_code == 401

    def test_me_authenticated(self, test_app, auth_headers):
        resp = test_app.get("/api/v1/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["email"] == "test@example.com"

    def test_me_unauthenticated(self, test_app):
        resp = test_app.get("/api/v1/auth/me")
        assert resp.status_code in [401, 403]


# ─── Measurements CRUD ────────────────────────────────

class TestMeasurements:

    def test_save_measurement(self, test_app, auth_headers):
        resp = test_app.post(
            "/api/v1/measurements/save",
            json={
                "name": "Test Scan",
                "measurement_data": {
                    "measurements": {"chest": 95, "waist": 80},
                    "size_recommendations": {"shirt": "M"},
                },
            },
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Test Scan"

    def test_get_my_measurements(self, test_app, auth_headers):
        resp = test_app.get("/api/v1/measurements/my-measurements", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "measurements" in data
        assert data["count"] >= 1

    def test_get_measurement_by_id(self, test_app, auth_headers):
        # Save first
        save_resp = test_app.post(
            "/api/v1/measurements/save",
            json={"name": "ID Test", "measurement_data": {"measurements": {"hip": 90}}},
            headers=auth_headers,
        )
        mid = save_resp.json()["id"]

        resp = test_app.get(f"/api/v1/measurements/{mid}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["name"] == "ID Test"

    def test_delete_measurement(self, test_app, auth_headers):
        save_resp = test_app.post(
            "/api/v1/measurements/save",
            json={"name": "Delete Me", "measurement_data": {"measurements": {"arm": 60}}},
            headers=auth_headers,
        )
        mid = save_resp.json()["id"]

        del_resp = test_app.delete(f"/api/v1/measurements/{mid}", headers=auth_headers)
        assert del_resp.status_code == 200

        # Verify it's gone
        get_resp = test_app.get(f"/api/v1/measurements/{mid}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_measurement_not_found(self, test_app, auth_headers):
        resp = test_app.get("/api/v1/measurements/99999", headers=auth_headers)
        assert resp.status_code == 404


# ─── Security Headers ─────────────────────────────────

class TestSecurityHeaders:

    def test_security_headers_present(self, test_app):
        resp = test_app.get("/api/v1/health")
        headers = resp.headers
        # Check key security headers exist
        assert "x-content-type-options" in headers
        assert "x-frame-options" in headers

    def test_unauthenticated_endpoints_blocked(self, test_app):
        """Protected endpoints should reject unauthenticated requests."""
        resp = test_app.get("/api/v1/measurements/my-measurements")
        assert resp.status_code in [401, 403]
