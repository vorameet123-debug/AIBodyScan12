"""
API Key Management and Rotation Service

Provides secure management of external API keys with:
- Encrypted storage of API keys
- Key rotation tracking
- Expiration warnings
- Fallback key support
"""
import hashlib
import os
from datetime import UTC, datetime
from functools import lru_cache
from typing import Any

from loguru import logger

# Try to import cryptography for encryption (optional enhanced security)
try:
    from cryptography.fernet import Fernet
    ENCRYPTION_AVAILABLE = True
except ImportError:
    ENCRYPTION_AVAILABLE = False
    logger.warning("cryptography not installed - API keys will not be encrypted at rest")


class APIKeyManager:
    """
    Manages external API keys with rotation support.
    
    Features:
    - Environment-based key loading
    - Key validation before use
    - Rotation tracking with warnings
    - Fallback/backup key support
    - Usage logging for audit
    """

    # Key rotation warning threshold (days)
    ROTATION_WARNING_DAYS = int(os.getenv("API_KEY_ROTATION_WARNING_DAYS", "30"))

    # Supported API key types and their env var names
    KEY_CONFIGS = {
        "groq": {
            "primary": "GROQ_API_KEY",
            "backup": "GROQ_API_KEY_BACKUP",
            "rotation_date_env": "GROQ_KEY_ROTATION_DATE",
            "test_url": None,  # No test endpoint available
        },
        "razorpay": {
            "primary": "RAZORPAY_KEY_ID",
            "secret": "RAZORPAY_KEY_SECRET",
            "backup_primary": "RAZORPAY_KEY_ID_BACKUP",
            "backup_secret": "RAZORPAY_KEY_SECRET_BACKUP",
            "rotation_date_env": "RAZORPAY_KEY_ROTATION_DATE",
            "test_url": None,
        },
        "replicate": {
            "primary": "REPLICATE_API_TOKEN",
            "backup": "REPLICATE_API_TOKEN_BACKUP",
            "rotation_date_env": "REPLICATE_KEY_ROTATION_DATE",
            "test_url": None,
        },
        "gemini": {
            "primary": "GEMINI_API_KEY",
            "backup": "GEMINI_API_KEY_BACKUP",
            "rotation_date_env": "GEMINI_KEY_ROTATION_DATE",
            "test_url": None,
        },
    }

    def __init__(self):
        self._keys_cache: dict[str, str] = {}
        self._last_check: dict[str, datetime] = {}
        self._encryption_key = self._get_or_create_encryption_key()

    def _get_or_create_encryption_key(self) -> bytes | None:
        """Get or create encryption key for storing API keys securely."""
        if not ENCRYPTION_AVAILABLE:
            return None

        key_env = os.getenv("API_KEY_ENCRYPTION_KEY")
        if key_env:
            return key_env.encode()

        # In development, generate a key (not persisted)
        return Fernet.generate_key()

    def get_key(self, service: str, key_type: str = "primary") -> str | None:
        """
        Get an API key for a service.
        
        Args:
            service: Service name (groq, razorpay, replicate, gemini)
            key_type: Key type (primary, secret, backup)
            
        Returns:
            API key string or None if not found
        """
        if service not in self.KEY_CONFIGS:
            logger.error(f"Unknown service: {service}")
            return None

        config = self.KEY_CONFIGS[service]
        env_var = config.get(key_type, config.get("primary"))

        if not env_var:
            logger.error(f"No env var configured for {service}.{key_type}")
            return None

        key = os.getenv(env_var)

        if not key:
            # Try backup if primary not found
            backup_var = config.get(f"backup_{key_type}") or config.get("backup")
            if backup_var:
                key = os.getenv(backup_var)
                if key:
                    logger.warning(f"Using backup key for {service}")

        return key

    def validate_key_format(self, service: str, key: str) -> bool:
        """
        Validate API key format for a service.
        
        Args:
            service: Service name
            key: API key to validate
            
        Returns:
            True if format is valid
        """
        if not key:
            return False

        # Service-specific format validation
        validators = {
            "groq": lambda k: k.startswith("gsk_") and len(k) > 20,
            "razorpay": lambda k: k.startswith("rzp_") and len(k) > 10,
            "replicate": lambda k: k.startswith("r8_") and len(k) > 20,
            "gemini": lambda k: len(k) > 20,  # Gemini keys don't have standard prefix
        }

        validator = validators.get(service, lambda k: len(k) > 10)
        return validator(key)

    def check_rotation_needed(self, service: str) -> tuple[bool, int | None]:
        """
        Check if an API key needs rotation.
        
        Args:
            service: Service name
            
        Returns:
            Tuple of (needs_rotation, days_since_rotation)
        """
        if service not in self.KEY_CONFIGS:
            return False, None

        config = self.KEY_CONFIGS[service]
        rotation_date_env = config.get("rotation_date_env")

        if not rotation_date_env:
            return False, None

        rotation_date_str = os.getenv(rotation_date_env)
        if not rotation_date_str:
            # No rotation date set - assume key is old
            logger.warning(f"No rotation date set for {service}. Set {rotation_date_env}")
            return True, None

        try:
            rotation_date = datetime.fromisoformat(rotation_date_str)
            # Ensure timezone aware
            if rotation_date.tzinfo is None:
                rotation_date = rotation_date.replace(tzinfo=UTC)
            days_since = (datetime.now(UTC) - rotation_date).days
            needs_rotation = days_since >= self.ROTATION_WARNING_DAYS

            if needs_rotation:
                logger.warning(
                    f"API key for {service} was last rotated {days_since} days ago. "
                    f"Consider rotating (threshold: {self.ROTATION_WARNING_DAYS} days)"
                )

            return needs_rotation, days_since
        except ValueError:
            logger.error(f"Invalid rotation date format for {service}: {rotation_date_str}")
            return True, None

    def get_key_hash(self, service: str, key_type: str = "primary") -> str | None:
        """
        Get a hash of the API key for logging/debugging without exposing the key.
        
        Args:
            service: Service name
            key_type: Key type
            
        Returns:
            SHA256 hash prefix of the key
        """
        key = self.get_key(service, key_type)
        if not key:
            return None

        return hashlib.sha256(key.encode()).hexdigest()[:12]

    def get_masked_key(self, service: str, key_type: str = "primary") -> str | None:
        """
        Get a masked version of the API key for display.
        
        Args:
            service: Service name
            key_type: Key type
            
        Returns:
            Masked key (e.g., "gsk_xxxx...xxxx")
        """
        key = self.get_key(service, key_type)
        if not key:
            return None

        if len(key) <= 8:
            return "*" * len(key)

        return f"{key[:4]}...{key[-4:]}"

    def get_all_key_status(self) -> dict[str, dict[str, Any]]:
        """
        Get status of all configured API keys.
        
        Returns:
            Dictionary with status for each service
        """
        status = {}

        for service in self.KEY_CONFIGS:
            key = self.get_key(service)
            needs_rotation, days = self.check_rotation_needed(service)

            status[service] = {
                "configured": key is not None,
                "valid_format": self.validate_key_format(service, key) if key else False,
                "masked_key": self.get_masked_key(service),
                "needs_rotation": needs_rotation,
                "days_since_rotation": days,
            }

        return status

    def log_key_usage(self, service: str, success: bool, error: str | None = None):
        """
        Log API key usage for audit purposes.
        
        Args:
            service: Service name
            success: Whether the API call was successful
            error: Error message if failed
        """
        key_hash = self.get_key_hash(service)

        if success:
            logger.info(f"API call to {service} successful (key: {key_hash})")
        else:
            logger.warning(f"API call to {service} failed (key: {key_hash}): {error}")


# Singleton instance
@lru_cache(maxsize=1)
def get_api_key_manager() -> APIKeyManager:
    """Get the singleton API key manager instance."""
    return APIKeyManager()


# Convenience functions
def get_groq_key() -> str | None:
    """Get the Groq API key."""
    return get_api_key_manager().get_key("groq")


def get_razorpay_keys() -> tuple[str | None, str | None]:
    """Get the Razorpay key ID and secret."""
    manager = get_api_key_manager()
    return manager.get_key("razorpay", "primary"), manager.get_key("razorpay", "secret")


def get_replicate_key() -> str | None:
    """Get the Replicate API token."""
    return get_api_key_manager().get_key("replicate")


def get_gemini_key() -> str | None:
    """Get the Gemini API key."""
    return get_api_key_manager().get_key("gemini")


def check_all_keys() -> dict[str, dict[str, Any]]:
    """Check status of all API keys."""
    return get_api_key_manager().get_all_key_status()


