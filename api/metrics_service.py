"""
Prometheus Metrics Service for Application Performance Monitoring

Provides:
- Request/response metrics (latency, throughput, errors)
- Database query performance tracking
- Custom business KPI metrics
- Health endpoint with metrics

Setup:
1. pip install prometheus-client prometheus-fastapi-instrumentator
2. Import and call setup_metrics(app) in app.py
3. Access metrics at /metrics endpoint

For visualization:
- Set up Prometheus to scrape /metrics
- Use Grafana dashboards for visualization
"""
import time
from functools import wraps
from typing import Callable

from fastapi import FastAPI, Request, Response
from loguru import logger

# Check if prometheus_client is available
try:
    from prometheus_client import (
        Counter,
        Histogram,
        Gauge,
        Info,
        generate_latest,
        CONTENT_TYPE_LATEST,
        CollectorRegistry,
        REGISTRY,
    )
    from prometheus_client.multiprocess import MultiProcessCollector
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    logger.warning("prometheus-client not installed. Run: pip install prometheus-client")

# Metric definitions (only if prometheus is available)
if PROMETHEUS_AVAILABLE:
    # Request metrics
    REQUEST_COUNT = Counter(
        'http_requests_total',
        'Total HTTP requests',
        ['method', 'endpoint', 'status_code']
    )
    
    REQUEST_LATENCY = Histogram(
        'http_request_duration_seconds',
        'HTTP request latency in seconds',
        ['method', 'endpoint'],
        buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
    )
    
    REQUEST_IN_PROGRESS = Gauge(
        'http_requests_in_progress',
        'Number of HTTP requests currently being processed',
        ['method', 'endpoint']
    )
    
    # Database metrics
    DB_QUERY_COUNT = Counter(
        'db_queries_total',
        'Total database queries',
        ['operation', 'table']
    )
    
    DB_QUERY_LATENCY = Histogram(
        'db_query_duration_seconds',
        'Database query latency in seconds',
        ['operation', 'table'],
        buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0]
    )
    
    DB_CONNECTION_POOL = Gauge(
        'db_connection_pool_size',
        'Database connection pool size',
        ['state']  # active, idle, total
    )
    
    # Business KPI metrics
    USERS_REGISTERED = Counter(
        'users_registered_total',
        'Total users registered',
        ['subscription_type']  # free, pro, enterprise
    )
    
    BODY_SCANS_PROCESSED = Counter(
        'body_scans_processed_total',
        'Total body scans processed',
        ['status']  # success, failure
    )
    
    MEASUREMENTS_SAVED = Counter(
        'measurements_saved_total',
        'Total measurements saved',
        ['user_type']  # free, pro
    )
    
    ACTIVE_SESSIONS = Gauge(
        'active_sessions_current',
        'Current number of active sessions'
    )
    
    PAYMENT_TRANSACTIONS = Counter(
        'payment_transactions_total',
        'Total payment transactions',
        ['status', 'plan']  # success/failure, monthly/annual
    )
    
    SUBSCRIPTION_REVENUE = Counter(
        'subscription_revenue_total_inr',
        'Total subscription revenue in INR',
        ['plan']
    )
    
    # Cache metrics
    CACHE_HITS = Counter(
        'cache_hits_total',
        'Total cache hits',
        ['cache_type']  # redis, memory
    )
    
    CACHE_MISSES = Counter(
        'cache_misses_total',
        'Total cache misses',
        ['cache_type']
    )
    
    # Application info
    APP_INFO = Info(
        'app',
        'Application information'
    )


def setup_metrics(app: FastAPI) -> None:
    """
    Set up Prometheus metrics collection for FastAPI app.
    
    Args:
        app: FastAPI application instance
    """
    if not PROMETHEUS_AVAILABLE:
        logger.warning("Prometheus metrics disabled - prometheus-client not installed")
        return
    
    # Set application info
    APP_INFO.info({
        'name': 'aibodyscan',
        'version': '1.0.0',
        'environment': 'development',
    })
    
    # Add metrics endpoint
    @app.get("/metrics", include_in_schema=False)
    async def metrics():
        """Prometheus metrics endpoint"""
        return Response(
            content=generate_latest(REGISTRY),
            media_type=CONTENT_TYPE_LATEST
        )
    
    # Add middleware for request metrics
    @app.middleware("http")
    async def metrics_middleware(request: Request, call_next: Callable) -> Response:
        if request.url.path == "/metrics":
            return await call_next(request)
        
        method = request.method
        # Normalize path to avoid high cardinality
        endpoint = _normalize_path(request.url.path)
        
        # Track in-progress requests
        REQUEST_IN_PROGRESS.labels(method=method, endpoint=endpoint).inc()
        
        start_time = time.perf_counter()
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise
        finally:
            duration = time.perf_counter() - start_time
            
            # Record metrics
            REQUEST_COUNT.labels(
                method=method,
                endpoint=endpoint,
                status_code=status_code
            ).inc()
            
            REQUEST_LATENCY.labels(
                method=method,
                endpoint=endpoint
            ).observe(duration)
            
            REQUEST_IN_PROGRESS.labels(method=method, endpoint=endpoint).dec()
        
        return response
    
    logger.info("Prometheus metrics enabled at /metrics")


