"""
Body Type Classification
Classifies body type from measurements for style recommendations
"""

from loguru import logger


class BodyTypeClassifier:
    """
    Classifies body type based on measurements
    """

    def __init__(self):
        """Initialize body type classifier"""
        logger.info("BodyTypeClassifier initialized")

    def classify(self, measurements: dict[str, float], gender: str | None = None) -> dict:
        """
        Classify body type from measurements
        
        Args:
            measurements: Dictionary of body measurements
            gender: Optional gender for gender-specific classification
        
        Returns:
            Dictionary with body type classification and style recommendations
        """
        try:
            # Get key measurements
            waist = measurements.get('waist_circumference', 0)
            hip = measurements.get('hip_circumference', 0)
            chest = measurements.get('chest_circumference', 0)
            shoulder = measurements.get('shoulder_breadth', 0)

            # Calculate ratios
            waist_hip_ratio = waist / hip if hip > 0 else 0
            shoulder_hip_ratio = shoulder / hip if hip > 0 else 0
            chest_waist_ratio = chest / waist if waist > 0 else 0

            # Classify body type
            body_type = self._determine_body_type(
                waist_hip_ratio, shoulder_hip_ratio, chest_waist_ratio,
                waist, hip, chest, shoulder, gender
            )

            # Get style recommendations for this body type
            style_recommendations = self._get_style_recommendations(body_type)

            return {
                'body_type': body_type,
                'description': self._get_body_type_description(body_type),
                'ratios': {
                    'waist_hip': round(waist_hip_ratio, 2),
                    'shoulder_hip': round(shoulder_hip_ratio, 2),
                    'chest_waist': round(chest_waist_ratio, 2)
                },
                'style_recommendations': style_recommendations,
                'confidence': 0.85
            }
        except Exception as e:
            logger.error(f"Error classifying body type: {e}")
            return {
                'body_type': 'rectangle',
                'description': 'Rectangle (default)',
                'style_recommendations': self._get_style_recommendations('rectangle'),
                'confidence': 0.5
            }

    def _determine_body_type(
        self,
        waist_hip_ratio: float,
        shoulder_hip_ratio: float,
        chest_waist_ratio: float,
        waist: float,
        hip: float,
        chest: float,
        shoulder: float,
        gender: str | None
    ) -> str:
        """Determine body type from ratios and measurements"""

        # Hourglass: Waist significantly smaller than both chest and hip
        if waist_hip_ratio < 0.75 and chest_waist_ratio > 1.1:
            return 'hourglass'

        # Inverted Triangle: Shoulders/chest wider than hips
        if shoulder_hip_ratio > 1.05 or (chest > hip and chest > waist):
            return 'inverted_triangle'

        # Triangle/Pear: Hips wider than shoulders/chest
        if hip > chest and hip > shoulder and waist_hip_ratio < 0.85:
            return 'triangle'

        # Rectangle: Similar measurements across chest, waist, hip
        if (0.85 <= waist_hip_ratio <= 0.95 and
            0.9 <= chest_waist_ratio <= 1.1):
            return 'rectangle'

        # Oval/Apple: Waist is largest measurement
        if waist >= chest and waist >= hip:
            return 'oval'

        # Default to rectangle
        return 'rectangle'

    def _get_body_type_description(self, body_type: str) -> str:
        """Get description for body type"""
        descriptions = {
            'hourglass': 'Hourglass - Balanced proportions with defined waist',
            'inverted_triangle': 'Inverted Triangle - Broader shoulders/chest than hips',
            'triangle': 'Triangle/Pear - Hips wider than shoulders',
            'rectangle': 'Rectangle - Straight, balanced proportions',
            'oval': 'Oval/Apple - Waist is the widest point'
        }
        return descriptions.get(body_type, 'Rectangle')

    def _get_style_recommendations(self, body_type: str) -> dict:
        """Get style recommendations for body type"""
        recommendations = {
            'hourglass': {
                'fitted': 'Excellent - Fitted styles highlight your curves',
                'loose': 'Good - Can work but may hide your shape',
                'tips': [
                    'Belted styles emphasize your waist',
                    'Wrap dresses are perfect for you',
                    'Fitted tops with A-line skirts',
                    'Avoid boxy, shapeless styles'
                ]
            },
            'inverted_triangle': {
                'fitted': 'Good - Fitted tops work well',
                'loose': 'Good - Loose bottoms balance your frame',
                'tips': [
                    'V-neck and scoop necks balance shoulders',
                    'A-line skirts and wide-leg pants',
                    'Avoid shoulder pads and wide necklines',
                    'Focus on creating hip volume'
                ]
            },
            'triangle': {
                'fitted': 'Good - Fitted tops create balance',
                'loose': 'Good - Structured tops work well',
                'tips': [
                    'Structured tops and jackets',
                    'Wide necklines and shoulder details',
                    'A-line and flared skirts',
                    'Avoid tight bottoms that emphasize hips'
                ]
            },
            'rectangle': {
                'fitted': 'Good - Fitted styles create definition',
                'loose': 'Good - Loose styles can work',
                'tips': [
                    'Belted styles create waist definition',
                    'Layered looks add dimension',
                    'Peplum tops and A-line skirts',
                    'Avoid shapeless, boxy styles'
                ]
            },
            'oval': {
                'fitted': 'Fair - Fitted styles can work with right cuts',
                'loose': 'Good - Loose, flowy styles are flattering',
                'tips': [
                    'Empire waist and A-line styles',
                    'V-neck and scoop necks elongate',
                    'Structured jackets create definition',
                    'Avoid tight, clingy fabrics'
                ]
            }
        }
        return recommendations.get(body_type, recommendations['rectangle'])

