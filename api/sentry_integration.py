"""
Sentry Error Tracking Integration

Provides error tracking, performance monitoring, and release tracking
for the AIBodyScan API.

Setup:
1. Create a Sentry account at https://sentry.io
2. Create a new project (Python/FastAPI)
3. Get your DSN from Project Settings > Client Keys
4. Set SENTRY_DSN environment variable

Features:
- Automatic exception capture
- Performance tracing for API endpoints
- User context attachment
- Environment-aware configuration
- Release tracking
"""
import os
from typing import Callable

from fastapi import FastAPI, Request
from loguru import logger

# Check if Sentry SDK is available
try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
    from sentry_sdk.integrations.redis import RedisIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False
    logger.warning("Sentry SDK not installed. Run: pip install sentry-sdk[fastapi]")


def init_sentry(
    dsn: str | None = None,
    environment: str = "development",
    release: str | None = None,
    traces_sample_rate: float = 0.1,
    profiles_sample_rate: float = 0.1,
) -> bool:
    """
    Initialize Sentry error tracking.
    
    Args:
        dsn: Sentry DSN (Data Source Name). If None, reads from SENTRY_DSN env var.
        environment: Environment name (development, staging, production)
        release: Release version (e.g., "aibodyscan@1.0.0"). Auto-detected if None.
        traces_sample_rate: Percentage of transactions to trace (0.0 to 1.0)
        profiles_sample_rate: Percentage of traces to profile (0.0 to 1.0)
    
    Returns:
        True if Sentry was initialized, False otherwise
    """
    if not SENTRY_AVAILABLE:
        logger.warning("Sentry SDK not available. Install with: pip install sentry-sdk[fastapi]")
        return False
    
    # Get DSN from environment if not provided
    dsn = dsn or os.getenv("SENTRY_DSN")
    
    if not dsn:
        logger.info("Sentry DSN not configured. Error tracking disabled.")
        return False
    
    # Auto-detect release version
    if release is None:
        release = os.getenv("SENTRY_RELEASE", "aibodyscan@1.0.0")
    
    # Configure integrations
    integrations = [
        FastApiIntegration(transaction_style="endpoint"),
        SqlalchemyIntegration(),
        LoggingIntegration(
            level=None,  # Capture all levels
            event_level=40,  # Only send ERROR and above as events
        ),
    ]
    
    # Add Redis integration if available
    try:
        import redis
        integrations.append(RedisIntegration())
    except ImportError:
        pass
    
    # Initialize Sentry
    sentry_sdk.init(
        dsn=dsn,
        environment=environment,
        release=release,
        integrations=integrations,
        
        # Performance monitoring
        traces_sample_rate=traces_sample_rate,
        profiles_sample_rate=profiles_sample_rate,
        
        # Filter out noisy errors
        before_send=_before_send,
        
        # Attach server name
        server_name=os.getenv("HOSTNAME", "aibodyscan-api"),
        
        # Enable source context
        attach_stacktrace=True,
        
        # Don't send PII by default
        send_default_pii=False,
    )
    
    logger.info(f"Sentry initialized: env={environment}, release={release}")
    return True


def _before_send(event: dict, hint: dict) -> dict | None:
    """
    Filter events before sending to Sentry.
    
    Use this to:
    - Filter out expected errors
    - Redact sensitive data
    - Add custom context
    """
    # Get exception info if available
    exc_info = hint.get("exc_info")
    if exc_info:
        exc_type, exc_value, _ = exc_info
        
        # Filter out common expected errors
        if exc_type.__name__ in {
            "ConnectionRefusedError",  # DB/Redis connection issues during startup
            "KeyboardInterrupt",  # Server shutdown
        }:
            return None
        
        # Filter out auth errors (expected behavior, not bugs)
        if "unauthorized" in str(exc_value).lower():
            return None
        
        # Redact sensitive data from exception messages
        if event.get("exception"):
            for value in event["exception"].get("values", []):
                if "password" in str(value.get("value", "")).lower():
                    value["value"] = "[REDACTED - contains password]"
    
    return event


