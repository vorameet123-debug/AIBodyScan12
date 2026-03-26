"""
Usage Routes for Feature Gating
Tracks and enforces free tier usage limits
"""
from datetime import UTC, datetime

from auth import get_current_user
from db import User
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from payment_models import UserSubscription
from pydantic import BaseModel
from sqlmodel import Session, select
from usage_models import FREE_TIER_LIMITS, PRO_ONLY_FEATURES, UserUsage


# Request/Response Models
class UsageStatusResponse(BaseModel):
    """Current usage status for a user"""
    is_pro: bool
    body_scan_count: int
    body_scan_limit: int
    fit_check_count: int
    fit_check_limit: int
    saved_measurement_count: int
    saved_measurement_limit: int
    can_use_wardrobe_analytics: bool
    can_use_trend_dashboard: bool
    current_month: str


class CanUseResponse(BaseModel):
    """Response for can-use check"""
    can_use: bool
    current_count: int
    limit: int
    message: str


class TrackUsageRequest(BaseModel):
    """Request to track usage of a feature"""
    feature: str  # 'body_scan', 'fit_check', 'saved_measurement'


class TrackUsageResponse(BaseModel):
    """Response after tracking usage"""
    success: bool
    new_count: int
    limit: int
    remaining: int


def get_current_month() -> str:
    """Get current month in YYYY-MM format"""
    return datetime.now(UTC).strftime('%Y-%m')


def is_user_pro(user_id: int, db: Session) -> bool:
    """Check if user has active Pro subscription"""
    subscription = db.exec(
        select(UserSubscription).where(
            UserSubscription.user_id == user_id
        )
    ).first()

    if not subscription:
        return False

    # Check for both 'pro' and 'premium' plan types
    if subscription.plan_type not in ('pro', 'premium'):
        return False

    # Check if subscription is still active (handle timezone)
    if subscription.access_expires_at:
        expires_at = subscription.access_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        if expires_at < datetime.now(UTC):
            return False

    return True


def get_usage_count(user_id: int, feature: str, db: Session) -> int:
    """Get current usage count for a feature"""
    current_month = get_current_month()

    # For saved_measurement, we don't reset monthly
    if feature == 'saved_measurement':
        usage = db.exec(
            select(UserUsage).where(
                UserUsage.user_id == user_id,
                UserUsage.feature == feature
            )
        ).first()
    else:
        usage = db.exec(
            select(UserUsage).where(
                UserUsage.user_id == user_id,
                UserUsage.feature == feature,
                UserUsage.month == current_month
            )
        ).first()

    return usage.count if usage else 0


def register_usage_routes(app, get_session_func):
    """Register usage tracking routes with the FastAPI app"""
    router = APIRouter(prefix="/api/v1/usage", tags=["usage"])

    @router.get("/status", response_model=UsageStatusResponse)
    async def get_usage_status(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_session_func)
    ):
        """Get current usage status for the user"""
        user_is_pro = is_user_pro(current_user.id, db)
        current_month = get_current_month()

        body_scan_count = get_usage_count(current_user.id, 'body_scan', db)
        fit_check_count = get_usage_count(current_user.id, 'fit_check', db)
        saved_measurement_count = get_usage_count(current_user.id, 'saved_measurement', db)

        return UsageStatusResponse(
            is_pro=user_is_pro,
            body_scan_count=body_scan_count,
            body_scan_limit=999999 if user_is_pro else FREE_TIER_LIMITS['body_scan'],
            fit_check_count=fit_check_count,
            fit_check_limit=999999 if user_is_pro else FREE_TIER_LIMITS['fit_check'],
            saved_measurement_count=saved_measurement_count,
            saved_measurement_limit=999999 if user_is_pro else FREE_TIER_LIMITS['saved_measurement'],
            can_use_wardrobe_analytics=user_is_pro,
            can_use_trend_dashboard=user_is_pro,
            current_month=current_month
        )

    @router.get("/can-use/{feature}", response_model=CanUseResponse)
    async def can_use_feature(
        feature: str,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_session_func)
    ):
        """Check if user can use a specific feature"""
        user_is_pro = is_user_pro(current_user.id, db)

        # Pro users can use everything
        if user_is_pro:
            return CanUseResponse(
                can_use=True,
                current_count=0,
                limit=999999,
                message="Pro users have unlimited access"
            )

        # Check if feature is Pro-only
        if feature in PRO_ONLY_FEATURES:
            return CanUseResponse(
                can_use=False,
                current_count=0,
                limit=0,
                message=f"{feature.replace('_', ' ').title()} is a Pro-only feature. Upgrade to access!"
            )

        # Check usage limit
        if feature not in FREE_TIER_LIMITS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown feature: {feature}"
            )

        current_count = get_usage_count(current_user.id, feature, db)
        limit = FREE_TIER_LIMITS[feature]

        can_use = current_count < limit
        remaining = max(0, limit - current_count)

        if can_use:
            message = f"You have {remaining} {feature.replace('_', ' ')}(s) remaining this month"
        else:
            message = f"You've used all {limit} free {feature.replace('_', ' ')}s this month. Upgrade to Pro for unlimited access!"

        return CanUseResponse(
            can_use=can_use,
            current_count=current_count,
            limit=limit,
            message=message
        )

    @router.post("/track", response_model=TrackUsageResponse)
    async def track_feature_usage(
        request: TrackUsageRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_session_func)
    ):
        """Track usage of a feature (call after successful use)"""
        user_is_pro = is_user_pro(current_user.id, db)

        # Pro users don't need to track (unlimited)
        if user_is_pro:
            return TrackUsageResponse(
                success=True,
                new_count=0,
                limit=999999,
                remaining=999999
            )

        feature = request.feature
        if feature not in FREE_TIER_LIMITS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown feature: {feature}"
            )

        current_month = get_current_month()
        limit = FREE_TIER_LIMITS[feature]

        # Find or create usage record
        if feature == 'saved_measurement':
            # Saved measurements don't reset monthly
            usage = db.exec(
                select(UserUsage).where(
                    UserUsage.user_id == current_user.id,
                    UserUsage.feature == feature
                )
            ).first()
        else:
            usage = db.exec(
                select(UserUsage).where(
                    UserUsage.user_id == current_user.id,
                    UserUsage.feature == feature,
                    UserUsage.month == current_month
                )
            ).first()

        if usage:
            usage.count += 1
            usage.last_used = datetime.now(UTC)
            usage.updated_at = datetime.now(UTC)
        else:
            usage = UserUsage(
                user_id=current_user.id,
                feature=feature,
                count=1,
                month=current_month,
                last_used=datetime.now(UTC)
            )
            db.add(usage)

        db.commit()
        db.refresh(usage)

        remaining = max(0, limit - usage.count)
        logger.info(f"User {current_user.id} used {feature}. Count: {usage.count}/{limit}")

        return TrackUsageResponse(
            success=True,
            new_count=usage.count,
            limit=limit,
            remaining=remaining
        )

    # Register router with app
    app.include_router(router)
    logger.info("Usage tracking routes registered successfully")


