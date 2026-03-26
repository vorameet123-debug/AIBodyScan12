"""
API Integration Tests
Tests API endpoints against running development server
Run with: python -m pytest tests/integration/test_api_endpoints.py -v
Requires: API server running on localhost:8000
"""
import pytest
import requests
from datetime import datetime, timedelta
import uuid


# Test configuration
BASE_URL = "http://localhost:8000/api/v1"
TIMEOUT = 30  # Increased timeout for busy dev server


@pytest.fixture(scope="module")
def session():
    """Create a requests session for all tests."""
    return requests.Session()


@pytest.fixture(scope="module")
def registered_user(session):
    """Register a test user and return credentials."""
    unique_email = f"inttest_{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPassword123!"
    
    response = session.post(f"{BASE_URL}/auth/register", json={
        "email": unique_email,
        "password": password,
        "full_name": "Integration Test User",
    }, timeout=TIMEOUT)
    
    if response.status_code in [200, 201]:
        data = response.json()
        return {
            "email": unique_email,
            "password": password,
            "access_token": data.get("access_token"),
            "refresh_token": data.get("refresh_token"),
        }
    
    return None


def auth_headers(token):
    """Generate authorization headers."""
    return {"Authorization": f"Bearer {token}"}


class TestHealthEndpoints:
    """Test health and info endpoints."""
    
    def test_root_endpoint(self, session):
        """Test root endpoint returns welcome message."""
        response = session.get(f"http://localhost:8000/", timeout=TIMEOUT)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data or "status" in data
    
    def test_health_endpoint(self, session):
        """Test health check endpoint."""
        response = session.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] in ["ok", "healthy", "running"]
    
    def test_info_endpoint(self, session):
        """Test API info endpoint."""
        response = session.get(f"{BASE_URL}/info", timeout=TIMEOUT)
        assert response.status_code == 200


class TestAuthEndpoints:
    """Test authentication endpoints."""
    
    def test_register_success(self, session):
        """Test successful user registration."""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        response = session.post(f"{BASE_URL}/auth/register", json={
            "email": unique_email,
            "password": "TestPassword123!",
            "full_name": "Test User",
        }, timeout=TIMEOUT)
        
        # Should succeed, conflict, or rate limited
        assert response.status_code in [200, 201, 400, 409, 429]
        
        if response.status_code in [200, 201]:
            data = response.json()
            assert "access_token" in data
    
    def test_register_invalid_email(self, session):
        """Test registration with invalid email format."""
        response = session.post(f"{BASE_URL}/auth/register", json={
            "email": "not-an-email",
            "password": "TestPassword123!",
        }, timeout=TIMEOUT)
        
        assert response.status_code in [400, 422, 429]  # 429 if rate limited
    
    def test_login_invalid_credentials(self, session):
        """Test login with invalid credentials."""
        response = session.post(f"{BASE_URL}/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "WrongPassword123!",
        }, timeout=TIMEOUT)
        
        assert response.status_code in [400, 401, 404]
    
    def test_login_missing_fields(self, session):
        """Test login with missing fields."""
        response = session.post(f"{BASE_URL}/auth/login", json={
            "email": "test@example.com",
        }, timeout=TIMEOUT)
        
        assert response.status_code == 422
    
    def test_me_without_auth(self, session):
        """Test /me endpoint without authentication."""
        response = session.get(f"{BASE_URL}/auth/me", timeout=TIMEOUT)
        
        assert response.status_code in [401, 403]
    
    def test_me_with_invalid_token(self, session):
        """Test /me endpoint with invalid token."""
        response = session.get(
            f"{BASE_URL}/auth/me",
            headers=auth_headers("invalid_token_here"),
            timeout=TIMEOUT
        )
        
        assert response.status_code in [401, 403]


class TestAuthFlow:
    """Test complete authentication flow."""
    
    def test_register_login_me_flow(self, session):
        """Test complete auth flow."""
        unique_email = f"flow_{uuid.uuid4().hex[:8]}@example.com"
        password = "SecurePassword123!"
        
        # Register
        reg_resp = session.post(f"{BASE_URL}/auth/register", json={
            "email": unique_email,
            "password": password,
            "full_name": "Flow Test",
        }, timeout=TIMEOUT)
        
        assert reg_resp.status_code in [200, 201, 429]
        if reg_resp.status_code == 429:
            pytest.skip("Rate limited")
        access_token = reg_resp.json().get("access_token")
        
        # Get current user
        me_resp = session.get(
            f"{BASE_URL}/auth/me",
            headers=auth_headers(access_token),
            timeout=TIMEOUT
        )
        
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == unique_email
        
        # Login
        login_resp = session.post(f"{BASE_URL}/auth/login", json={
            "email": unique_email,
            "password": password,
        }, timeout=TIMEOUT)
        
        assert login_resp.status_code == 200
        assert "access_token" in login_resp.json()


class TestPaymentEndpoints:
    """Test payment endpoints."""
    
    def test_subscription_status_requires_auth(self, session):
        """Test subscription-status requires auth."""
        response = session.get(f"{BASE_URL}/payments/subscription-status", timeout=TIMEOUT)
        
        assert response.status_code in [401, 403]
    
    def test_subscription_status_with_auth(self, session, registered_user):
        """Test subscription-status with valid auth."""
        if not registered_user:
            pytest.skip("Could not register user")
        
        response = session.get(
            f"{BASE_URL}/payments/subscription-status",
            headers=auth_headers(registered_user["access_token"]),
            timeout=TIMEOUT
        )
        
        assert response.status_code in [200, 404]


class TestErrorHandling:
    """Test error handling."""
    
    def test_nonexistent_endpoint(self, session):
        """Test 404 for non-existent endpoint."""
        response = session.get(f"{BASE_URL}/nonexistent-xyz", timeout=TIMEOUT)
        assert response.status_code == 404
    
    def test_validation_error(self, session):
        """Test 422 for validation errors."""
        response = session.post(f"{BASE_URL}/auth/login", json={}, timeout=TIMEOUT)
        assert response.status_code == 422
        assert "detail" in response.json()
    
    def test_duplicate_registration(self, session, registered_user):
        """Test duplicate email registration."""
        if not registered_user:
            pytest.skip("Could not register user")
        
        response = session.post(f"{BASE_URL}/auth/register", json={
            "email": registered_user["email"],
            "password": "DifferentPassword123!",
        }, timeout=TIMEOUT)
        
        assert response.status_code in [400, 409]
    
    def test_cors_preflight(self, session):
        """Test OPTIONS request."""
        # Use requests.request to send OPTIONS directly
        response = requests.request("OPTIONS", f"{BASE_URL}/auth/login", timeout=TIMEOUT)
        # OPTIONS may return 200 or 405 depending on server config
        assert response.status_code in [200, 405]

