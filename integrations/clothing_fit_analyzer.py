"""
Clothing Fit Analysis Engine
Analyzes how well a clothing item will fit based on user measurements and clothing specifications
"""
from loguru import logger


class ClothingFitAnalyzer:
    """
    Analyzes clothing fit by comparing user measurements with clothing size charts
    """

    def __init__(self):
        """Initialize fit analyzer with size charts"""
        self.size_charts = self._load_size_charts()
        self.clothing_type_mappings = self._load_clothing_type_mappings()
        logger.info("ClothingFitAnalyzer initialized")

    def _load_size_charts(self) -> dict:
        """Load size charts for different clothing categories"""
        # Reuse existing size charts from size_recommendation.py
        charts = {
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
            'numeric_pants': {
                '24': {'waist_min': 58, 'waist_max': 64},
                '26': {'waist_min': 64, 'waist_max': 70},
                '28': {'waist_min': 70, 'waist_max': 76},
                '30': {'waist_min': 76, 'waist_max': 82},
                '32': {'waist_min': 82, 'waist_max': 88},
                '34': {'waist_min': 88, 'waist_max': 94},
                '36': {'waist_min': 94, 'waist_max': 100},
                '38': {'waist_min': 100, 'waist_max': 106},
                '40': {'waist_min': 106, 'waist_max': 112}
            },
            'dresses': {
                'XS': {'chest_min': 0, 'chest_max': 75, 'waist_min': 0, 'waist_max': 65},
                'S': {'chest_min': 75, 'chest_max': 85, 'waist_min': 65, 'waist_max': 75},
                'M': {'chest_min': 85, 'chest_max': 95, 'waist_min': 75, 'waist_max': 85},
                'L': {'chest_min': 95, 'chest_max': 105, 'waist_min': 85, 'waist_max': 95},
                'XL': {'chest_min': 105, 'chest_max': 115, 'waist_min': 95, 'waist_max': 105}
            }
        }
        return charts

    def _load_clothing_type_mappings(self) -> dict:
        """Map clothing types to size chart categories and relevant measurements"""
        return {
            # Tops
            't-shirt': {'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
            'shirt': {'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
            'blouse': {'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
            'sweater': {'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
            'jacket': {'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},
            'hoodie': {'chart': 'generic_tops', 'primary': 'chest_circumference', 'secondary': 'height'},

            # Bottoms
            'jeans': {'chart': 'numeric_pants', 'primary': 'waist_circumference', 'secondary': 'inside leg height'},
            'pants': {'chart': 'generic_bottoms', 'primary': 'waist_circumference', 'secondary': 'height'},
            'shorts': {'chart': 'generic_bottoms', 'primary': 'waist_circumference', 'secondary': 'height'},
            'trousers': {'chart': 'generic_bottoms', 'primary': 'waist_circumference', 'secondary': 'height'},
            'skirt': {'chart': 'generic_bottoms', 'primary': 'waist_circumference', 'secondary': 'height'},

            # Dresses
            'dress': {'chart': 'dresses', 'primary': 'chest_circumference', 'secondary': 'waist_circumference'},
            'gown': {'chart': 'dresses', 'primary': 'chest_circumference', 'secondary': 'waist_circumference'},
            'jumpsuit': {'chart': 'dresses', 'primary': 'chest_circumference', 'secondary': 'waist_circumference'},
        }

    def convert_size_to_measurements(
        self,
        size: str,
        clothing_type: str,
        size_system: str = 'US',
        brand: str | None = None
    ) -> dict[str, float]:
        """
        Convert clothing size to expected measurements
        
        Args:
            size: Size string (e.g., 'M', '32', 'L')
            clothing_type: Type of clothing (e.g., 'jeans', 'shirt')
            size_system: Size system (US, UK, EU)
            brand: Optional brand name for brand-specific adjustments
        
        Returns:
            Dictionary of expected measurements for that size
        """
        clothing_type_lower = clothing_type.lower()

        # Get the appropriate chart and measurement mapping
        if clothing_type_lower not in self.clothing_type_mappings:
            logger.warning(f"Unknown clothing type: {clothing_type}, using generic_tops")
            chart_name = 'generic_tops'
            primary_measurement = 'chest_circumference'
        else:
            mapping = self.clothing_type_mappings[clothing_type_lower]
            chart_name = mapping['chart']
            primary_measurement = mapping['primary']

        # Get size chart
        if chart_name not in self.size_charts:
            logger.warning(f"Size chart {chart_name} not found")
            return {}

        size_chart = self.size_charts[chart_name]

        # Handle numeric sizes (for pants)
        if size.isdigit() and chart_name == 'numeric_pants':
            size_key = size
        else:
            # Handle letter sizes - convert if needed
            size_key = self._normalize_size(size, size_system)

        if size_key not in size_chart:
            logger.warning(f"Size {size_key} not found in chart {chart_name}")
            return {}

        size_range = size_chart[size_key]

        # Convert size range to expected measurements
        expected_measurements = {}

        if 'chest_min' in size_range:
            # Average of min and max
            expected_measurements['chest_circumference'] = (size_range['chest_min'] + size_range['chest_max']) / 2

        if 'waist_min' in size_range:
            expected_measurements['waist_circumference'] = (size_range['waist_min'] + size_range['waist_max']) / 2

        if 'height_min' in size_range:
            expected_measurements['height'] = (size_range['height_min'] + size_range['height_max']) / 2

        # Apply brand-specific adjustments if provided
        if brand:
            adjustment = self._get_brand_adjustment(brand, size_key)
            if adjustment and primary_measurement in expected_measurements:
                expected_measurements[primary_measurement] += adjustment

        return expected_measurements

    def _normalize_size(self, size: str, size_system: str) -> str:
        """Normalize size to standard format"""
        size_upper = size.upper().strip()

        # Handle common variations
        size_map = {
            'XS': 'XS', 'EXTRA SMALL': 'XS',
            'S': 'S', 'SMALL': 'S',
            'M': 'M', 'MEDIUM': 'M',
            'L': 'L', 'LARGE': 'L',
            'XL': 'XL', 'EXTRA LARGE': 'XL',
            'XXL': 'XXL', '2XL': 'XXL',
        }

        return size_map.get(size_upper, size_upper)

    def _get_brand_adjustment(self, brand: str, size: str) -> float | None:
        """Get brand-specific size adjustment (cm)"""
        # Brand fit characteristics (will be expanded)
        brand_fits = {
            'nike': {'runs': 'small', 'adjustment': +2},  # Runs small, add 2cm
            'zara': {'runs': 'large', 'adjustment': -2},  # Runs large, subtract 2cm
            'h&m': {'runs': 'small', 'adjustment': +1},
            'adidas': {'runs': 'true', 'adjustment': 0},
        }

        brand_lower = brand.lower().strip()
        if brand_lower in brand_fits:
            return brand_fits[brand_lower]['adjustment']

        return None

    def analyze_fit(
        self,
        user_measurements: dict[str, float],
        clothing_size: str,
        clothing_type: str,
        size_system: str = 'US',
        brand: str | None = None
    ) -> dict:
        """
        Analyze how well clothing will fit user
        
        Args:
            user_measurements: User's body measurements
            clothing_size: Size of clothing item
            clothing_type: Type of clothing
            size_system: Size system used
            brand: Optional brand name
        
        Returns:
            Dictionary with fit analysis results
        """
        # Get expected measurements for clothing size
        expected_measurements = self.convert_size_to_measurements(
            clothing_size, clothing_type, size_system, brand
        )

        if not expected_measurements:
            return {
                'fit_confidence': 0,
                'fit_status': 'unknown',
                'message': 'Could not determine expected measurements for this size'
            }

        # Get relevant measurements for this clothing type
        clothing_type_lower = clothing_type.lower()
        if clothing_type_lower in self.clothing_type_mappings:
            primary_measurement = self.clothing_type_mappings[clothing_type_lower]['primary']
            secondary_measurement = self.clothing_type_mappings[clothing_type_lower].get('secondary')
        else:
            primary_measurement = 'chest_circumference'
            secondary_measurement = None

        # Compare user measurements with expected measurements
        fit_scores = []
        problem_areas = []

        # Check primary measurement
        if primary_measurement in expected_measurements and primary_measurement in user_measurements:
            user_value = user_measurements[primary_measurement]
            expected_value = expected_measurements[primary_measurement]
            difference = user_value - expected_value

            # Calculate fit score (0-100)
            # Perfect fit: difference = 0 (score = 100)
            # Within 2cm: score = 90-100
            # Within 5cm: score = 70-90
            # More than 5cm: score decreases
            if abs(difference) <= 2:
                score = 100 - (abs(difference) * 5)  # 90-100
            elif abs(difference) <= 5:
                score = 90 - ((abs(difference) - 2) * 6.67)  # 70-90
            else:
                score = max(0, 70 - ((abs(difference) - 5) * 5))  # 0-70

            fit_scores.append(score)

            # Record problem area if significant
            if abs(difference) > 3:
                if difference > 0:
                    problem_areas.append({
                        'area': primary_measurement.replace('_', ' ').title(),
                        'issue': f'Too tight by {abs(difference):.1f}cm',
                        'severity': 'high' if abs(difference) > 5 else 'medium'
                    })
                else:
                    problem_areas.append({
                        'area': primary_measurement.replace('_', ' ').title(),
                        'issue': f'Too loose by {abs(difference):.1f}cm',
                        'severity': 'high' if abs(difference) > 5 else 'medium'
                    })

        # Check secondary measurement if available
        if secondary_measurement and secondary_measurement in expected_measurements and secondary_measurement in user_measurements:
            user_value = user_measurements[secondary_measurement]
            expected_value = expected_measurements[secondary_measurement]
            difference = user_value - expected_value

            if abs(difference) <= 2:
                score = 100 - (abs(difference) * 5)
            elif abs(difference) <= 5:
                score = 90 - ((abs(difference) - 2) * 6.67)
            else:
                score = max(0, 70 - ((abs(difference) - 5) * 5))

            fit_scores.append(score * 0.5)  # Secondary measurement weighted less

        # Calculate overall fit confidence
        if fit_scores:
            fit_confidence = sum(fit_scores) / len(fit_scores) if fit_scores else 0
        else:
            fit_confidence = 0

        # Determine fit status
        if fit_confidence >= 85:
            fit_status = 'perfect'
        elif fit_confidence >= 70:
            fit_status = 'good'
        elif fit_confidence >= 50:
            fit_status = 'fair'
        else:
            fit_status = 'poor'

        # Find alternative sizes
        alternative_sizes = self._find_alternative_sizes(
            user_measurements, clothing_type, size_system, brand, primary_measurement
        )

        return {
            'fit_confidence': round(fit_confidence, 1),
            'fit_status': fit_status,
            'problem_areas': problem_areas,
            'alternative_sizes': alternative_sizes,
            'expected_measurements': expected_measurements,
            'user_measurements_used': {
                primary_measurement: user_measurements.get(primary_measurement),
                **((secondary_measurement and {secondary_measurement: user_measurements.get(secondary_measurement)}) or {})
            }
        }

    def _find_alternative_sizes(
        self,
        user_measurements: dict[str, float],
        clothing_type: str,
        size_system: str,
        brand: str | None,
        primary_measurement: str
    ) -> list[dict]:
        """Find alternative sizes that might fit better"""
        clothing_type_lower = clothing_type.lower()
        if clothing_type_lower not in self.clothing_type_mappings:
            return []

        mapping = self.clothing_type_mappings[clothing_type_lower]
        chart_name = mapping['chart']

        if chart_name not in self.size_charts:
            return []

        size_chart = self.size_charts[chart_name]
        user_value = user_measurements.get(primary_measurement, 0)

        alternatives = []

        for size_key, size_range in size_chart.items():
            # Get expected measurement for this size
            if 'chest_min' in size_range and primary_measurement == 'chest_circumference':
                expected = (size_range['chest_min'] + size_range['chest_max']) / 2
            elif 'waist_min' in size_range and primary_measurement == 'waist_circumference':
                expected = (size_range['waist_min'] + size_range['waist_max']) / 2
            else:
                continue

            # Apply brand adjustment
            if brand:
                adjustment = self._get_brand_adjustment(brand, size_key)
                if adjustment:
                    expected += adjustment

            # Calculate fit score for this size
            difference = abs(user_value - expected)
            if difference <= 5:  # Only include sizes within 5cm
                if difference <= 2:
                    score = 100 - (difference * 5)
                elif difference <= 5:
                    score = 90 - ((difference - 2) * 6.67)
                else:
                    score = 0

                alternatives.append({
                    'size': size_key,
                    'fit_confidence': round(score, 1),
                    'difference': round(difference, 1)
                })

        # Sort by fit confidence (best first)
        alternatives.sort(key=lambda x: x['fit_confidence'], reverse=True)

        # Return top 3 alternatives
        return alternatives[:3]