def set_user_context(user_id: int | str, email: str | None = None, username: str | None = None) -> None:
    """
    Set user context for error tracking.
    Call this after authentication to attach user info to errors.
    
    Args:
        user_id: Unique user identifier
        email: User email (optional, for Sentry notifications)
        username: User display name
    """
    if not SENTRY_AVAILABLE:
        return
    
    sentry_sdk.set_user({
        "id": str(user_id),
        "email": email,
        "username": username,
    })


def clear_user_context() -> None:
    """Clear user context (call on logout)."""
    if SENTRY_AVAILABLE:
        sentry_sdk.set_user(None)


def capture_message(message: str, level: str = "info", **extras) -> str | None:
    """
    Capture a message/log to Sentry.
    
    Args:
        message: Message to send
        level: Severity level (debug, info, warning, error, fatal)
        **extras: Additional context to attach
    
    Returns:
        Sentry event ID or None
    """
    if not SENTRY_AVAILABLE:
        return None
    
    with sentry_sdk.push_scope() as scope:
        for key, value in extras.items():
            scope.set_extra(key, value)
        return sentry_sdk.capture_message(message, level=level)


def capture_exception(exception: Exception, **extras) -> str | None:
    """
    Manually capture an exception to Sentry.
    
    Args:
        exception: The exception to capture
        **extras: Additional context to attach
    
    Returns:
        Sentry event ID or None
    """
    if not SENTRY_AVAILABLE:
        return None
    
    with sentry_sdk.push_scope() as scope:
        for key, value in extras.items():
            scope.set_extra(key, value)
        return sentry_sdk.capture_exception(exception)


def add_breadcrumb(
    message: str,
    category: str = "custom",
    level: str = "info",
    data: dict | None = None
) -> None:
    """
    Add a breadcrumb for debugging context.
    
    Breadcrumbs are shown in the Sentry UI to help understand
    what happened before an error occurred.
    
    Args:
        message: Breadcrumb message
        category: Category (custom, http, navigation, etc.)
        level: Severity level
        data: Additional data to attach
    """
    if not SENTRY_AVAILABLE:
        return
    
    sentry_sdk.add_breadcrumb(
        message=message,
        category=category,
        level=level,
        data=data or {},
    )


def set_tag(key: str, value: str) -> None:
    """
    Set a tag for filtering/grouping errors.
    
    Tags are indexed and searchable in Sentry.
    
    Args:
        key: Tag name (e.g., "subscription_tier")
        value: Tag value (e.g., "pro")
    """
    if SENTRY_AVAILABLE:
        sentry_sdk.set_tag(key, value)


def set_context(name: str, data: dict) -> None:
    """
    Set additional context for debugging.
    
    Context is shown in the Sentry UI but not indexed.
    
    Args:
        name: Context name (e.g., "payment_info")
        data: Context data
    """
    if SENTRY_AVAILABLE:
        sentry_sdk.set_context(name, data)


# Middleware for automatic error tracking
async def sentry_middleware(request: Request, call_next: Callable):
    """
    Middleware to enhance Sentry error tracking.
    
    Adds request context and user info to errors.
    """
    if not SENTRY_AVAILABLE:
        return await call_next(request)
    
    with sentry_sdk.configure_scope() as scope:
        # Add request context
        scope.set_context("request", {
            "url": str(request.url),
            "method": request.method,
            "headers": dict(request.headers),
        })
        
        # Add user context if authenticated
        user = getattr(request.state, "user", None)
        if user:
            set_user_context(user.id, user.email, user.fullname)
        
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Exception will be captured by Sentry automatically
            raise


def setup_sentry_for_app(app: FastAPI) -> None:
    """
    Set up Sentry for a FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    environment = os.getenv("ENVIRONMENT", "development")
    
    # Initialize Sentry
    initialized = init_sentry(
        environment=environment,
        traces_sample_rate=0.2 if environment == "production" else 0.5,
        profiles_sample_rate=0.1 if environment == "production" else 0.3,
    )
    
    if initialized:
        # Add middleware for extra context
        from starlette.middleware.base import BaseHTTPMiddleware
        app.add_middleware(BaseHTTPMiddleware, dispatch=sentry_middleware)
        logger.info(f"Sentry error tracking enabled for {environment}")
