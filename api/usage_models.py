"""
Usage Models for Subscription Feature Gating
Tracks user feature usage for free tier limits
"""
from datetime import datetime

from sqlmodel import Field, SQLModel


class UserUsage(SQLModel, table=True):
    """Track user's feature usage per month"""
    __tablename__ = "user_usage"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    feature: str = Field(index=True)  # 'body_scan', 'fit_check', 'saved_measurement'
    count: int = Field(default=0)
    month: str = Field(index=True)  # Format: '2026-01'
    last_used: datetime | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Feature limit configuration for free tier
FREE_TIER_LIMITS = {
    'body_scan': 3,      # 3 body scans per month
    'fit_check': 3,      # 3 fit checker analyses per month
    'saved_measurement': 3,  # 3 saved measurements total (not per month)
    'body_tracker_days': 7,  # 7 days of history
}

# Features that are Pro-only (free users get 0 access)
PRO_ONLY_FEATURES = [
    'wardrobe_analytics',
    'trend_dashboard',
]

