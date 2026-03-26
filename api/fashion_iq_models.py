"""
Fashion Intelligence Database Models
Extends the main db.py with Fashion IQ related tables
"""
from datetime import datetime

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class FitCheckHistory(SQLModel, table=True):
    """Stores every fit check for Fashion IQ calculation"""
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    garment_type: str = Field(max_length=50)  # shirt, pants, jacket, etc.
    size: str = Field(max_length=10)  # XS, S, M, L, XL, etc.
    fit_score: float  # Overall fit score from fit check
    color: str | None = Field(default=None, max_length=50)  # Primary color
    style: str | None = Field(default=None, max_length=50)  # casual, formal, etc.
    formality_level: int | None = Field(default=None)  # 1-10 scale
    is_trending: bool = Field(default=False)  # Whether item was trending at time of check
    checked_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)
    purchased: bool = Field(default=False)  # Did user purchase this item
    purchase_intent: str | None = Field(default=None, max_length=10)  # "yes", "maybe", "no"
    purchased_at: datetime | None = Field(default=None)  # When marked as purchased


class FashionIQScore(SQLModel, table=True):
    """Stores calculated Fashion IQ scores for users"""
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, unique=True)
    overall_score: float  # 0-100
    fit_knowledge_score: float  # 0-100
    style_consistency_score: float  # 0-100
    trend_awareness_score: float  # 0-100
    level: str = Field(max_length=20)  # Novice, Learner, Expert, Master
    badges: dict = Field(sa_column=Column(JSON), default={})  # List of earned badges
    total_checks: int = Field(default=0)  # Total fit checks performed
    last_calculated: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class UserBadge(SQLModel, table=True):
    """Stores individual badges earned by users"""
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    badge_name: str = Field(max_length=50)
    badge_description: str
    badge_icon: str = Field(max_length=100)  # Icon name or emoji
    earned_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class BodyInsight(SQLModel, table=True):
    """Stores calculated body insights for performance"""
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    insight_type: str = Field(max_length=50)  # 'body_shape', 'pattern', 'trend_velocity', etc.
    insight_data: dict = Field(sa_column=Column(JSON))  # The actual insight data
    confidence: float = Field(default=0.0)  # Confidence score 0-1
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)
    expires_at: datetime | None = Field(default=None)  # When to recalculate


class FitnessGoal(SQLModel, table=True):
    """Stores user fitness goals"""
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    goal_type: str = Field(max_length=50)  # 'weight_loss', 'muscle_gain', 'recomposition', 'maintain'
    target_value: float | None = Field(default=None)  # Target measurement value
    target_date: datetime | None = Field(default=None)  # Target date
    current_value: float | None = Field(default=None)  # Current measurement value
    progress_percentage: float = Field(default=0.0)  # Progress 0-100
    is_active: bool = Field(default=True)  # Is goal still active
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class ExternalTrend(SQLModel, table=True):
    """Stores external fashion trends analyzed by AI"""
    id: int | None = Field(default=None, primary_key=True)
    trend_type: str = Field(max_length=50)  # 'item', 'color', 'style', 'pattern', 'material'
    trend_name: str = Field(max_length=100)  # Name of the trend
    trend_data: dict = Field(sa_column=Column(JSON))  # Full trend analysis data
    popularity_score: float = Field(default=0.0)  # 0-100 popularity score
    trend_direction: str = Field(max_length=20)  # 'rising', 'stable', 'falling'
    source: str = Field(max_length=50, default='groq_ai')  # Source of trend data
    season: str | None = Field(default=None, max_length=50)  # Season context
    confidence: float = Field(default=0.0)  # Confidence score 0-1
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)
    expires_at: datetime | None = Field(default=None)  # When trend data expires
    is_active: bool = Field(default=True)  # Is trend still active
