"""
Rate Limiter Configuration for the API
Uses slowapi for request rate limiting to prevent abuse
"""
import os

from fastapi import Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

# Get rate limits from environment or use defaults
# Format: "requests/period" e.g., "100/minute", "1000/hour"

# Rate limit configurations by endpoint type
RATE_LIMITS = {
    # General API endpoints
    "default": os.getenv("RATE_LIMIT_DEFAULT", "60/minute"),

    # Authentication endpoints (stricter to prevent brute force)
    "auth": os.getenv("RATE_LIMIT_AUTH", "10/minute"),

    # Heavy computation endpoints (image processing, AI analysis)
    "heavy": os.getenv("RATE_LIMIT_HEAVY", "10/minute"),

    # Payment endpoints (moderate limits)
    "payment": os.getenv("RATE_LIMIT_PAYMENT", "20/minute"),

    # Health check and info (relaxed)
    "health": os.getenv("RATE_LIMIT_HEALTH", "120/minute"),

    # Webhook endpoints (external services calling us)
    "webhook": os.getenv("RATE_LIMIT_WEBHOOK", "100/minute"),
}


def get_user_identifier(request: Request) -> str:
    """
    Get a unique identifier for rate limiting.
    Uses authenticated user ID if available, otherwise falls back to IP.
    """
    # Try to get user ID from request state (set by auth middleware)
    if hasattr(request.state, 'user') and request.state.user:
        return f"user:{request.state.user.id}"

    # Check for authorization header to identify logged-in users
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        # Use a hash of the token as identifier (don't expose token)
        import hashlib
        token_hash = hashlib.sha256(auth_header.encode()).hexdigest()[:16]
        return f"token:{token_hash}"

    # Fall back to IP address for unauthenticated requests
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # Get the first IP in the chain (original client)
        return forwarded.split(",")[0].strip()

    return get_remote_address(request)


# Initialize the rate limiter with custom key function
limiter = Limiter(key_func=get_user_identifier)


def setup_rate_limiting(app):
    """
    Setup rate limiting middleware and exception handler for a FastAPI app.
    
    Usage:
        from rate_limiter import setup_rate_limiting, limiter, RATE_LIMITS
        
        setup_rate_limiting(app)
        
        @app.get("/api/v1/endpoint")
        @limiter.limit(RATE_LIMITS["default"])
        async def my_endpoint(request: Request):
            ...
    """
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

