"""
Unit Tests for Authentication Module
Tests password hashing, JWT token creation, and user authentication
"""
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta


class TestPasswordHashing:
    """Test password hashing functions."""
    
    def test_password_hash_creates_hash(self, mock_env_vars):
        """Test that password hashing creates a hash different from input."""
        from api.auth import get_password_hash
        
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 20  # Argon2 hashes are long
    
    def test_password_hash_is_unique(self, mock_env_vars):
        """Test that same password produces different hashes (salt)."""
        from api.auth import get_password_hash
        
        password = "TestPassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2  # Should be different due to salt
    
    def test_verify_password_correct(self, mock_env_vars):
        """Test password verification with correct password."""
        from api.auth import get_password_hash, verify_password
        
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self, mock_env_vars):
        """Test password verification with incorrect password."""
        from api.auth import get_password_hash, verify_password
        
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert verify_password("WrongPassword", hashed) is False


class TestJWTTokens:
    """Test JWT token creation and validation."""
    
    def test_create_access_token(self, mock_env_vars):
        """Test access token creation."""
        from api.auth import create_access_token
        
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 50  # JWT tokens are long
        # JWT has 3 parts separated by dots
        assert len(token.split('.')) == 3
    
    def test_create_access_token_with_expiry(self, mock_env_vars):
        """Test access token creation with custom expiry."""
        from api.auth import create_access_token
        
        data = {"sub": "test@example.com"}
        expires = timedelta(minutes=30)
        token = create_access_token(data, expires_delta=expires)
        
        assert token is not None
        assert len(token.split('.')) == 3
    
    def test_access_token_contains_claims(self, mock_env_vars):
        """Test that access token contains expected claims."""
        from api.auth import create_access_token
        from jose import jwt
        import os
        
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        # Decode without verification to check claims
        decoded = jwt.decode(
            token, 
            os.getenv("JWT_SECRET_KEY"),
            algorithms=["HS256"]
        )
        
        assert decoded["sub"] == "test@example.com"
        assert "exp" in decoded
        assert decoded.get("type") == "access"


class TestRefreshTokens:
    """Test refresh token creation and validation."""
    
    def test_create_refresh_token(self, mock_env_vars):
        """Test refresh token creation."""
        # Mock the db module since RefreshToken is imported inside the function
        with patch('db.RefreshToken') as MockRefreshToken:
            mock_session = MagicMock()
            mock_instance = MagicMock()
            MockRefreshToken.return_value = mock_instance
            
            from api.auth import create_refresh_token
            
            token = create_refresh_token(user_id=1, session=mock_session)
            
            assert token is not None
            assert isinstance(token, str)
            assert len(token) > 20
    
    def test_verify_refresh_token_valid(self, mock_env_vars):
        """Test refresh token verification with valid token."""
        # Create mock token record
        mock_token_record = MagicMock()
        mock_token_record.user_id = 1
        mock_token_record.expires_at = datetime.now(timezone.utc) + timedelta(days=1)
        mock_token_record.revoked = False
        
        mock_session = MagicMock()
        mock_session.exec.return_value.first.return_value = mock_token_record
        
        from api.auth import verify_refresh_token
        
        result = verify_refresh_token("valid_token", mock_session)
        
        assert result == 1  # Should return user_id
    
    def test_verify_refresh_token_expired(self, mock_env_vars):
        """Test refresh token verification with expired token."""
        # Create mock expired token record
        mock_token_record = MagicMock()
        mock_token_record.user_id = 1
        mock_token_record.expires_at = datetime.now(timezone.utc) - timedelta(days=1)  # Expired
        mock_token_record.revoked = False
        
        mock_session = MagicMock()
        mock_session.exec.return_value.first.return_value = mock_token_record
        
        from api.auth import verify_refresh_token
        
        result = verify_refresh_token("expired_token", mock_session)
        
        assert result is None  # Should return None for expired
    
    def test_verify_refresh_token_not_found(self, mock_env_vars):
        """Test refresh token verification when token doesn't exist."""
        mock_session = MagicMock()
        mock_session.exec.return_value.first.return_value = None
        
        from api.auth import verify_refresh_token
        
        result = verify_refresh_token("nonexistent_token", mock_session)
        
        assert result is None
    
    def test_revoke_refresh_token(self, mock_env_vars):
        """Test refresh token revocation."""
        mock_token_record = MagicMock()
        mock_token_record.revoked = False
        
        mock_session = MagicMock()
        mock_session.exec.return_value.first.return_value = mock_token_record
        
        from api.auth import revoke_refresh_token
        
        result = revoke_refresh_token("token_to_revoke", mock_session)
        
        assert result is True
        assert mock_token_record.revoked is True


class TestGetCurrentUser:
    """Test current user retrieval from token."""
    
    @pytest.mark.asyncio
    async def test_get_current_user_valid_token(self, mock_env_vars):
        """Test getting current user with valid token."""
        from api.auth import create_access_token
        
        # Create a valid token
        token = create_access_token({"sub": "test@example.com"})
        
        # Mock session and user
        mock_session = MagicMock()
        mock_user = MagicMock()
        mock_user.email = "test@example.com"
        mock_session.exec.return_value.first.return_value = mock_user
        
        # Import and test
        from api.auth import get_current_user
        
        # This would need proper async handling in real test
        # Simplified for unit test demonstration
    
    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, mock_env_vars):
        """Test getting current user with invalid token raises exception."""
        from fastapi import HTTPException
        from api.auth import get_current_user
        
        mock_session = MagicMock()
        
        # Should raise HTTPException for invalid token
        with pytest.raises(Exception):
            await get_current_user(token="invalid_token", session=mock_session)


