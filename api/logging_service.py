"""
Structured Logging Service

Provides JSON-formatted structured logging with:
- Request correlation IDs for tracing
- Context enrichment (user, request, etc.)
- Log levels and filtering
- Integration with Loguru

Usage:
    from api.logging_service import setup_logging, get_logger, correlation_context

    # In app startup
    setup_logging(app, environment="production")

    # In request handlers
    logger = get_logger(__name__)
    with correlation_context(request):
        logger.info("Processing request", user_id=123, action="body_scan")
"""
import json
import sys
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from functools import wraps
from typing import Any, Callable

from fastapi import FastAPI, Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware

# Context variable for request correlation
_correlation_id: ContextVar[str | None] = ContextVar("correlation_id", default=None)
_request_context: ContextVar[dict] = ContextVar("request_context", default={})


# ============================================================================
# Correlation ID Management
# ============================================================================

def get_correlation_id() -> str | None:
    """Get the current correlation ID for request tracing."""
    return _correlation_id.get()


def set_correlation_id(correlation_id: str) -> None:
    """Set the correlation ID for the current context."""
    _correlation_id.set(correlation_id)


def generate_correlation_id() -> str:
    """Generate a new unique correlation ID."""
    return str(uuid.uuid4())[:8]  # Short ID for readability


def get_request_context() -> dict:
    """Get the current request context."""
    return _request_context.get()


def set_request_context(**kwargs) -> None:
    """Set request context values."""
    ctx = _request_context.get().copy()
    ctx.update(kwargs)
    _request_context.set(ctx)


# ============================================================================
# JSON Log Formatter
# ============================================================================

def json_formatter(record: dict) -> str:
    """
    Format log record as JSON for structured logging.
    
    Output format:
    {
        "timestamp": "2024-01-15T10:30:00.123Z",
        "level": "INFO",
        "message": "User logged in",
        "correlation_id": "abc12345",
        "logger": "api.auth",
        "file": "auth.py:42",
        "context": { "user_id": 123, "action": "login" }
    }
    """
    # Base log entry
    log_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "level": record["level"].name,
        "message": record["message"],
        "logger": record["name"],
        "file": f"{record['file'].name}:{record['line']}",
        "function": record["function"],
    }
    
    # Add correlation ID if present
    correlation_id = get_correlation_id()
    if correlation_id:
        log_entry["correlation_id"] = correlation_id
    
    # Add request context if present
    request_ctx = get_request_context()
    if request_ctx:
        log_entry["context"] = request_ctx
    
    # Add extra fields from the log call
    if record["extra"]:
        extra = {k: v for k, v in record["extra"].items() 
                 if k not in ("correlation_id",)}
        if extra:
            log_entry["extra"] = extra
    
    # Add exception info if present
    if record["exception"]:
        log_entry["exception"] = {
            "type": record["exception"].type.__name__ if record["exception"].type else None,
            "value": str(record["exception"].value) if record["exception"].value else None,
            "traceback": record["exception"].traceback if record["exception"].traceback else None,
        }
    
    return json.dumps(log_entry, default=str) + "\n"


def simple_formatter(record: dict) -> str:
    """Simple colored format for development."""
    correlation_id = get_correlation_id()
    correlation_str = f"[{correlation_id}] " if correlation_id else ""
    
    return (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        f"<cyan>{correlation_str}</cyan>"
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>\n"
    )


# ============================================================================
# Logging Configuration
# ============================================================================

def setup_logging(
    app: FastAPI | None = None,
    environment: str = "development",
    log_level: str = "INFO",
    json_logs: bool | None = None,
    log_file: str | None = None,
) -> None:
    """
    Set up structured logging for the application.
    
    Args:
        app: FastAPI app to add middleware to
        environment: Environment name (development, staging, production)
        log_level: Minimum log level (DEBUG, INFO, WARNING, ERROR)
        json_logs: Force JSON format (auto-detected from environment if None)
        log_file: Optional file path for log output
    """
    # Remove default logger
    logger.remove()
    
    # Determine if we should use JSON format
    use_json = json_logs if json_logs is not None else (environment != "development")
    
    # Console handler
    if use_json:
        logger.add(
            sys.stdout,
            format=json_formatter,
            level=log_level,
            colorize=False,
            serialize=False,
        )
    else:
        logger.add(
            sys.stdout,
            format=simple_formatter,
            level=log_level,
            colorize=True,
        )
    
    # File handler (if specified)
    if log_file:
        logger.add(
            log_file,
            format=json_formatter,
            level=log_level,
            rotation="100 MB",
            retention="7 days",
            compression="gz",
            serialize=False,
        )
    
    # Rotating file for production (always JSON)
    if environment == "production":
        logger.add(
            "logs/app.log",
            format=json_formatter,
            level="INFO",
            rotation="50 MB",
            retention="30 days",
            compression="gz",
            enqueue=True,  # Thread-safe async writing
        )
        
        # Separate error log
        logger.add(
            "logs/error.log",
            format=json_formatter,
            level="ERROR",
            rotation="20 MB",
            retention="90 days",
            compression="gz",
            enqueue=True,
        )
    
    # Add request tracing middleware
    if app:
        app.add_middleware(BaseHTTPMiddleware, dispatch=logging_middleware)
    
    logger.info(
        f"Logging configured: env={environment}, level={log_level}, json={use_json}"
    )


