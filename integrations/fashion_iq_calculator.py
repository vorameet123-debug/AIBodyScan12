"""
Fashion IQ Calculator Service
Calculates Fashion IQ scores based on fit check history
"""
from collections import Counter
from datetime import datetime, timedelta

from fashion_iq_models import FashionIQScore, FitCheckHistory
from loguru import logger
from sqlmodel import Session, select


class FashionIQCalculator:
    """Calculates and manages Fashion IQ scores for users"""

    # Badge definitions
    BADGES = {
        'fit_guru': {
            'name': 'Fit Guru',
            'description': '20+ perfect fits',
            'icon': '🎯',
            'condition': 'perfect_fits_count'
        },
        'trend_setter': {
            'name': 'Trend Setter',
            'description': 'Trend awareness > 85',
            'icon': '🔥',
            'condition': 'trend_score'
        },
        'style_consistent': {
            'name': 'Style Consistent',
            'description': 'Style consistency > 80',
            'icon': '✨',
            'condition': 'style_score'
        },
        'fashion_master': {
            'name': 'Fashion Master',
            'description': 'Overall IQ > 90',
            'icon': '👑',
            'condition': 'overall_score'
        },
        'early_adopter': {
            'name': 'Early Adopter',
            'description': '10+ trending items checked',
            'icon': '🚀',
            'condition': 'trending_count'
        }
    }

    def __init__(self, session: Session):
        self.session = session

    def calculate_fit_knowledge(self, user_id: int) -> float:
        """
        Calculate fit knowledge score (0-100)
        Formula: (Perfect fits / Total checks) × 100
        Perfect fit = score >= 80
        """
        # Get all fit checks for user
        statement = select(FitCheckHistory).where(FitCheckHistory.user_id == user_id)
        checks = self.session.exec(statement).all()

        if len(checks) == 0:
            return 0.0

        # Count perfect fits (score >= 80)
        perfect_fits = sum(1 for c in checks if c.fit_score >= 80)

        # Calculate percentage
        score = (perfect_fits / len(checks)) * 100

        logger.info(f"Fit Knowledge for user {user_id}: {perfect_fits}/{len(checks)} = {score:.1f}")
        return round(score, 1)

    def calculate_style_consistency(self, user_id: int) -> float:
        """
        Calculate style consistency score (0-100)
        Analyzes: color patterns, garment types, formality
        """
        statement = select(FitCheckHistory).where(FitCheckHistory.user_id == user_id)
        checks = self.session.exec(statement).all()

        if len(checks) < 5:
            return 50.0  # Not enough data, return neutral score

        # Analyze color consistency
        colors = [c.color for c in checks if c.color]
        if colors:
            color_distribution = Counter(colors)
            dominant_color_pct = max(color_distribution.values()) / len(colors) * 100
        else:
            dominant_color_pct = 50.0

        # Analyze style consistency (casual vs formal)
        styles = [c.style for c in checks if c.style]
        if styles:
            style_distribution = Counter(styles)
            dominant_style_pct = max(style_distribution.values()) / len(styles) * 100
        else:
            dominant_style_pct = 50.0

        # Analyze garment type consistency
        garment_types = [c.garment_type for c in checks]
        garment_distribution = Counter(garment_types)
        # More variety is good, but too much is inconsistent
        variety_score = min(len(garment_distribution) * 10, 100)

        # Average consistency (weighted)
        consistency = (dominant_color_pct * 0.4 + dominant_style_pct * 0.4 + variety_score * 0.2)

        logger.info(f"Style Consistency for user {user_id}: {consistency:.1f}")
        return round(consistency, 1)

    def calculate_trend_awareness(self, user_id: int) -> float:
        """
        Calculate trend awareness score (0-100)
        Checks if user is checking trending items
        """
        # Get checks from last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        statement = select(FitCheckHistory).where(
            FitCheckHistory.user_id == user_id,
            FitCheckHistory.checked_at >= thirty_days_ago
        )
        recent_checks = self.session.exec(statement).all()

        if len(recent_checks) == 0:
            # Check all-time if no recent checks
            statement = select(FitCheckHistory).where(FitCheckHistory.user_id == user_id)
            all_checks = self.session.exec(statement).all()
            if len(all_checks) == 0:
                return 50.0  # Default score
            recent_checks = all_checks

        # Count trending items
        trending_count = sum(1 for c in recent_checks if c.is_trending)

        # Calculate percentage
        score = (trending_count / len(recent_checks)) * 100

        # Boost score if user is early adopter (high trend awareness)
        if score > 70:
            score = min(score * 1.2, 100)

        logger.info(f"Trend Awareness for user {user_id}: {trending_count}/{len(recent_checks)} = {score:.1f}")
        return round(score, 1)

    def calculate_overall_iq(self, user_id: int) -> dict:
        """
        Calculate final IQ score with breakdown
        Returns complete IQ data including level and badges
        """
        # Calculate component scores
        fit_knowledge = self.calculate_fit_knowledge(user_id)
        style_consistency = self.calculate_style_consistency(user_id)
        trend_awareness = self.calculate_trend_awareness(user_id)

        # Calculate weighted overall score
        overall = (fit_knowledge * 0.4) + (style_consistency * 0.3) + (trend_awareness * 0.3)
        overall = round(overall, 1)

        # Assign level
        level = self.assign_level(overall)

        # Check badges
        badges = self.check_badge_eligibility(user_id, {
            'perfect_fits_count': self._count_perfect_fits(user_id),
            'trend_score': trend_awareness,
            'style_score': style_consistency,
            'overall_score': overall,
            'trending_count': self._count_trending_checks(user_id)
        })

        # Get total checks
        statement = select(FitCheckHistory).where(FitCheckHistory.user_id == user_id)
        total_checks = len(self.session.exec(statement).all())

        result = {
            'overall_score': overall,
            'fit_knowledge': fit_knowledge,
            'style_consistency': style_consistency,
            'trend_awareness': trend_awareness,
            'level': level,
            'badges': badges,
            'total_checks': total_checks
        }

        logger.info(f"Overall IQ for user {user_id}: {overall} ({level})")
        return result

    def assign_level(self, score: float) -> str:
        """Assign level based on score"""
        if score >= 81:
            return 'Master'
        elif score >= 61:
            return 'Expert'
        elif score >= 41:
            return 'Learner'
        else:
            return 'Novice'

    def check_badge_eligibility(self, user_id: int, stats: dict) -> list[dict]:
        """
        Check which badges user has earned
        Returns list of badge objects
        """
        earned_badges = []

        # Check each badge condition
        if stats['perfect_fits_count'] >= 20:
            earned_badges.append(self.BADGES['fit_guru'])

        if stats['trend_score'] >= 85:
            earned_badges.append(self.BADGES['trend_setter'])

        if stats['style_score'] >= 80:
            earned_badges.append(self.BADGES['style_consistent'])

        if stats['overall_score'] >= 90:
            earned_badges.append(self.BADGES['fashion_master'])

        if stats['trending_count'] >= 10:
            earned_badges.append(self.BADGES['early_adopter'])

        return earned_badges

    def save_iq_score(self, user_id: int, iq_data: dict) -> FashionIQScore:
        """Save or update IQ score in database"""
        # Check if score exists
        statement = select(FashionIQScore).where(FashionIQScore.user_id == user_id)
        existing = self.session.exec(statement).first()

        if existing:
            # Update existing
            existing.overall_score = iq_data['overall_score']
            existing.fit_knowledge_score = iq_data['fit_knowledge']
            existing.style_consistency_score = iq_data['style_consistency']
            existing.trend_awareness_score = iq_data['trend_awareness']
            existing.level = iq_data['level']
            existing.badges = {'badges': iq_data['badges']}
            existing.total_checks = iq_data['total_checks']
            existing.last_calculated = datetime.utcnow()
            self.session.add(existing)
        else:
            # Create new
            new_score = FashionIQScore(
                user_id=user_id,
                overall_score=iq_data['overall_score'],
                fit_knowledge_score=iq_data['fit_knowledge'],
                style_consistency_score=iq_data['style_consistency'],
                trend_awareness_score=iq_data['trend_awareness'],
                level=iq_data['level'],
                badges={'badges': iq_data['badges']},
                total_checks=iq_data['total_checks']
            )
            self.session.add(new_score)
            existing = new_score

        self.session.commit()
        self.session.refresh(existing)
        return existing

    # Helper methods
    def _count_perfect_fits(self, user_id: int) -> int:
        """Count number of perfect fits (score >= 80)"""
        statement = select(FitCheckHistory).where(
            FitCheckHistory.user_id == user_id,
            FitCheckHistory.fit_score >= 80
        )
        return len(self.session.exec(statement).all())

    def _count_trending_checks(self, user_id: int) -> int:
        """Count number of trending items checked"""
        statement = select(FitCheckHistory).where(
            FitCheckHistory.user_id == user_id,
            FitCheckHistory.is_trending == True
        )
        return len(self.session.exec(statement).all())