def _normalize_path(path: str) -> str:
    """
    Normalize URL path to reduce cardinality.
    Replaces dynamic segments with placeholders.
    """
    import re
    
    # Replace numeric IDs with placeholder
    path = re.sub(r'/\d+', '/{id}', path)
    
    # Replace UUIDs with placeholder
    path = re.sub(r'/[a-f0-9-]{36}', '/{uuid}', path)
    
    # Common path patterns
    path = re.sub(r'/user/[^/]+', '/user/{user}', path)
    
    return path


# ============================================================================
# Metric Recording Functions
# ============================================================================

def record_db_query(operation: str, table: str, duration_seconds: float) -> None:
    """Record a database query for metrics."""
    if not PROMETHEUS_AVAILABLE:
        return
    
    DB_QUERY_COUNT.labels(operation=operation, table=table).inc()
    DB_QUERY_LATENCY.labels(operation=operation, table=table).observe(duration_seconds)


def record_user_registration(subscription_type: str = "free") -> None:
    """Record a new user registration."""
    if not PROMETHEUS_AVAILABLE:
        return
    
    USERS_REGISTERED.labels(subscription_type=subscription_type).inc()


def record_body_scan(success: bool) -> None:
    """Record a body scan processing result."""
    if not PROMETHEUS_AVAILABLE:
        return
    
    status = "success" if success else "failure"
    BODY_SCANS_PROCESSED.labels(status=status).inc()


def record_measurement_saved(is_pro: bool = False) -> None:
    """Record a measurement save."""
    if not PROMETHEUS_AVAILABLE:
        return
    
    user_type = "pro" if is_pro else "free"
    MEASUREMENTS_SAVED.labels(user_type=user_type).inc()


def update_active_sessions(count: int) -> None:
    """Update the active sessions gauge."""
    if not PROMETHEUS_AVAILABLE:
        return
    
    ACTIVE_SESSIONS.set(count)


def record_payment(success: bool, plan: str, amount_inr: float = 0) -> None:
    """Record a payment transaction."""
    if not PROMETHEUS_AVAILABLE:
        return
    
    status = "success" if success else "failure"
    PAYMENT_TRANSACTIONS.labels(status=status, plan=plan).inc()
    
    if success and amount_inr > 0:
        SUBSCRIPTION_REVENUE.labels(plan=plan).inc(amount_inr)


def record_cache_access(hit: bool, cache_type: str = "redis") -> None:
    """Record a cache hit or miss."""
    if not PROMETHEUS_AVAILABLE:
        return
    
    if hit:
        CACHE_HITS.labels(cache_type=cache_type).inc()
    else:
        CACHE_MISSES.labels(cache_type=cache_type).inc()


def update_db_pool_metrics(active: int, idle: int, total: int) -> None:
    """Update database connection pool metrics."""
    if not PROMETHEUS_AVAILABLE:
        return
    
    DB_CONNECTION_POOL.labels(state="active").set(active)
    DB_CONNECTION_POOL.labels(state="idle").set(idle)
    DB_CONNECTION_POOL.labels(state="total").set(total)


# ============================================================================
# Decorators for automatic metric collection
# ============================================================================

def track_db_query(operation: str, table: str):
    """
    Decorator to track database query performance.
    
    Usage:
        @track_db_query("SELECT", "users")
        def get_user(user_id: int):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                return func(*args, **kwargs)
            finally:
                duration = time.perf_counter() - start
                record_db_query(operation, table, duration)
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                return await func(*args, **kwargs)
            finally:
                duration = time.perf_counter() - start
                record_db_query(operation, table, duration)
        
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


def track_operation(operation_name: str):
    """
    Decorator to track custom operation latency.
    
    Usage:
        @track_operation("ai_body_analysis")
        def analyze_body(image):
            ...
    """
    if not PROMETHEUS_AVAILABLE:
        def decorator(func):
            return func
        return decorator
    
    # Create histogram for this operation
    operation_latency = Histogram(
        f'operation_{operation_name}_duration_seconds',
        f'Duration of {operation_name} operation in seconds',
        buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0]
    )
    
    def decorator(func: Callable):
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                return func(*args, **kwargs)
            finally:
                operation_latency.observe(time.perf_counter() - start)
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                return await func(*args, **kwargs)
            finally:
                operation_latency.observe(time.perf_counter() - start)
        
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


# ============================================================================
# Metrics Summary Endpoint
# ============================================================================

def get_metrics_summary() -> dict:
    """
    Get a human-readable summary of key metrics.
    Useful for health checks and dashboards.
    """
    if not PROMETHEUS_AVAILABLE:
        return {"error": "Prometheus not available"}
    
    try:
        # Get sample values (this is simplified - in production use queries)
        return {
            "status": "healthy",
            "metrics_enabled": True,
            "available_metrics": [
                "http_requests_total",
                "http_request_duration_seconds",
                "db_queries_total",
                "db_query_duration_seconds",
                "users_registered_total",
                "body_scans_processed_total",
                "payment_transactions_total",
                "cache_hits_total",
            ]
        }
    except Exception as e:
        return {"error": str(e)}
