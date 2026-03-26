"""
Health Check Endpoints

Provides health and readiness probes for:
- Kubernetes liveness/readiness checks
- Load balancer health checks
- Uptime monitoring services

Endpoints:
- GET /health - Basic health check (liveness)
- GET /ready - Readiness check (all dependencies)
- GET /health/detailed - Detailed system status
"""
import asyncio
import os
import time
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from loguru import logger

# Track startup time
_startup_time = time.time()


# ============================================================================
# Response Models
# ============================================================================

class HealthStatus(BaseModel):
    """Basic health response."""
    status: str  # "healthy" or "unhealthy"
    timestamp: str
    version: str
    uptime_seconds: float


class DependencyStatus(BaseModel):
    """Status of a single dependency."""
    name: str
    status: str  # "healthy", "unhealthy", "degraded"
    latency_ms: float | None = None
    message: str | None = None


class DetailedHealthStatus(BaseModel):
    """Detailed health response with all dependencies."""
    status: str
    timestamp: str
    version: str
    uptime_seconds: float
    environment: str
    dependencies: list[DependencyStatus]


# ============================================================================
# Health Check Functions
# ============================================================================

async def check_database() -> DependencyStatus:
    """Check database connectivity."""
    start = time.perf_counter()
    try:
        from api.db import get_db_session
        from sqlmodel import text
        
        async for session in get_db_session():
            result = await session.execute(text("SELECT 1"))
            result.fetchone()
            break
        
        latency = (time.perf_counter() - start) * 1000
        return DependencyStatus(
            name="database",
            status="healthy",
            latency_ms=round(latency, 2),
        )
    except Exception as e:
        latency = (time.perf_counter() - start) * 1000
        logger.error(f"Database health check failed: {e}")
        return DependencyStatus(
            name="database",
            status="unhealthy",
            latency_ms=round(latency, 2),
            message=str(e)[:100],
        )


async def check_redis() -> DependencyStatus:
    """Check Redis connectivity."""
    start = time.perf_counter()
    try:
        from integrations.cache_service import get_cache
        
        cache = get_cache()
        if cache.enabled and cache.client:
            cache.client.ping()
            latency = (time.perf_counter() - start) * 1000
            return DependencyStatus(
                name="redis",
                status="healthy",
                latency_ms=round(latency, 2),
            )
        else:
            return DependencyStatus(
                name="redis",
                status="degraded",
                message="Redis not configured",
            )
    except Exception as e:
        latency = (time.perf_counter() - start) * 1000
        logger.warning(f"Redis health check failed: {e}")
        return DependencyStatus(
            name="redis",
            status="degraded",
            latency_ms=round(latency, 2),
            message=str(e)[:100],
        )


async def check_external_apis() -> list[DependencyStatus]:
    """Check external API dependencies."""
    results = []
    
    # Check Razorpay (if configured)
    razorpay_key = os.getenv("RAZORPAY_KEY_ID")
    if razorpay_key:
        results.append(DependencyStatus(
            name="razorpay",
            status="healthy",
            message="Configured",
        ))
    else:
        results.append(DependencyStatus(
            name="razorpay",
            status="degraded",
            message="Not configured",
        ))
    
    return results


async def check_disk_space() -> DependencyStatus:
    """Check available disk space."""
    try:
        import shutil
        total, used, free = shutil.disk_usage("/")
        free_percent = (free / total) * 100
        
        if free_percent < 5:
            return DependencyStatus(
                name="disk",
                status="unhealthy",
                message=f"Only {free_percent:.1f}% free",
            )
        elif free_percent < 15:
            return DependencyStatus(
                name="disk",
                status="degraded",
                message=f"{free_percent:.1f}% free",
            )
        else:
            return DependencyStatus(
                name="disk",
                status="healthy",
                message=f"{free_percent:.1f}% free",
            )
    except Exception as e:
        return DependencyStatus(
            name="disk",
            status="degraded",
            message=str(e)[:50],
        )


# ============================================================================
# Router
# ============================================================================

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthStatus,
    summary="Basic health check",
    description="Simple liveness probe. Returns 200 if the service is running.",
)
async def health_check():
    """
    Basic health check for liveness probes.
    Always returns 200 if the service is running.
    """
    return HealthStatus(
        status="healthy",
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=os.getenv("APP_VERSION", "1.0.0"),
        uptime_seconds=round(time.time() - _startup_time, 2),
    )


@router.get(
    "/ready",
    response_model=HealthStatus,
    responses={
        200: {"description": "Service is ready"},
        503: {"description": "Service is not ready"},
    },
    summary="Readiness check",
    description="Readiness probe. Returns 200 only if all critical dependencies are available.",
)
async def readiness_check(response: Response):
    """
    Readiness check for Kubernetes.
    Returns 503 if critical dependencies are unavailable.
    """
    # Check critical dependencies
    db_status = await check_database()
    
    is_ready = db_status.status == "healthy"
    
    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    
    return HealthStatus(
        status="ready" if is_ready else "not_ready",
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=os.getenv("APP_VERSION", "1.0.0"),
        uptime_seconds=round(time.time() - _startup_time, 2),
    )


@router.get(
    "/health/detailed",
    response_model=DetailedHealthStatus,
    summary="Detailed health status",
    description="Returns detailed status of all dependencies.",
)
async def detailed_health_check(response: Response):
    """
    Detailed health check with all dependency statuses.
    """
    # Run all checks concurrently
    db_check, redis_check, api_checks, disk_check = await asyncio.gather(
        check_database(),
        check_redis(),
        check_external_apis(),
        check_disk_space(),
    )
    
    dependencies = [db_check, redis_check, disk_check] + api_checks
    
    # Determine overall status
    has_unhealthy = any(d.status == "unhealthy" for d in dependencies)
    has_degraded = any(d.status == "degraded" for d in dependencies)
    
    if has_unhealthy:
        overall_status = "unhealthy"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    elif has_degraded:
        overall_status = "degraded"
    else:
        overall_status = "healthy"
    
    return DetailedHealthStatus(
        status=overall_status,
        timestamp=datetime.now(timezone.utc).isoformat(),
        version=os.getenv("APP_VERSION", "1.0.0"),
        uptime_seconds=round(time.time() - _startup_time, 2),
        environment=os.getenv("ENVIRONMENT", "development"),
        dependencies=dependencies,
    )


@router.get(
    "/health/live",
    status_code=200,
    summary="Kubernetes liveness",
    description="Minimal liveness probe for Kubernetes.",
)
async def liveness_probe():
    """Minimal liveness probe - just returns 200."""
    return {"status": "ok"}


# ============================================================================
# Setup Function
# ============================================================================

def setup_health_routes(app) -> None:
    """
    Add health check routes to FastAPI app.
    
    Usage:
        from api.health_check import setup_health_routes
        setup_health_routes(app)
    """
    app.include_router(router)
    logger.info("Health check endpoints registered: /health, /ready, /health/detailed")
