"""
Size Recommendation Engine
Provides size recommendations (S/M/L/XL, numeric sizes) based on body measurements
"""
from loguru import logger


class SizeRecommendationEngine:
    """
    Recommends clothing sizes based on body measurements
    Supports multiple size systems: S/M/L/XL, numeric (24, 26, 28), and age-based
    """

    def __init__(self):
        """Initialize size charts for different categories"""
        self.size_charts = self._load_size_charts()
        logger.info("SizeRecommendationEngine initialized")

    def _load_size_charts(self) -> dict:
        """
        Load size charts for different clothing categories
        Returns dictionary with size ranges for each category
        """
        charts = {
            # Generic S/M/L/XL sizing (unisex, kids/youth)
            # Updated with more accurate chest measurements for adult sizes
            'generic_tops': {
                'XS': {'chest_min': 0, 'chest_max': 82, 'height_min': 0, 'height_max': 155},
                'S': {'chest_min': 82, 'chest_max': 90, 'height_min': 155, 'height_max': 170},
                'M': {'chest_min': 90, 'chest_max': 98, 'height_min': 165, 'height_max': 180},
                'L': {'chest_min': 98, 'chest_max': 106, 'height_min': 170, 'height_max': 185},
                'XL': {'chest_min': 106, 'chest_max': 114, 'height_min': 175, 'height_max': 200},
                'XXL': {'chest_min': 114, 'chest_max': 999, 'height_min': 180, 'height_max': 999}
            },

            'generic_bottoms': {
                'XS': {'waist_min': 0, 'waist_max': 60, 'height_min': 0, 'height_max': 130},
                'S': {'waist_min': 60, 'waist_max': 70, 'height_min': 130, 'height_max': 150},
                'M': {'waist_min': 70, 'waist_max': 80, 'height_min': 150, 'height_max': 165},
                'L': {'waist_min': 80, 'waist_max': 90, 'height_min': 165, 'height_max': 180},
                'XL': {'waist_min': 90, 'waist_max': 100, 'height_min': 180, 'height_max': 200},
                'XXL': {'waist_min': 100, 'waist_max': 999, 'height_min': 180, 'height_max': 999}
            },

            # Numeric sizing (waist-based for pants)
            # Updated with more accurate waist measurements (in cm)
            # Size 30 typically corresponds to waist 76-82cm
            'numeric_pants': {
                '24': {'waist_min': 58, 'waist_max': 64, 'inseam_min': 0, 'inseam_max': 999},
                '26': {'waist_min': 64, 'waist_max': 70, 'inseam_min': 0, 'inseam_max': 999},
                '28': {'waist_min': 70, 'waist_max': 76, 'inseam_min': 0, 'inseam_max': 999},
                '30': {'waist_min': 76, 'waist_max': 82, 'inseam_min': 0, 'inseam_max': 999},
                '32': {'waist_min': 82, 'waist_max': 88, 'inseam_min': 0, 'inseam_max': 999},
                '34': {'waist_min': 88, 'waist_max': 94, 'inseam_min': 0, 'inseam_max': 999},
                '36': {'waist_min': 94, 'waist_max': 100, 'inseam_min': 0, 'inseam_max': 999},
                '38': {'waist_min': 100, 'waist_max': 106, 'inseam_min': 0, 'inseam_max': 999},
                '40': {'waist_min': 106, 'waist_max': 112, 'inseam_min': 0, 'inseam_max': 999}
            },

            # Dress shirts (neck-based for boys/men)
            'dress_shirts': {
                '10': {'neck_min': 24, 'neck_max': 26, 'chest_min': 0, 'chest_max': 999},
                '11': {'neck_min': 26, 'neck_max': 28, 'chest_min': 0, 'chest_max': 999},
                '12': {'neck_min': 28, 'neck_max': 30, 'chest_min': 0, 'chest_max': 999},
                '13': {'neck_min': 30, 'neck_max': 32, 'chest_min': 0, 'chest_max': 999},
                '14': {'neck_min': 32, 'neck_max': 34, 'chest_min': 0, 'chest_max': 999},
                '15': {'neck_min': 34, 'neck_max': 36, 'chest_min': 0, 'chest_max': 999},
                '16': {'neck_min': 36, 'neck_max': 38, 'chest_min': 0, 'chest_max': 999},
                '17': {'neck_min': 38, 'neck_max': 40, 'chest_min': 0, 'chest_max': 999}
            },

            # Dresses (girls/women)
            'dresses': {
                'XS': {'chest_min': 0, 'chest_max': 75, 'waist_min': 0, 'waist_max': 65, 'height_min': 0, 'height_max': 150},
                'S': {'chest_min': 75, 'chest_max': 85, 'waist_min': 65, 'waist_max': 75, 'height_min': 150, 'height_max': 165},
                'M': {'chest_min': 85, 'chest_max': 95, 'waist_min': 75, 'waist_max': 85, 'height_min': 165, 'height_max': 175},
                'L': {'chest_min': 95, 'chest_max': 105, 'waist_min': 85, 'waist_max': 95, 'height_min': 175, 'height_max': 185},
                'XL': {'chest_min': 105, 'chest_max': 115, 'waist_min': 95, 'waist_max': 105, 'height_min': 185, 'height_max': 200}
            },

            # Age-based sizing (kids)
            'kids_tops': {
                '2T': {'chest_min': 0, 'chest_max': 55, 'height_min': 0, 'height_max': 90},
                '3T': {'chest_min': 55, 'chest_max': 60, 'height_min': 90, 'height_max': 100},
                '4T': {'chest_min': 60, 'chest_max': 65, 'height_min': 100, 'height_max': 110},
                '5T': {'chest_min': 65, 'chest_max': 70, 'height_min': 110, 'height_max': 120},
                '6': {'chest_min': 70, 'chest_max': 75, 'height_min': 120, 'height_max': 130},
                '7': {'chest_min': 75, 'chest_max': 80, 'height_min': 130, 'height_max': 140},
                '8': {'chest_min': 80, 'chest_max': 85, 'height_min': 140, 'height_max': 150},
                '10': {'chest_min': 85, 'chest_max': 90, 'height_min': 150, 'height_max': 160},
                '12': {'chest_min': 90, 'chest_max': 95, 'height_min': 160, 'height_max': 170},
                '14': {'chest_min': 95, 'chest_max': 100, 'height_min': 170, 'height_max': 180}
            },

            'kids_bottoms': {
                '2T': {'waist_min': 0, 'waist_max': 50, 'height_min': 0, 'height_max': 90},
                '3T': {'waist_min': 50, 'waist_max': 55, 'height_min': 90, 'height_max': 100},
                '4T': {'waist_min': 55, 'waist_max': 60, 'height_min': 100, 'height_max': 110},
                '5T': {'waist_min': 60, 'waist_max': 65, 'height_min': 110, 'height_max': 120},
                '6': {'waist_min': 65, 'waist_max': 70, 'height_min': 120, 'height_max': 130},
                '7': {'waist_min': 70, 'waist_max': 75, 'height_min': 130, 'height_max': 140},
                '8': {'waist_min': 75, 'waist_max': 80, 'height_min': 140, 'height_max': 150},
                '10': {'waist_min': 80, 'waist_max': 85, 'height_min': 150, 'height_max': 160},
                '12': {'waist_min': 85, 'waist_max': 90, 'height_min': 160, 'height_max': 170},
                '14': {'waist_min': 90, 'waist_max': 95, 'height_min': 170, 'height_max': 180}
            }
        }

        return charts

    def recommend_size(
        self,
        measurements: dict[str, float],
        category: str = 'generic_tops',
        gender: str | None = None,
        age: int | None = None
    ) -> dict[str, any]:
        """
        Recommend size based on measurements
        
        Args:
            measurements: Dictionary of body measurements
            category: Size chart category ('generic_tops', 'generic_bottoms', 'numeric_pants', etc.)
            gender: Optional gender ('male', 'female') for gender-specific charts
            age: Optional age for age-based sizing
        
        Returns:
            Dictionary with recommended size, confidence, and alternative sizes
        """
        if category not in self.size_charts:
            logger.warning(f"Unknown category: {category}, using generic_tops")
            category = 'generic_tops'

        size_chart = self.size_charts[category]

        # Debug: Log available measurements
        logger.debug(f"Recommending size for category: {category}")
        logger.debug(f"Available measurement keys: {list(measurements.keys())}")

        # Calculate scores for each size
        size_scores = {}
        for size, ranges in size_chart.items():
            score = 0
            max_score = 0

            # Check chest (for tops) - try multiple key variations
            if 'chest_min' in ranges:
                max_score += 1
                # Try different possible keys for chest measurement
                chest = (measurements.get('chest circumference') or
                        measurements.get('chest') or
                        measurements.get('chest_circumference') or 0)
                if chest > 0:
                    # Use range matching with slight tolerance for better fit
                    if ranges['chest_min'] <= chest <= ranges['chest_max']:
                        score += 1
                    # Also give partial credit if close to range (within 2cm)
                    elif abs(chest - ranges['chest_min']) <= 2 or abs(chest - ranges['chest_max']) <= 2:
                        score += 0.5

            # Check waist (for bottoms) - try multiple key variations
            if 'waist_min' in ranges:
                max_score += 1
                # Try different possible keys for waist measurement
                waist = (measurements.get('waist circumference') or
                        measurements.get('waist') or
                        measurements.get('waist_circumference') or 0)
                if waist > 0:
                    # Use range matching with slight tolerance for better fit
                    if ranges['waist_min'] <= waist <= ranges['waist_max']:
                        score += 1
                    # Also give partial credit if close to range (within 2cm)
                    elif abs(waist - ranges['waist_min']) <= 2 or abs(waist - ranges['waist_max']) <= 2:
                        score += 0.5

            # Check height
            if 'height_min' in ranges and 'height' in measurements:
                max_score += 1
                height = measurements.get('height', 0)
                if ranges['height_min'] <= height <= ranges['height_max']:
                    score += 1

            # Check neck (for dress shirts)
            if 'neck_min' in ranges and 'neck' in measurements:
                max_score += 1
                neck = measurements.get('neck circumference', measurements.get('neck', 0))
                if ranges['neck_min'] <= neck <= ranges['neck_max']:
                    score += 1

            # Check inseam (for pants)
            if 'inseam_min' in ranges and 'inside leg height' in measurements:
                max_score += 1
                inseam = measurements.get('inside leg height', 0)
                if ranges['inseam_min'] <= inseam <= ranges['inseam_max']:
                    score += 1

            if max_score > 0:
                confidence = score / max_score
                size_scores[size] = {
                    'score': score,
                    'max_score': max_score,
                    'confidence': confidence
                }

        if not size_scores:
            return {
                'recommended_size': None,
                'confidence': 0.0,
                'alternatives': [],
                'message': 'No matching size found'
            }

        # Debug: Log size scores
        if size_scores:
            logger.debug(f"Size scores for {category}: {[(k, v['confidence']) for k, v in sorted(size_scores.items(), key=lambda x: x[1]['confidence'], reverse=True)[:5]]}")

        # Find best match - prioritize by score, then confidence, then prefer smaller size if tie
        # This helps avoid recommending L when M would fit better
        best_size = max(size_scores.items(),
                       key=lambda x: (x[1]['score'], x[1]['confidence'], -len(x[0])))
        recommended_size = best_size[0]
        confidence = best_size[1]['confidence']

        logger.info(f"Recommended {category} size: {recommended_size} (confidence: {confidence:.1%})")

        # If confidence is low, try to find a better match by checking if we're on the border
        # Prefer the smaller size if measurements are close to the boundary
        if confidence < 0.7 and len(size_scores) > 1:
            # Check if we're close to a smaller size
            sorted_sizes = sorted(size_scores.items(),
                                key=lambda x: (x[1]['score'], x[1]['confidence']),
                                reverse=True)
            if len(sorted_sizes) >= 2:
                second_best = sorted_sizes[1]
                # If second best is very close and is a smaller size, prefer it
                if (second_best[1]['confidence'] >= confidence - 0.1 and
                    len(second_best[0]) <= len(recommended_size)):
                    # Check size order: XS < S < M < L < XL < XXL
                    size_order = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
                    if (recommended_size in size_order and second_best[0] in size_order):
                        if size_order.index(second_best[0]) < size_order.index(recommended_size):
                            recommended_size = second_best[0]
                            confidence = second_best[1]['confidence']

        # Find alternatives (within 0.2 confidence as alternatives)
        alternatives = [
            size for size, data in size_scores.items()
            if size != recommended_size and data['confidence'] >= confidence - 0.2
        ]
        alternatives.sort(key=lambda x: size_scores[x]['confidence'], reverse=True)

        return {
            'recommended_size': recommended_size,
            'confidence': round(confidence * 100, 1),  # As percentage
            'alternatives': alternatives[:3],  # Top 3 alternatives
            'category': category,
            'scores': {size: data['confidence'] for size, data in size_scores.items()}
        }

    def recommend_all_sizes(
        self,
        measurements: dict[str, float],
        gender: str | None = None,
        age: int | None = None
    ) -> dict[str, dict]:
        """
        Get size recommendations for all categories
        
        Args:
            measurements: Dictionary of body measurements
            gender: Optional gender ('male', 'female')
            age: Optional age
        
        Returns:
            Dictionary with recommendations for each category
        """
        recommendations = {}

        # Determine which categories to use
        if age and age <= 14:
            # Kids sizing
            recommendations['tops'] = self.recommend_size(
                measurements, 'kids_tops', gender, age
            )
            # Only add bottoms for kids if not male (or if gender not specified)
            if gender != 'male':
                recommendations['bottoms'] = self.recommend_size(
                    measurements, 'kids_bottoms', gender, age
                )
        else:
            # Adult/youth sizing
            # Shirts/Tops - always include
            recommendations['tops'] = self.recommend_size(
                measurements, 'generic_tops', gender, age
            )
            recommendations['shirts'] = recommendations['tops']  # Alias for shirts

            # Bottoms (generic letter sizes) - only for non-males or if gender not specified
            # Note: Removing this for males as requested - will implement pants/shorts later
            if gender != 'male':
                recommendations['bottoms'] = self.recommend_size(
                    measurements, 'generic_bottoms', gender, age
                )

        # Pants (numeric sizing) - always include
        pants_numeric = self.recommend_size(
            measurements, 'numeric_pants', gender, age
        )
        recommendations['pants'] = pants_numeric

        # Also map numeric size to letter size for pants
        numeric_to_letter = {
            '24': 'XS', '26': 'S', '28': 'S',
            '30': 'M', '32': 'M',
            '34': 'L', '36': 'L',
            '38': 'XL', '40': 'XL'
        }
        if pants_numeric.get('recommended_size'):
            numeric_size = pants_numeric['recommended_size']
            if numeric_size in numeric_to_letter:
                recommendations['pants_letter'] = {
                    'recommended_size': numeric_to_letter[numeric_size],
                    'confidence': pants_numeric.get('confidence', 0),
                    'numeric_equivalent': numeric_size,
                    'alternatives': [numeric_to_letter.get(alt, alt) for alt in pants_numeric.get('alternatives', []) if alt in numeric_to_letter]
                }

        # Dress shirts (if neck measurement available) - always include
        if 'neck circumference' in measurements:
            recommendations['dress_shirts'] = self.recommend_size(
                measurements, 'dress_shirts', gender, age
            )

        # Dresses - only for females (remove for males)
        if gender == 'female':
            recommendations['dresses'] = self.recommend_size(
                measurements, 'dresses', gender, age
            )
        # If gender is None, don't include dresses (user will specify later)

        return recommendations


def calculate_outseam(measurements: dict[str, float]) -> float | None:
    """
    Calculate outseam length (waist to ankle on outside of leg)
    
    Formula: Outseam = Height - Inside Leg Height (approximation)
    More accurate: Outseam = Height - (Inside Leg Height - Crotch Height adjustment)
    
    Args:
        measurements: Dictionary of body measurements
    
    Returns:
        Outseam length in cm, or None if required measurements missing
    """
    height = measurements.get('height')
    inside_leg = measurements.get('inside leg height')

    if height is None or inside_leg is None:
        return None

    # Simple approximation: outseam ≈ height - inside_leg
    # This works because inside_leg is crotch to ankle, and height includes head
    # More accurate would need crotch height, but this is a good approximation
    outseam = height - inside_leg

    # Sanity check: outseam should be positive and reasonable (30-100 cm typically)
    if outseam < 0 or outseam > 150:
        logger.warning(f"Calculated outseam seems unreasonable: {outseam} cm")
        return None

    return round(outseam, 2)