async def logging_middleware(request: Request, call_next: Callable) -> Response:
    """
    Middleware to add correlation ID and log requests.
    """
    # Get or generate correlation ID
    correlation_id = request.headers.get("X-Correlation-ID") or generate_correlation_id()
    set_correlation_id(correlation_id)
    
    # Set request context
    set_request_context(
        method=request.method,
        path=request.url.path,
        client_ip=request.client.host if request.client else "unknown",
    )
    
    # Log request start
    logger.info(f"Request started: {request.method} {request.url.path}")
    
    # Process request
    start_time = datetime.now(timezone.utc)
    try:
        response = await call_next(request)
    except Exception as e:
        logger.exception(f"Request failed: {e}")
        raise
    finally:
        # Calculate duration
        duration_ms = (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
    
    # Add correlation ID to response headers
    response.headers["X-Correlation-ID"] = correlation_id
    
    # Log request completion
    logger.info(
        f"Request completed: {request.method} {request.url.path}",
        status_code=response.status_code,
        duration_ms=round(duration_ms, 2),
    )
    
    # Clear context
    _correlation_id.set(None)
    _request_context.set({})
    
    return response


# ============================================================================
# Logger Helpers
# ============================================================================

def get_logger(name: str = __name__):
    """
    Get a logger instance with the given name.
    
    Usage:
        logger = get_logger(__name__)
        logger.info("Something happened", user_id=123)
    """
    return logger.bind(name=name)


class LogContext:
    """
    Context manager for adding temporary context to logs.
    
    Usage:
        with LogContext(user_id=123, action="checkout"):
            logger.info("Processing payment")  # Includes user_id and action
    """
    
    def __init__(self, **kwargs):
        self.context = kwargs
        self._token = None
    
    def __enter__(self):
        current = _request_context.get().copy()
        current.update(self.context)
        self._token = _request_context.set(current)
        return self
    
    def __exit__(self, *args):
        if self._token:
            _request_context.reset(self._token)


def log_context(**kwargs):
    """Decorator to add context to all logs within a function."""
    def decorator(func: Callable):
        @wraps(func)
        async def async_wrapper(*args, **kw):
            with LogContext(**kwargs):
                return await func(*args, **kw)
        
        @wraps(func)
        def sync_wrapper(*args, **kw):
            with LogContext(**kwargs):
                return func(*args, **kw)
        
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


# ============================================================================
# Specialized Loggers
# ============================================================================

def log_user_action(user_id: int, action: str, **details) -> None:
    """Log a user action for audit trail."""
    with LogContext(user_id=user_id, action=action, **details):
        logger.info(f"User action: {action}")


def log_payment(user_id: int, amount: float, currency: str, status: str, **details) -> None:
    """Log a payment event."""
    with LogContext(
        user_id=user_id,
        payment_amount=amount,
        currency=currency,
        payment_status=status,
        **details
    ):
        level = "info" if status == "success" else "warning"
        getattr(logger, level)(f"Payment {status}: {currency} {amount}")


def log_security_event(event_type: str, severity: str = "warning", **details) -> None:
    """Log a security-related event."""
    with LogContext(security_event=event_type, severity=severity, **details):
        log_func = logger.warning if severity == "warning" else logger.error
        log_func(f"Security event: {event_type}")


def log_performance(operation: str, duration_ms: float, **details) -> None:
    """Log a performance measurement."""
    with LogContext(operation=operation, duration_ms=duration_ms, **details):
        level = "warning" if duration_ms > 1000 else "debug"
        getattr(logger, level)(f"Performance: {operation} took {duration_ms:.2f}ms")
