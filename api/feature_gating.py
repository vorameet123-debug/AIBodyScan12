"""
Feature Gating — Free vs. Pro Limits
Provides decorators and helpers to limit free-tier users.
"""
from datetime import UTC, datetime
from functools import wraps

from fastapi import Depends, HTTPException, status
from loguru import logger
from sqlmodel import Session, select

from auth import get_current_user
from db import User, get_session

# ─── Free Tier Limits ─────────────────────────────────────
FREE_SCAN_LIMIT = 3          # scans per month
FREE_FIT_CHECK_LIMIT = 2     # fit checks per month
PRO_ONLY_FEATURES = {
    "fashion_iq",
    "trend_dashboard",
    "body_tracker_advanced",
    "virtual_tryon",
    "wardrobe_analytics",
}


def is_premium(user_id: int, session: Session) -> bool:
    """Check if a user has an active premium subscription."""
    from payment_models import UserSubscription

    sub = session.exec(
        select(UserSubscription).where(UserSubscription.user_id == user_id)
    ).first()

    if not sub:
        return False
    if sub.plan_type != "premium":
        return False
    if sub.access_expires_at is None:
        return False

    expires = sub.access_expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=UTC)

    return expires > datetime.now(UTC)


def get_monthly_usage(user_id: int, usage_type: str, session: Session) -> int:
    """Count how many times a user used a feature this month."""
    from db import MeasurementRecord

    now = datetime.now(UTC)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    if usage_type == "scan":
        records = session.exec(
            select(MeasurementRecord).where(
                MeasurementRecord.user_id == user_id,
                MeasurementRecord.created_at >= month_start,
            )
        ).all()
        return len(records)

    return 0


def check_feature_access(
    feature: str,
    user: User,
    session: Session,
) -> None:
    """
    Check if user can access a feature.
    Raises HTTPException(403) if the user is on the free tier and has exceeded limits
    or tries to access a pro-only feature.
    """
    premium = is_premium(user.id, session)

    if premium:
        return  # Pro users have unlimited access

    # Pro-only features
    if feature in PRO_ONLY_FEATURES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "pro_required",
                "message": f"Upgrade to Pro to access {feature.replace('_', ' ').title()}",
                "feature": feature,
                "upgrade_url": "/pricing",
            },
        )

    # Rate-limited features for free users
    if feature == "body_scan":
        usage = get_monthly_usage(user.id, "scan", session)
        if usage >= FREE_SCAN_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "limit_reached",
                    "message": f"Free plan allows {FREE_SCAN_LIMIT} scans/month. Upgrade to Pro for unlimited scans.",
                    "feature": feature,
                    "limit": FREE_SCAN_LIMIT,
                    "used": usage,
                    "upgrade_url": "/pricing",
                },
            )

    if feature == "fit_check":
        # Reuse scan count as proxy (fit checks also create records)
        usage = get_monthly_usage(user.id, "scan", session)
        if usage >= FREE_FIT_CHECK_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "limit_reached",
                    "message": f"Free plan allows {FREE_FIT_CHECK_LIMIT} fit checks/month. Upgrade to Pro for unlimited.",
                    "feature": feature,
                    "limit": FREE_FIT_CHECK_LIMIT,
                    "used": usage,
                    "upgrade_url": "/pricing",
                },
            )


def require_pro(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """FastAPI dependency — blocks free users from pro-only endpoints."""
    if not is_premium(current_user.id, session):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "pro_required",
                "message": "This feature requires a Pro subscription. Upgrade to unlock it.",
                "upgrade_url": "/pricing",
            },
        )
    return current_user
