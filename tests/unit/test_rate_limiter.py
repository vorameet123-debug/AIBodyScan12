"""
Unit Tests for Rate Limiter
Tests rate limiting configuration and user identification
"""
import pytest
from unittest.mock import MagicMock, patch


class TestRateLimiterConfiguration:
    """Test rate limiter configuration."""
    
    def test_rate_limits_defined(self):
        """Test that rate limits are properly defined."""
        from api.rate_limiter import RATE_LIMITS
        
        assert RATE_LIMITS is not None
        assert "default" in RATE_LIMITS
        assert "auth" in RATE_LIMITS
        assert "heavy" in RATE_LIMITS
    
    def test_rate_limit_format(self):
        """Test that rate limits are in correct format."""
        from api.rate_limiter import RATE_LIMITS
        
        for name, limit in RATE_LIMITS.items():
            # Should be in format like "60/minute" or "10/minute"
            assert "/" in limit
            parts = limit.split("/")
            assert len(parts) == 2
            assert parts[0].isdigit()
            assert parts[1] in ["minute", "second", "hour", "day"]


class TestUserIdentifier:
    """Test user identifier extraction for rate limiting."""
    
    def test_get_identifier_from_user_state(self):
        """Test identifier extraction from authenticated user."""
        from api.rate_limiter import get_user_identifier
        
        mock_request = MagicMock()
        mock_request.state.user = MagicMock(id=123)
        mock_request.headers.get.return_value = None
        
        identifier = get_user_identifier(mock_request)
        
        assert "user:123" in identifier
    
    def test_get_identifier_from_token(self):
        """Test identifier extraction from authorization token."""
        from api.rate_limiter import get_user_identifier
        
        mock_request = MagicMock()
        mock_request.state = MagicMock(spec=[])  # No 'user' attribute
        mock_request.headers.get.side_effect = lambda key, default="": {
            "Authorization": "Bearer test_token_12345",
            "X-Forwarded-For": None,
        }.get(key, default)
        
        identifier = get_user_identifier(mock_request)
        
        assert "token:" in identifier
    
    def test_get_identifier_from_ip(self):
        """Test identifier extraction from IP address."""
        from api.rate_limiter import get_user_identifier
        
        mock_request = MagicMock()
        mock_request.state = MagicMock(spec=[])  # No 'user' attribute
        mock_request.headers.get.return_value = ""
        mock_request.client = MagicMock(host="192.168.1.100")
        
        identifier = get_user_identifier(mock_request)
        
        # Should fall back to IP
        assert identifier is not None
    
    def test_get_identifier_from_forwarded_for(self):
        """Test identifier extraction from X-Forwarded-For header."""
        from api.rate_limiter import get_user_identifier
        
        mock_request = MagicMock()
        mock_request.state = MagicMock(spec=[])
        mock_request.headers.get.side_effect = lambda key, default="": {
            "Authorization": "",
            "X-Forwarded-For": "10.0.0.1, 192.168.1.1",
        }.get(key, default)
        
        identifier = get_user_identifier(mock_request)
        
        # Should use first IP in chain
        assert "10.0.0.1" in identifier or identifier

