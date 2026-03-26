"""
Style Compatibility Analyzer
Analyzes style compatibility based on body type, occasion, and clothing type
"""

from loguru import logger


class StyleAnalyzer:
    """
    Analyzes style compatibility and provides recommendations
    """

    def __init__(self):
        """Initialize style analyzer"""
        # Style compatibility rules
        self.style_rules = {
            'hourglass': {
                'fitted': {'score': 95, 'description': 'Fitted styles are excellent for your body type'},
                'loose': {'score': 70, 'description': 'Loose styles can work but may hide your curves'},
                'recommended': ['Fitted', 'Belted', 'Wrap', 'A-line'],
                'avoid': ['Boxy', 'Oversized', 'Shapeless']
            },
            'inverted_triangle': {
                'fitted': {'score': 75, 'description': 'Fitted tops work well'},
                'loose': {'score': 85, 'description': 'Loose bottoms balance your frame'},
                'recommended': ['V-neck', 'A-line', 'Wide-leg', 'Structured'],
                'avoid': ['Shoulder pads', 'Wide necklines', 'Tight bottoms']
            },
            'triangle': {
                'fitted': {'score': 80, 'description': 'Fitted tops create balance'},
                'loose': {'score': 75, 'description': 'Structured tops work well'},
                'recommended': ['Structured tops', 'Wide necklines', 'A-line', 'Flared'],
                'avoid': ['Tight bottoms', 'Hip-hugging styles']
            },
            'rectangle': {
                'fitted': {'score': 80, 'description': 'Fitted styles create definition'},
                'loose': {'score': 70, 'description': 'Loose styles can work with layering'},
                'recommended': ['Belted', 'Layered', 'Peplum', 'A-line'],
                'avoid': ['Shapeless', 'Boxy', 'Oversized']
            },
            'oval': {
                'fitted': {'score': 60, 'description': 'Fitted styles can work with right cuts'},
                'loose': {'score': 85, 'description': 'Loose, flowy styles are flattering'},
                'recommended': ['Empire waist', 'A-line', 'V-neck', 'Structured'],
                'avoid': ['Tight', 'Clingy', 'High-waisted']
            }
        }

        # Occasion style requirements
        self.occasion_styles = {
            'Sports': {
                'fit': 'loose',
                'style': 'athletic',
                'description': 'Comfortable, functional fit for movement'
            },
            'Casual': {
                'fit': 'relaxed',
                'style': 'comfortable',
                'description': 'Relaxed, comfortable fit'
            },
            'Formal': {
                'fit': 'fitted',
                'style': 'tailored',
                'description': 'Well-fitted, tailored appearance'
            },
            'Party': {
                'fit': 'fitted',
                'style': 'stylish',
                'description': 'Fitted, fashionable styles'
            },
            'Business': {
                'fit': 'fitted',
                'style': 'professional',
                'description': 'Professional, well-fitted appearance'
            },
            'Wedding': {
                'fit': 'fitted',
                'style': 'elegant',
                'description': 'Elegant, well-fitted styles'
            },
            'Beach': {
                'fit': 'loose',
                'style': 'relaxed',
                'description': 'Loose, comfortable beach wear'
            },
            'Winter': {
                'fit': 'relaxed',
                'style': 'layered',
                'description': 'Layered, comfortable fit'
            },
            'Summer': {
                'fit': 'loose',
                'style': 'breathable',
                'description': 'Loose, breathable styles'
            }
        }

        logger.info("StyleAnalyzer initialized")

    def analyze_style(
        self,
        body_type: str,
        clothing_type: str,
        occasion: str | None = None,
        fit_preference: str | None = None
    ) -> dict:
        """
        Analyze style compatibility
        
        Args:
            body_type: Body type classification
            clothing_type: Type of clothing
            occasion: Occasion type (optional)
            fit_preference: Preferred fit (fitted/loose, optional)
        
        Returns:
            Dictionary with style analysis
        """
        # Get body type recommendations
        if body_type not in self.style_rules:
            body_type = 'rectangle'  # Default

        body_recommendations = self.style_rules[body_type]

        # Determine fit preference
        if not fit_preference:
            # Infer from occasion
            if occasion and occasion in self.occasion_styles:
                fit_preference = self.occasion_styles[occasion]['fit']
            else:
                fit_preference = 'fitted'  # Default

        # Get style score based on fit preference
        if fit_preference in body_recommendations:
            style_score = body_recommendations[fit_preference]['score']
            style_description = body_recommendations[fit_preference]['description']
        else:
            style_score = 75  # Neutral
            style_description = 'Style compatibility is good'

        # Check occasion appropriateness
        occasion_score = 100
        occasion_notes = []

        if occasion and occasion in self.occasion_styles:
            occasion_style = self.occasion_styles[occasion]
            if fit_preference != occasion_style['fit']:
                occasion_score = 80
                occasion_notes.append(
                    f"For {occasion}, {occasion_style['fit']} fit is typically preferred, but {fit_preference} can work"
                )
            else:
                occasion_notes.append(
                    f"Perfect fit style for {occasion} - {occasion_style['description']}"
                )

        # Calculate overall style compatibility
        overall_score = (style_score * 0.7 + occasion_score * 0.3)

        # Get recommendations
        recommendations = body_recommendations.get('recommended', [])
        avoid = body_recommendations.get('avoid', [])

        return {
            'style_compatibility': round(overall_score, 1),
            'body_type_score': style_score,
            'occasion_score': occasion_score,
            'fit_preference': fit_preference,
            'description': style_description,
            'recommended_styles': recommendations,
            'styles_to_avoid': avoid,
            'occasion_notes': occasion_notes,
            'overall_recommendation': self._get_overall_recommendation(overall_score)
        }

    def _get_overall_recommendation(self, score: float) -> str:
        """Get overall style recommendation based on score"""
        if score >= 85:
            return 'Excellent - This style is perfect for you!'
        elif score >= 70:
            return 'Good - This style works well for your body type'
        elif score >= 60:
            return 'Fair - This style can work with some adjustments'
        else:
            return 'Consider alternatives - This style may not be ideal'

