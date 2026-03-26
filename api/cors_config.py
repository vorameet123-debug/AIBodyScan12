"""
Secure CORS Configuration for Production
Centralized CORS settings with environment-based configuration
"""
import os

# Environment detection
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"
IS_DEVELOPMENT = not IS_PRODUCTION

# Allowed origins - configure via environment variable
# Format: comma-separated list of origins
# Example: ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")

def get_allowed_origins() -> list[str]:
    """
    Get the list of allowed origins based on environment.
    
    Production: Only explicitly allowed origins from environment variable
    Development: Local development servers + any configured origins
    """
    allowed = []

    # Parse origins from environment variable
    if _allowed_origins_env:
        allowed.extend([origin.strip() for origin in _allowed_origins_env.split(",") if origin.strip()])

    # In development, also allow local servers
    if IS_DEVELOPMENT:
        dev_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:8081",   # Expo web
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:8081",   # Expo web
            "http://localhost:8000",  # API docs testing
        ]
        # Add dev origins if not already present
        for origin in dev_origins:
            if origin not in allowed:
                allowed.append(origin)

    # In production, require at least one origin to be configured
    if IS_PRODUCTION and not allowed:
        raise ValueError(
            "ALLOWED_ORIGINS environment variable must be set in production. "
            "Example: ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com"
        )

    return allowed


# CORS Configuration
CORS_CONFIG = {
    # Origins allowed to make requests
    "allow_origins": get_allowed_origins() if not IS_PRODUCTION else [],  # Lazy load in production

    # Allow credentials (cookies, authorization headers)
    "allow_credentials": True,

    # Allowed HTTP methods - use wildcard for preflight compatibility
    "allow_methods": ["*"],

    # Allowed request headers - use wildcard for preflight compatibility
    "allow_headers": ["*"],

    # Headers exposed to the browser
    "expose_headers": [
        "X-Request-ID",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
    ],

    # Preflight cache duration (seconds)
    # 86400 = 24 hours (reduces preflight requests)
    "max_age": 86400 if IS_PRODUCTION else 3600,
}


def get_cors_config() -> dict:
    """
    Get CORS configuration dictionary for FastAPI middleware.
    
    Usage:
        from cors_config import get_cors_config
        
        config = get_cors_config()
        app.add_middleware(CORSMiddleware, **config)
    """
    config = CORS_CONFIG.copy()

    # In production, get origins at runtime to allow hot reload
    if IS_PRODUCTION:
        config["allow_origins"] = get_allowed_origins()

    return config

