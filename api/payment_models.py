"""
Payment and Subscription Models
Stores payment transaction history and user subscription status
"""
from datetime import datetime

from sqlmodel import Field, SQLModel


class UserSubscription(SQLModel, table=True):
    """
    Tracks user subscription status and expiry.
    For 'Prepaid Premium' model, we mainly care about access_expires_at.
    """
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, unique=True)

    # "free" or "premium"
    plan_type: str = Field(default="free", max_length=20)

    # Critical: When does their access end?
    # If None, they are on free plan forever (or until they upgrade).
    # If set, they are premium until this date.
    access_expires_at: datetime | None = Field(default=None)

    # Metadata for tracking
    last_payment_id: str | None = Field(default=None, max_length=100)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PaymentTransaction(SQLModel, table=True):
    """
    Immutable log of every payment attempt and success.
    """
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)

    # Razorpay Details
    razorpay_order_id: str = Field(index=True, max_length=100)
    razorpay_payment_id: str | None = Field(default=None, max_length=100)
    razorpay_signature: str | None = Field(default=None, max_length=200)

    # Amount in smallest currency unit (e.g., paise for INR)
    # Storing 999.00 as 99900.0 usually, but let's stick to standard float for simplicity if valid
    # Best practice: integer for currency, but float ok for basic use
    amount: float
    currency: str = Field(default="INR", max_length=3)

    # "created", "paid", "failed"
    status: str = Field(default="created", max_length=20)

    # When did this happen?
    created_at: datetime = Field(default_factory=datetime.utcnow)

