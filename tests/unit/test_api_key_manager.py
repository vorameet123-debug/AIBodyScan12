"""
Unit Tests for API Key Manager
Tests key retrieval, validation, and rotation tracking
"""
import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone, timedelta


class TestAPIKeyManagerConfiguration:
    """Test API key manager configuration."""
    
    def test_key_configs_defined(self):
        """Test that key configurations are properly defined."""
        from api.api_key_manager import APIKeyManager
        
        manager = APIKeyManager()
        
        assert "groq" in manager.KEY_CONFIGS
        assert "razorpay" in manager.KEY_CONFIGS
        assert "replicate" in manager.KEY_CONFIGS
        assert "gemini" in manager.KEY_CONFIGS
    
    def test_key_config_has_primary(self):
        """Test that each key config has a primary env var."""
        from api.api_key_manager import APIKeyManager
        
        manager = APIKeyManager()
        
        for service, config in manager.KEY_CONFIGS.items():
            assert "primary" in config


class TestKeyValidation:
    """Test API key format validation."""
    
    def test_validate_groq_key_format(self):
        """Test Groq API key format validation."""
        from api.api_key_manager import APIKeyManager
        
        manager = APIKeyManager()
        
        # Valid format
        assert manager.validate_key_format("groq", "gsk_abcdefghijklmnopqrstuvwxyz") is True
        # Invalid format
        assert manager.validate_key_format("groq", "invalid") is False
    
    def test_validate_razorpay_key_format(self):
        """Test Razorpay key format validation."""
        from api.api_key_manager import APIKeyManager
        
        manager = APIKeyManager()
        
        # Valid format
        assert manager.validate_key_format("razorpay", "rzp_test_12345678") is True
        # Invalid format
        assert manager.validate_key_format("razorpay", "xyz_test") is False
    
    def test_validate_replicate_key_format(self):
        """Test Replicate API token format validation."""
        from api.api_key_manager import APIKeyManager
        
        manager = APIKeyManager()
        
        # Valid format
        assert manager.validate_key_format("replicate", "r8_abcdefghijklmnopqrstuvwxyz") is True
        # Invalid format
        assert manager.validate_key_format("replicate", "invalid_key") is False
    
    def test_validate_empty_key(self):
        """Test validation of empty key."""
        from api.api_key_manager import APIKeyManager
        
        manager = APIKeyManager()
        
        assert manager.validate_key_format("groq", "") is False
        assert manager.validate_key_format("groq", None) is False


class TestKeyRotation:
    """Test key rotation tracking."""
    
    def test_check_rotation_no_date_set(self, monkeypatch):
        """Test rotation check when no date is set."""
        from api.api_key_manager import APIKeyManager
        
        # Clear any existing rotation date
        monkeypatch.delenv("GROQ_KEY_ROTATION_DATE", raising=False)
        
        manager = APIKeyManager()
        needs_rotation, days = manager.check_rotation_needed("groq")
        
        # Should indicate rotation needed when no date set
        assert needs_rotation is True
    
    def test_check_rotation_recent(self, monkeypatch):
        """Test rotation check with recently rotated key."""
        from api.api_key_manager import APIKeyManager
        
        # Set recent rotation date
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        monkeypatch.setenv("GROQ_KEY_ROTATION_DATE", today)
        
        manager = APIKeyManager()
        needs_rotation, days = manager.check_rotation_needed("groq")
        
        # Should not need rotation
        assert needs_rotation is False
        assert days == 0 or days is None
    
    def test_check_rotation_old(self, monkeypatch):
        """Test rotation check with old key."""
        from api.api_key_manager import APIKeyManager
        
        # Set old rotation date (60 days ago)
        old_date = (datetime.now(timezone.utc) - timedelta(days=60)).strftime("%Y-%m-%d")
        monkeypatch.setenv("GROQ_KEY_ROTATION_DATE", old_date)
        monkeypatch.setenv("API_KEY_ROTATION_WARNING_DAYS", "30")
        
        manager = APIKeyManager()
        needs_rotation, days = manager.check_rotation_needed("groq")
        
        # Should need rotation
        assert needs_rotation is True
        assert days >= 59  # Allow for timing


class TestKeyMasking:
    """Test API key masking for display."""
    
    def test_masked_key_format(self, monkeypatch):
        """Test masked key output format."""
        from api.api_key_manager import APIKeyManager
        
        monkeypatch.setenv("GROQ_API_KEY", "gsk_abcdefghijklmnopqrstuvwxyz123456")
        
        manager = APIKeyManager()
        masked = manager.get_masked_key("groq")
        
        assert masked is not None
        assert "..." in masked
        assert "gsk_" in masked
        assert len(masked) < 20  # Should be shortened
    
    def test_key_hash_consistent(self, monkeypatch):
        """Test that key hash is consistent."""
        from api.api_key_manager import APIKeyManager
        
        monkeypatch.setenv("GROQ_API_KEY", "gsk_test_key_12345")
        
        manager = APIKeyManager()
        hash1 = manager.get_key_hash("groq")
        hash2 = manager.get_key_hash("groq")
        
        assert hash1 == hash2


class TestConvenienceFunctions:
    """Test convenience functions for key retrieval."""
    
    def test_get_groq_key(self, monkeypatch):
        """Test Groq key retrieval function."""
        monkeypatch.setenv("GROQ_API_KEY", "gsk_test_12345")
        
        from api.api_key_manager import get_groq_key
        
        key = get_groq_key()
        assert key == "gsk_test_12345"
    
    def test_get_razorpay_keys(self, monkeypatch):
        """Test Razorpay keys retrieval function."""
        monkeypatch.setenv("RAZORPAY_KEY_ID", "rzp_test_123")
        monkeypatch.setenv("RAZORPAY_KEY_SECRET", "secret_456")
        
        from api.api_key_manager import get_razorpay_keys
        
        key_id, secret = get_razorpay_keys()
        assert key_id == "rzp_test_123"
        assert secret == "secret_456"


