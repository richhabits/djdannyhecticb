"""
Health Check System for Backend Services
Provides detailed health status for all critical service dependencies.

Endpoints:
- GET /health/live - Liveness probe (is server responding?)
- GET /health/ready - Readiness probe (is server ready for traffic?)
- GET /health/detailed - Full health report with all service details
"""

import asyncio
import logging
from typing import Dict, Any, Optional, Callable
from enum import Enum
from datetime import datetime
import time

logger = logging.getLogger(__name__)


class ServiceHealth(Enum):
    """Health status of a service."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNAVAILABLE = "unavailable"
    UNKNOWN = "unknown"


class ServiceStatus:
    """Status information for a single service."""

    def __init__(self, name: str):
        self.name = name
        self.status = ServiceHealth.UNKNOWN
        self.last_check_time: Optional[datetime] = None
        self.response_time_ms: float = 0.0
        self.error_message: Optional[str] = None
        self.consecutive_failures: int = 0

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'name': self.name,
            'status': self.status.value,
            'last_check': self.last_check_time.isoformat() if self.last_check_time else None,
            'response_time_ms': self.response_time_ms,
            'error': self.error_message,
            'consecutive_failures': self.consecutive_failures,
        }


class HealthChecker:
    """Manages health checks for all service dependencies."""

    def __init__(self):
        """Initialize health checker with service status trackers."""
        self.services: Dict[str, ServiceStatus] = {}
        self.last_overall_check: Optional[datetime] = None
        self._check_lock = asyncio.Lock()
        self._service_checks: Dict[str, Callable] = {}

    async def register_service(
        self,
        name: str,
        check_func: Callable
    ) -> None:
        """Register a service with its health check function."""
        if name not in self.services:
            self.services[name] = ServiceStatus(name)
        if not hasattr(self, '_service_checks'):
            self._service_checks = {}
        self._service_checks[name] = check_func
        logger.info(f"Registered health check for service: {name}")

    async def check_service(self, name: str) -> ServiceStatus:
        """Execute health check for a specific service."""
        if name not in self.services:
            return ServiceStatus(name)

        status = self.services[name]
        check_func = self._service_checks.get(name)

        if not check_func:
            status.status = ServiceHealth.UNKNOWN
            return status

        try:
            start_time = time.time()
            await check_func()
            elapsed_ms = (time.time() - start_time) * 1000

            status.status = ServiceHealth.HEALTHY
            status.response_time_ms = elapsed_ms
            status.error_message = None
            status.consecutive_failures = 0
            status.last_check_time = datetime.utcnow()

            logger.debug(f"Service {name} is healthy ({elapsed_ms:.1f}ms)")

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            status.status = ServiceHealth.DEGRADED if status.consecutive_failures < 2 else ServiceHealth.UNAVAILABLE
            status.response_time_ms = elapsed_ms
            status.error_message = str(e)
            status.consecutive_failures += 1
            status.last_check_time = datetime.utcnow()

            logger.warning(
                f"Service {name} check failed ({status.consecutive_failures} failures): {e}"
            )

        return status

    async def check_all_services(self) -> Dict[str, ServiceStatus]:
        """Execute health checks for all registered services."""
        async with self._check_lock:
            tasks = [
                self.check_service(name)
                for name in self.services.keys()
            ]
            await asyncio.gather(*tasks, return_exceptions=True)
            self.last_overall_check = datetime.utcnow()

        return self.services

    def is_ready(self) -> bool:
        """
        Check if server is ready to accept traffic.

        Ready if: All critical services are healthy.
        """
        # Check that we have at least one successful health check in the last minute
        if not self.last_overall_check:
            return False

        elapsed = (datetime.utcnow() - self.last_overall_check).total_seconds()
        if elapsed > 60:
            return False

        # All critical services must be healthy
        for name, status in self.services.items():
            if status.status == ServiceHealth.UNAVAILABLE:
                return False

        return True

    def is_live(self) -> bool:
        """
        Check if server is alive (liveness probe).

        Always returns True unless there's an internal error.
        """
        return True

    def get_overall_health(self) -> Dict[str, Any]:
        """Get overall health status."""
        healthy_count = sum(
            1 for s in self.services.values()
            if s.status == ServiceHealth.HEALTHY
        )
        degraded_count = sum(
            1 for s in self.services.values()
            if s.status == ServiceHealth.DEGRADED
        )
        unavailable_count = sum(
            1 for s in self.services.values()
            if s.status == ServiceHealth.UNAVAILABLE
        )

        # Determine overall status
        if unavailable_count > 0:
            overall_status = ServiceHealth.UNAVAILABLE
        elif degraded_count > 0:
            overall_status = ServiceHealth.DEGRADED
        else:
            overall_status = ServiceHealth.HEALTHY

        return {
            'status': overall_status.value,
            'ready': self.is_ready(),
            'live': self.is_live(),
            'timestamp': datetime.utcnow().isoformat(),
            'services': {
                'healthy': healthy_count,
                'degraded': degraded_count,
                'unavailable': unavailable_count,
                'total': len(self.services),
            },
            'last_check': self.last_overall_check.isoformat() if self.last_overall_check else None,
        }

    def get_detailed_status(self) -> Dict[str, Any]:
        """Get detailed status for all services."""
        overall = self.get_overall_health()
        overall['services_detailed'] = {
            name: status.to_dict()
            for name, status in self.services.items()
        }
        return overall

    def reset_service(self, name: str) -> None:
        """Reset failure count for a service."""
        if name in self.services:
            self.services[name].consecutive_failures = 0
            logger.info(f"Reset health status for service: {name}")

    # Service check functions to be populated
    _service_checks: Dict[str, callable] = {}


# Global instance
_health_checker: Optional[HealthChecker] = None


def get_health_checker() -> HealthChecker:
    """Get or create the global health checker."""
    global _health_checker
    if _health_checker is None:
        _health_checker = HealthChecker()
    return _health_checker


async def check_database(db) -> bool:
    """Health check for database."""
    try:
        # Run a simple query to verify connectivity
        await asyncio.sleep(0.01)  # Placeholder - implement actual DB check
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise


async def check_redis(redis_client) -> bool:
    """Health check for Redis cache."""
    try:
        # Ping Redis to verify connectivity
        if redis_client:
            await redis_client.ping()
        return True
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        raise


async def check_stripe() -> bool:
    """Health check for Stripe API."""
    try:
        # Try to list accounts - minimal operation
        import httpx
        from backend.core.config import settings

        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                "https://api.stripe.com/v1/account",
                auth=httpx.BasicAuth(settings.STRIPE_SECRET_KEY, ""),
            )
            response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Stripe health check failed: {e}")
        raise


async def check_s3() -> bool:
    """Health check for S3."""
    try:
        # Try to list buckets
        import boto3
        from backend.core.config import settings

        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
        s3.list_buckets()
        return True
    except Exception as e:
        logger.error(f"S3 health check failed: {e}")
        raise
