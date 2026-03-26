"""
Trend Intelligence Service
Analyzes fit check data to detect trending items, styles, and colors
Uses real user data to identify what's actually trending
Also integrates external trend analysis from Groq AI
"""
from collections import Counter
from datetime import datetime, timedelta
from typing import Any

from fashion_iq_models import ExternalTrend, FitCheckHistory
from loguru import logger
from sqlmodel import Session, func, select


class TrendAnalyzer:
    """Analyzes trends in fit check data"""

    def __init__(self, session: Session):
        self.session = session

    def is_item_trending(self, garment_type: str, days: int = 7, threshold: float = 20.0) -> bool:
        """
        Check if an item type is currently trending
        
        Args:
            garment_type: Type of garment to check
            days: Number of days to analyze (default 7)
            threshold: Minimum velocity percentage to be considered trending (default 20%)
            
        Returns:
            True if item is trending, False otherwise
        """
        try:
            cutoff = datetime.utcnow() - timedelta(days=days)
            previous_cutoff = datetime.utcnow() - timedelta(days=days * 2)

            # Count checks in current period
            current_count = self.session.exec(
                select(func.count(FitCheckHistory.id))
                .where(
                    FitCheckHistory.garment_type == garment_type,
                    FitCheckHistory.checked_at >= cutoff
                )
            ).one() or 0

            # Count checks in previous period
            previous_count = self.session.exec(
                select(func.count(FitCheckHistory.id))
                .where(
                    FitCheckHistory.garment_type == garment_type,
                    FitCheckHistory.checked_at >= previous_cutoff,
                    FitCheckHistory.checked_at < cutoff
                )
            ).one() or 0

            # If no previous data, consider it trending if 3+ checks in current period
            if previous_count == 0:
                return current_count >= 3

            # Calculate velocity
            velocity = ((current_count - previous_count) / previous_count) * 100 if previous_count > 0 else 0

            is_trending = velocity >= threshold
            logger.debug(f"Trend check: {garment_type} - current={current_count}, previous={previous_count}, velocity={velocity:.1f}%, trending={is_trending}")

            return is_trending

        except Exception as e:
            logger.error(f"Error checking if item is trending: {e}")
            return False

    def detect_trending_items(self, days: int = 7, min_velocity: float = 20.0) -> list[dict]:
        """
        Detect all currently trending items
        
        Args:
            days: Number of days to analyze (default 7)
            min_velocity: Minimum velocity to be considered trending (default 20%)
            
        Returns:
            List of trending items with velocity data
        """
        try:
            cutoff = datetime.utcnow() - timedelta(days=days)
            previous_cutoff = datetime.utcnow() - timedelta(days=days * 2)

            # Get all checks in current period
            current_checks = self.session.exec(
                select(FitCheckHistory)
                .where(FitCheckHistory.checked_at >= cutoff)
            ).all()

            # Get all checks in previous period
            previous_checks = self.session.exec(
                select(FitCheckHistory)
                .where(
                    FitCheckHistory.checked_at >= previous_cutoff,
                    FitCheckHistory.checked_at < cutoff
                )
            ).all()

            # Count by garment type
            current_counts = Counter(c.garment_type for c in current_checks)
            previous_counts = Counter(c.garment_type for c in previous_checks)

            trending = []
            for garment_type, current_count in current_counts.items():
                previous_count = previous_counts.get(garment_type, 0)

                # Calculate velocity
                if previous_count > 0:
                    velocity = ((current_count - previous_count) / previous_count) * 100
                else:
                    # New trend if 3+ checks and no previous data
                    velocity = 100 if current_count >= 3 else 0

                if velocity >= min_velocity or (previous_count == 0 and current_count >= 3):
                    trending.append({
                        'item': garment_type,
                        'current_checks': current_count,
                        'previous_checks': previous_count,
                        'velocity': round(velocity, 1),
                        'trend': 'rising' if velocity > 0 else 'stable',
                        'change': current_count - previous_count
                    })

            # Sort by velocity (highest first)
            trending.sort(key=lambda x: x['velocity'], reverse=True)

            logger.info(f"Detected {len(trending)} trending items in last {days} days")
            return trending

        except Exception as e:
            logger.error(f"Error detecting trending items: {e}")
            return []

    def detect_style_trends(self, days: int = 30) -> dict:
        """
        Detect trending styles and colors
        
        Args:
            days: Number of days to analyze (default 30)
            
        Returns:
            Dictionary with trending styles and colors
        """
        try:
            cutoff = datetime.utcnow() - timedelta(days=days)

            checks = self.session.exec(
                select(FitCheckHistory)
                .where(FitCheckHistory.checked_at >= cutoff)
            ).all()

            style_counts = Counter(c.style for c in checks if c.style and c.style != 'unknown')
            color_counts = Counter(c.color for c in checks if c.color and c.color != 'unknown')

            return {
                'trending_styles': dict(style_counts.most_common(5)),
                'trending_colors': dict(color_counts.most_common(5)),
                'total_checks': len(checks),
                'period_days': days
            }

        except Exception as e:
            logger.error(f"Error detecting style trends: {e}")
            return {'trending_styles': {}, 'trending_colors': {}, 'total_checks': 0, 'period_days': days}

    def calculate_trend_alignment(self, user_id: int, days: int = 7) -> dict:
        """
        Calculate how aligned a user is with current trends
        
        Args:
            user_id: User ID
            days: Number of days to analyze trends (default 7)
            
        Returns:
            Dictionary with alignment score and details
        """
        try:
            # Get current trending items
            trending_items = self.detect_trending_items(days=days)
            trending_types = {t['item'] for t in trending_items}

            if not trending_types:
                return {
                    'alignment_score': 0,
                    'message': 'No trending items detected yet',
                    'trending_items_checked': [],
                    'trending_items_missed': [],
                    'total_trending': 0,
                    'user_checked': 0
                }

            # Get user's recent checks
            cutoff = datetime.utcnow() - timedelta(days=30)
            user_checks = self.session.exec(
                select(FitCheckHistory)
                .where(
                    FitCheckHistory.user_id == user_id,
                    FitCheckHistory.checked_at >= cutoff
                )
            ).all()

            user_types = {c.garment_type for c in user_checks}

            # Calculate alignment
            aligned_items = trending_types.intersection(user_types)
            alignment_score = (len(aligned_items) / len(trending_types)) * 100 if trending_types else 0

            return {
                'alignment_score': round(alignment_score, 1),
                'trending_items_checked': list(aligned_items),
                'trending_items_missed': list(trending_types - user_types),
                'total_trending': len(trending_types),
                'user_checked': len(aligned_items),
                'user_total_checks': len(user_checks)
            }

        except Exception as e:
            logger.error(f"Error calculating trend alignment: {e}")
            return {
                'alignment_score': 0,
                'message': f'Error calculating alignment: {e!s}',
                'trending_items_checked': [],
                'trending_items_missed': [],
                'total_trending': 0,
                'user_checked': 0
            }

    def forecast_trends(self, days: int = 7) -> list[dict]:
        """
        Forecast trends based on acceleration
        
        Args:
            days: Number of days to analyze (default 7)
            
        Returns:
            List of forecasted trends with acceleration
        """
        try:
            # Get trends for current period
            current_trends = self.detect_trending_items(days=days)

            # Get trends for previous period (for comparison)
            previous_cutoff = datetime.utcnow() - timedelta(days=days * 2)
            previous_previous_cutoff = datetime.utcnow() - timedelta(days=days * 3)

            previous_checks = self.session.exec(
                select(FitCheckHistory)
                .where(
                    FitCheckHistory.checked_at >= previous_previous_cutoff,
                    FitCheckHistory.checked_at < previous_cutoff
                )
            ).all()

            previous_previous_checks = self.session.exec(
                select(FitCheckHistory)
                .where(
                    FitCheckHistory.checked_at >= previous_previous_cutoff - timedelta(days=days),
                    FitCheckHistory.checked_at < previous_previous_cutoff
                )
            ).all()

            previous_counts = Counter(c.garment_type for c in previous_checks)
            previous_previous_counts = Counter(c.garment_type for c in previous_previous_checks)

            forecasts = []
            for current in current_trends:
                item = current['item']
                current_velocity = current['velocity']

                # Calculate previous velocity
                prev_count = previous_counts.get(item, 0)
                prev_prev_count = previous_previous_counts.get(item, 0)

                if prev_prev_count > 0:
                    previous_velocity = ((prev_count - prev_prev_count) / prev_prev_count) * 100
                else:
                    previous_velocity = 100 if prev_count >= 3 else 0

                # Calculate acceleration
                acceleration = current_velocity - previous_velocity

                if abs(acceleration) > 10:  # Significant acceleration
                    forecasts.append({
                        'item': item,
                        'current_velocity': current_velocity,
                        'previous_velocity': round(previous_velocity, 1),
                        'acceleration': round(acceleration, 1),
                        'forecast': 'rising' if acceleration > 0 else 'falling',
                        'confidence': min(abs(acceleration) / 50, 1.0)  # 0-1
                    })

            # Sort by acceleration
            forecasts.sort(key=lambda x: abs(x['acceleration']), reverse=True)

            return forecasts

        except Exception as e:
            logger.error(f"Error forecasting trends: {e}")
            return []

    def get_external_trends(self, days: int = 7) -> dict[str, Any]:
        """
        Get external trends from AI analysis (stored in database)
        
        Args:
            days: Number of days to look back for trends
            
        Returns:
            Dictionary with external trends
        """
        try:
            # Get active external trends - order by popularity, no date filter
            # (trends stay valid until expires_at, not just for `days` window)
            trends = self.session.exec(
                select(ExternalTrend)
                .where(ExternalTrend.is_active == True)
                .order_by(ExternalTrend.popularity_score.desc())
                .limit(50)
            ).all()

            # Group by trend type
            result = {
                "trending_items": [],
                "trending_colors": [],
                "trending_styles": [],
                "trending_patterns": [],
                "trending_materials": [],
                "source": "external_ai",
                "total_trends": len(trends)
            }

            # Deduplicate by trend_name (keep highest popularity_score)
            seen_names: dict[str, bool] = {}
            for trend in trends:
                key = f"{trend.trend_type}:{trend.trend_name.lower()}"
                if key in seen_names:
                    continue
                seen_names[key] = True

                trend_entry = {
                    "name": trend.trend_name,
                    "popularity_score": trend.popularity_score,
                    "trend_direction": trend.trend_direction,
                    "confidence": trend.confidence,
                    "data": trend.trend_data,
                    "source": trend.source
                }

                if trend.trend_type == "item":
                    result["trending_items"].append(trend_entry)
                elif trend.trend_type == "color":
                    result["trending_colors"].append(trend_entry)
                elif trend.trend_type == "style":
                    result["trending_styles"].append(trend_entry)
                elif trend.trend_type == "pattern":
                    result["trending_patterns"].append(trend_entry)
                elif trend.trend_type == "material":
                    result["trending_materials"].append(trend_entry)

            return result

        except Exception as e:
            logger.error(f"Error getting external trends: {e}")
            return {
                "trending_items": [],
                "trending_colors": [],
                "trending_styles": [],
                "trending_patterns": [],
                "trending_materials": [],
                "source": "external_ai",
                "total_trends": 0,
                "error": str(e)
            }

    def get_combined_trends(self, days: int = 7) -> dict[str, Any]:
        """
        Get combined internal and external trends
        
        Args:
            days: Number of days to analyze
            
        Returns:
            Combined trend analysis
        """
        try:
            # Get internal trends
            internal_trends = self.detect_trending_items(days=days)

            # Get external trends
            external_trends = self.get_external_trends(days=days)

            # Combine results
            return {
                "internal_trends": {
                    "trending_items": internal_trends,
                    "source": "platform_data",
                    "total": len(internal_trends)
                },
                "external_trends": external_trends,
                "combined_insights": self._generate_combined_insights(internal_trends, external_trends),
                "analysis_date": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error getting combined trends: {e}")
            return {"error": str(e)}

    def _generate_combined_insights(
        self,
        internal_trends: list[dict],
        external_trends: dict[str, Any]
    ) -> list[str]:
        """Generate insights by combining internal and external trends"""
        insights = []

        # Get internal item names
        internal_items = {t["item"].lower() for t in internal_trends}

        # Get external item names
        external_items = {
            item["name"].lower()
            for item in external_trends.get("trending_items", [])
        }

        # Find matches
        matches = internal_items.intersection(external_items)
        if matches:
            insights.append(
                f"🔥 {len(matches)} items are trending both on our platform AND externally: {', '.join(list(matches)[:3])}"
            )

        # Find external trends not yet checked
        external_only = external_items - internal_items
        if external_only:
            insights.append(
                f"💡 {len(external_only)} trending items haven't been checked yet on our platform"
            )

        return insights


