"""
Performance Middleware for FastAPI
Provides timing, profiling, and response compression
"""
import gzip
import time
from io import BytesIO
from typing import Callable

from fastapi import Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.types import ASGIApp


class TimingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to track request timing and log slow endpoints.
    Adds X-Response-Time header to all responses.
    """
    
    SLOW_REQUEST_THRESHOLD_MS = 500  # Log warning for requests > 500ms
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.perf_counter()
        
        # Get request details for logging
        method = request.method
        path = request.url.path
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration_ms = (time.perf_counter() - start_time) * 1000
        
        # Add timing header
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
        
        # Log slow requests
        if duration_ms > self.SLOW_REQUEST_THRESHOLD_MS:
            logger.warning(
                f"SLOW REQUEST: {method} {path} took {duration_ms:.2f}ms"
            )
        elif duration_ms > 100:  # Log debug for moderate requests
            logger.debug(f"REQUEST: {method} {path} - {duration_ms:.2f}ms")
            
        return response


class CacheControlMiddleware(BaseHTTPMiddleware):
    """
    Enhanced middleware to add cache control headers for optimal performance.
    
    Caching Strategy:
    - Fingerprinted assets (hash in filename): 1 year, immutable
    - Static assets without hash: 7 days
    - API responses: Configurable per endpoint
    - HTML files: No cache (always fresh)
    """
    
    # File extensions and their caching policies
    IMMUTABLE_EXTENSIONS = {'.woff', '.woff2', '.ttf', '.eot'}  # Fonts rarely change
    STATIC_EXTENSIONS = {'.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif'}
    
    # Cache durations
    IMMUTABLE_MAX_AGE = 31536000  # 1 year for immutable assets
    STATIC_MAX_AGE = 604800  # 7 days for static assets
    SHORT_CACHE_MAX_AGE = 86400  # 1 day for less static content
    
    # Cacheable API endpoints (path prefix -> max_age in seconds)
    CACHEABLE_API_ENDPOINTS = {
        "/api/v1/health": 60,  # 1 minute
        "/api/v1/info": 300,  # 5 minutes
        "/api/v1/brands": 600,  # 10 minutes
        "/api/v1/trends": 1800,  # 30 minutes
    }
    
    # Private (user-specific) cacheable endpoints
    PRIVATE_CACHEABLE_ENDPOINTS = {
        "/api/v1/body/history": 300,  # 5 minutes
        "/api/v1/body/progress": 300,  # 5 minutes
        "/api/v1/wardrobe/analytics": 300,  # 5 minutes
        "/api/v1/fashion-iq/score": 300,  # 5 minutes
    }
    
    def _is_fingerprinted(self, path: str) -> bool:
        """Check if file has content hash in filename (e.g., main.abc123.js)"""
        import re
        # Match patterns like: name.hash.ext or name-hash.ext
        return bool(re.search(r'[.-][a-f0-9]{8,}\.', path.lower()))
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        path = request.url.path
        
        # Skip if Cache-Control already set
        if "Cache-Control" in response.headers:
            return response
        
        # 1. Immutable assets (fonts)
        for ext in self.IMMUTABLE_EXTENSIONS:
            if path.endswith(ext):
                response.headers["Cache-Control"] = f"public, max-age={self.IMMUTABLE_MAX_AGE}, immutable"
                return response
        
        # 2. Static assets with fingerprint (hash in filename)
        for ext in self.STATIC_EXTENSIONS:
            if path.endswith(ext):
                if self._is_fingerprinted(path):
                    response.headers["Cache-Control"] = f"public, max-age={self.IMMUTABLE_MAX_AGE}, immutable"
                else:
                    response.headers["Cache-Control"] = f"public, max-age={self.STATIC_MAX_AGE}"
                return response
        
        # 3. API endpoints
        if path.startswith("/api/"):
            # Check for public cacheable endpoints
            for endpoint_prefix, max_age in self.CACHEABLE_API_ENDPOINTS.items():
                if path.startswith(endpoint_prefix):
                    response.headers["Cache-Control"] = f"public, max-age={max_age}"
                    return response
            
            # Check for private (user-specific) cacheable endpoints
            for endpoint_prefix, max_age in self.PRIVATE_CACHEABLE_ENDPOINTS.items():
                if path.startswith(endpoint_prefix):
                    response.headers["Cache-Control"] = f"private, max-age={max_age}"
                    return response
            
            # Default: Don't cache API responses
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            return response
        
        # 4. HTML files - don't cache SPA root
        if path == "/" or path.endswith(".html"):
            response.headers["Cache-Control"] = "no-cache, must-revalidate"
            return response
        
        return response


class ETagMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add ETag headers for efficient caching.
    Returns 304 Not Modified if content hasn't changed.
    """
    
    # Only add ETags for these content types
    ETAG_CONTENT_TYPES = {
        "application/json",
        "text/html",
        "text/plain",
    }
    
    # Skip ETag for these paths
    SKIP_PATHS = {
        "/api/v1/auth/",
        "/api/v1/payment/",
    }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        import hashlib
        from starlette.responses import Response as StarletteResponse
        
        # Only process GET requests
        if request.method != "GET":
            return await call_next(request)
        
        # Skip certain paths
        path = request.url.path
        for skip_path in self.SKIP_PATHS:
            if path.startswith(skip_path):
                return await call_next(request)
        
        response = await call_next(request)
        
        # Only add ETag for specific content types
        content_type = response.headers.get("content-type", "").split(";")[0]
        if content_type not in self.ETAG_CONTENT_TYPES:
            return response
        
        # Read response body to compute ETag
        body = b""
        async for chunk in response.body_iterator:
            body += chunk
        
        if not body:
            return response
        
        # Generate ETag from content hash
        etag = f'"{hashlib.md5(body).hexdigest()}"'
        
        # Check If-None-Match header
        if_none_match = request.headers.get("if-none-match")
        if if_none_match and if_none_match == etag:
            # Content hasn't changed, return 304
            return StarletteResponse(
                status_code=304,
                headers={
                    "ETag": etag,
                    "Cache-Control": response.headers.get("Cache-Control", ""),
                }
            )
        
        # Return response with ETag
        headers = dict(response.headers)
        headers["ETag"] = etag
        
        return StarletteResponse(
            content=body,
            status_code=response.status_code,
            headers=headers,
            media_type=response.media_type
        )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for structured request logging.
    Useful for debugging and monitoring.
    """
    
    EXCLUDED_PATHS = {"/health", "/api/health", "/favicon.ico"}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip logging for health checks and common paths
        if request.url.path in self.EXCLUDED_PATHS:
            return await call_next(request)
        
        # Log request start
        client_ip = request.client.host if request.client else "unknown"
        
        response = await call_next(request)
        
        # Log request completion with status
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Client: {client_ip}"
        )
        
        return response


def setup_performance_middleware(app: ASGIApp) -> None:
    """
    Set up all performance-related middleware for the FastAPI app.
    
    Order matters - middleware is applied in reverse order:
    1. GZip (applied last, closest to response)
    2. ETag (generates entity tags for caching)
    3. Cache Control (sets cache headers)
    4. Timing (applied first, wraps everything)
    
    Args:
        app: FastAPI application instance
    """
    # GZip compression for responses > 500 bytes
    app.add_middleware(GZipMiddleware, minimum_size=500)
    
    # ETag generation for 304 Not Modified support
    app.add_middleware(ETagMiddleware)
    
    # Cache control headers
    app.add_middleware(CacheControlMiddleware)
    
    # Request timing (should be first to capture total time)
    app.add_middleware(TimingMiddleware)
    
    logger.info("Performance middleware configured: GZip, ETag, CacheControl, Timing")


# Performance monitoring utilities
class PerformanceStats:
    """Track performance statistics across requests."""
    
    def __init__(self):
        self.request_count = 0
        self.total_time_ms = 0.0
        self.slow_requests = 0
        self.endpoints: dict[str, list[float]] = {}
    
    def record(self, endpoint: str, duration_ms: float):
        """Record a request timing."""
        self.request_count += 1
        self.total_time_ms += duration_ms
        
        if duration_ms > 500:
            self.slow_requests += 1
        
        if endpoint not in self.endpoints:
            self.endpoints[endpoint] = []
        
        # Keep last 100 timings per endpoint
        if len(self.endpoints[endpoint]) >= 100:
            self.endpoints[endpoint].pop(0)
        self.endpoints[endpoint].append(duration_ms)
    
    def get_stats(self) -> dict:
        """Get aggregated performance statistics."""
        endpoint_stats = {}
        for endpoint, timings in self.endpoints.items():
            if timings:
                endpoint_stats[endpoint] = {
                    "count": len(timings),
                    "avg_ms": sum(timings) / len(timings),
                    "min_ms": min(timings),
                    "max_ms": max(timings),
                    "p95_ms": sorted(timings)[int(len(timings) * 0.95)] if len(timings) > 10 else max(timings)
                }
        
        return {
            "total_requests": self.request_count,
            "total_time_ms": self.total_time_ms,
            "avg_time_ms": self.total_time_ms / self.request_count if self.request_count > 0 else 0,
            "slow_requests": self.slow_requests,
            "slow_request_rate": self.slow_requests / self.request_count if self.request_count > 0 else 0,
            "endpoints": endpoint_stats
        }


# Global performance stats instance
_perf_stats = PerformanceStats()


def get_performance_stats() -> PerformanceStats:
    """Get global performance stats instance."""
    return _perf_stats
