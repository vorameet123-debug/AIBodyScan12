"""
Fit Meter Calculator
Calculates fit based on ease (difference between garment and body measurements)
Uses color-coded zones: Green (perfect), Red (too tight), Blue (too loose)
"""
from typing import Any

from loguru import logger


class FitMeterCalculator:
    """Calculate fit metrics with ease-based zones"""

    # Ease zone definitions (in cm)
    EASE_ZONES = {
        'green': {'min': 4, 'max': 8, 'label': 'Perfect Fit'},
        'red': {'min': -100, 'max': 2, 'label': 'Too Tight'},
        'blue': {'min': 10, 'max': 100, 'label': 'Too Loose'}
    }

    # Measurement priorities for different garment types
    GARMENT_MEASUREMENTS = {
        'shirt': ['chest', 'waist', 'shoulder', 'sleeve_length', 'length'],
        't-shirt': ['chest', 'waist', 'shoulder', 'length'],
        'pants': ['waist', 'hip', 'inseam', 'thigh', 'length'],
        'jeans': ['waist', 'hip', 'inseam', 'thigh', 'length'],
        'dress': ['chest', 'waist', 'hip', 'length', 'shoulder'],
        'jacket': ['chest', 'shoulder', 'sleeve_length', 'waist', 'length'],
        'blazer': ['chest', 'shoulder', 'sleeve_length', 'waist', 'length'],
        'hoodie': ['chest', 'shoulder', 'length', 'sleeve_length'],
        'shorts': ['waist', 'hip', 'thigh', 'length'],
        'skirt': ['waist', 'hip', 'length'],
    }

    def __init__(self):
        logger.info("FitMeterCalculator initialized")

    def calculate_ease(self, user_measurement: float, garment_measurement: float) -> float:
        """
        Calculate ease (difference between garment and body)
        
        Args:
            user_measurement: User's body measurement in cm
            garment_measurement: Garment measurement in cm
            
        Returns:
            Ease in cm (positive = room to spare, negative = too tight)
        """
        return garment_measurement - user_measurement

    def get_zone(self, ease: float) -> str:
        """
        Determine which zone the ease falls into
        
        Args:
            ease: Ease value in cm
            
        Returns:
            Zone color: 'green', 'red', or 'blue'
        """
        if self.EASE_ZONES['green']['min'] <= ease <= self.EASE_ZONES['green']['max']:
            return 'green'
        elif ease < self.EASE_ZONES['red']['max']:
            return 'red'
        else:
            return 'blue'

    def get_status(self, zone: str) -> str:
        """
        Get human-readable status from zone
        
        Args:
            zone: Zone color
            
        Returns:
            Status label
        """
        return self.EASE_ZONES[zone]['label']

    def _normalize_measurements(self, measurements: dict[str, float]) -> dict[str, float]:
        """
        Normalize measurement keys to standard names with proper priority mapping
        """
        normalized = {}
        raw_measurements = {}

        # First pass: clean up keys and store all measurements
        for key, value in measurements.items():
            key_clean = key.lower().strip()
            # Remove 'circumference' suffix
            if key_clean.endswith(' circumference'):
                key_base = key_clean.replace(' circumference', '')
                raw_measurements[key_base] = value
            raw_measurements[key_clean] = value

        # Second pass: Map to standard names with priority
        # CHEST: chest circumference or bust
        if 'chest' in raw_measurements:
            normalized['chest'] = raw_measurements['chest']
        elif 'bust' in raw_measurements:
            normalized['chest'] = raw_measurements['bust']

        # WAIST: waist circumference
        if 'waist' in raw_measurements:
            normalized['waist'] = raw_measurements['waist']

        # HIP: hip circumference
        if 'hip' in raw_measurements:
            normalized['hip'] = raw_measurements['hip']
        elif 'hips' in raw_measurements:
            normalized['hip'] = raw_measurements['hips']

        # SHOULDER: shoulder breadth (NOT arm length shoulder to elbow!)
        if 'shoulder breadth' in raw_measurements:
            normalized['shoulder'] = raw_measurements['shoulder breadth']
        elif 'shoulder width' in raw_measurements:
            normalized['shoulder'] = raw_measurements['shoulder width']

        # SLEEVE_LENGTH: arm right length or arm left length (NOT spine to wrist!)
        if 'arm right length' in raw_measurements:
            normalized['sleeve_length'] = raw_measurements['arm right length']
        elif 'arm left length' in raw_measurements:
            normalized['sleeve_length'] = raw_measurements['arm left length']
        elif 'sleeve length' in raw_measurements:
            normalized['sleeve_length'] = raw_measurements['sleeve length']

        # LENGTH (for shirts/tops): shoulder to crotch height
        if 'shoulder to crotch height' in raw_measurements:
            normalized['length'] = raw_measurements['shoulder to crotch height']
        elif 'torso length' in raw_measurements:
            normalized['length'] = raw_measurements['torso length']
        elif 'height' in raw_measurements:
            # Fallback: estimate as 38% of height
            normalized['length'] = raw_measurements['height'] * 0.38

        # INSEAM (for pants): inside leg height or inseam
        if 'inside leg height' in raw_measurements:
            normalized['inseam'] = raw_measurements['inside leg height']
        elif 'inseam' in raw_measurements:
            normalized['inseam'] = raw_measurements['inseam']

        # OUTSEAM (for pants): outseam length
        if 'outseam length' in raw_measurements:
            normalized['outseam'] = raw_measurements['outseam length']
        elif 'outseam' in raw_measurements:
            normalized['outseam'] = raw_measurements['outseam']

        # THIGH: thigh circumference
        if 'thigh left' in raw_measurements:
            normalized['thigh'] = raw_measurements['thigh left']
        elif 'thigh right' in raw_measurements:
            normalized['thigh'] = raw_measurements['thigh right']
        elif 'thigh' in raw_measurements:
            normalized['thigh'] = raw_measurements['thigh']

        # Keep height for reference
        if 'height' in raw_measurements:
            normalized['height'] = raw_measurements['height']

        return normalized


    # Base measurements for Size M / 32 / Regular (in cm)
    BASE_SPECS = {
        'shirt': {'chest': 106, 'waist': 98, 'shoulder': 46, 'sleeve_length': 65, 'length': 76},
        't-shirt': {'chest': 102, 'waist': 96, 'shoulder': 44, 'length': 72},
        'pants': {'waist': 86, 'hip': 102, 'inseam': 81, 'thigh': 60, 'length': 106},
        'jeans': {'waist': 86, 'hip': 102, 'inseam': 81, 'thigh': 60, 'length': 106},
        'jacket': {'chest': 110, 'waist': 104, 'shoulder': 48, 'sleeve_length': 66, 'length': 74},
        'hoodie': {'chest': 112, 'shoulder': 50, 'length': 70, 'sleeve_length': 66},
        'shorts': {'waist': 86, 'hip': 102, 'thigh': 62, 'length': 50},
        'dress': {'chest': 90, 'waist': 72, 'hip': 96, 'length': 90, 'shoulder': 38},
        'skirt': {'waist': 72, 'hip': 96, 'length': 60}
    }

    def estimate_garment_measurements(
        self,
        garment_type: str,
        size: str,
        user_measurements: dict[str, float],
        fit_type: str = 'slim'
    ) -> dict[str, float]:
        """
        Estimate garment measurements using real sizing charts
        
        Args:
            garment_type: Type of garment (e.g., 'shirt', 'pants')
            size: Size label (e.g., 'M', 'L', 'XL')
            user_measurements: User's body measurements (for reference)
            fit_type: Fit preference - 'slim', 'regular', or 'loose'
            
        Returns:
            Dictionary of estimated garment measurements
        """
        from integrations.sizing_charts import apply_fit_adjustment, get_sizing_chart, get_special_garment_info

        # Normalize user measurements (for reference/special cases)
        user_measurements = self._normalize_measurements(user_measurements)

        # Get the appropriate sizing chart for this garment type
        sizing_chart = get_sizing_chart(garment_type)

        # Normalize size key
        size_key = size.upper().strip()

        # Try to find exact size match
        if size_key in sizing_chart:
            base_measurements = sizing_chart[size_key]
        else:
            # Try common variations
            size_map = {
                'SMALL': 'S', 'MEDIUM': 'M', 'LARGE': 'L',
                'EXTRA SMALL': 'XS', 'EXTRA LARGE': 'XL'
            }
            size_key = size_map.get(size_key, size_key)

            if size_key in sizing_chart:
                base_measurements = sizing_chart[size_key]
            else:
                # Default to M if size not found
                logger.warning(f"Size '{size}' not found in chart, defaulting to M")
                base_measurements = sizing_chart.get('M', list(sizing_chart.values())[0])

        # Apply fit type adjustments
        estimated = apply_fit_adjustment(base_measurements, fit_type)

        # Check for special garment handling
        special_info = get_special_garment_info(garment_type)

        # Handle leggings (negative ease)
        if special_info.get('negative_ease'):
            # For leggings, reduce measurements by 6cm
            for key in ['waist', 'hip']:
                if key in estimated:
                    estimated[key] -= 6
            logger.info("Applied negative ease for leggings")

        logger.info(f"Estimated measurements for {garment_type} size {size} ({fit_type} fit)")
        return estimated

    def calculate_fit_meters(
        self,
        user_measurements: dict[str, float],
        garment_measurements: dict[str, float],
        garment_type: str
    ) -> dict[str, Any]:
        """
        Calculate fit meters for all relevant measurements
        
        Args:
            user_measurements: User's body measurements
            garment_measurements: Garment measurements
            garment_type: Type of garment
            
        Returns:
            Dictionary with fit meter data for each measurement
        """
        # Normalize user measurement keys
        user_measurements = self._normalize_measurements(user_measurements)

        fit_meters = {}
        scores = []

        # Get relevant measurements for this garment type
        relevant_measurements = self.GARMENT_MEASUREMENTS.get(
            garment_type.lower(),
            ['chest', 'waist', 'hip']
        )

        for measurement in relevant_measurements:
            if measurement in user_measurements and measurement in garment_measurements:
                user_val = user_measurements[measurement]
                garment_val = garment_measurements[measurement]
                ease = self.calculate_ease(user_val, garment_val)
                zone = self.get_zone(ease)
                status = self.get_status(zone)

                # Calculate score for this measurement (0-100)
                if zone == 'green':
                    score = 100
                elif zone == 'red':
                    # Score decreases as it gets tighter
                    if ease < 0:
                        score = max(0, 50 + ease * 5)  # Negative ease is bad
                    else:
                        score = 70 + ease * 5  # Close to green zone
                else:  # blue zone
                    # Score decreases as it gets looser
                    excess_ease = ease - 10
                    score = max(50, 80 - excess_ease * 2)

                fit_meters[measurement] = {
                    'user_measurement': round(user_val, 1),
                    'garment_measurement': round(garment_val, 1),
                    'ease': round(ease, 1),
                    'zone': zone,
                    'status': status,
                    'score': round(score, 1)
                }

                scores.append(score)

        # Calculate overall fit score
        overall_fit_score = round(sum(scores) / len(scores), 1) if scores else 50

        # Find worst metric (lowest score)
        worst_metric = None
        worst_score = 100
        for measurement, data in fit_meters.items():
            if data['score'] < worst_score:
                worst_score = data['score']
                worst_metric = measurement

        result = {
            'fit_meters': fit_meters,
            'overall_fit_score': overall_fit_score,
            'worst_metric': worst_metric or 'chest',
            'total_measurements': len(fit_meters)
        }

        logger.info(f"Calculated fit meters: overall score {overall_fit_score}, worst: {worst_metric}")
        return result

    def get_fit_recommendation(self, overall_fit_score: float, worst_metric: str, worst_zone: str) -> str:
        """
        Get a simple fit recommendation
        
        Args:
            overall_fit_score: Overall fit score (0-100)
            worst_metric: Worst-performing measurement
            worst_zone: Zone of worst measurement
            
        Returns:
            Recommendation text
        """
        if overall_fit_score >= 85:
            return "Perfect fit! This size is ideal for you."
        elif overall_fit_score >= 70:
            return f"Good fit overall, but watch the {worst_metric} area."
        elif worst_zone == 'red':
            return f"Size up - the {worst_metric} is too tight."
        elif worst_zone == 'blue':
            return f"Size down - the {worst_metric} is too loose."
        else:
            return "Consider trying a different size for better fit."

    def analyze_all_sizes(
        self,
        user_measurements: dict[str, float],
        garment_type: str,
        fit_type: str = 'slim'
    ) -> dict[str, Any]:
        """
        Analyze fit for all available sizes and recommend the best one
        
        Args:
            user_measurements: User's body measurements
            garment_type: Type of garment
            fit_type: Fit preference (slim/regular/loose)
            
        Returns:
            Dictionary with all size results and recommendation
        """
        from integrations.sizing_charts import get_sizing_chart

        # Get available sizes for this garment type
        sizing_chart = get_sizing_chart(garment_type)
        available_sizes = list(sizing_chart.keys())

        logger.info(f"Analyzing {len(available_sizes)} sizes for {garment_type}")

        all_results = {}
        size_scores = {}

        # Analyze each size
        for size in available_sizes:
            try:
                # Estimate garment measurements for this size
                garment_measurements = self.estimate_garment_measurements(
                    garment_type, size, user_measurements, fit_type
                )

                # Calculate fit meters
                fit_result = self.calculate_fit_meters(
                    user_measurements, garment_measurements, garment_type
                )

                all_results[size] = fit_result
                size_scores[size] = fit_result['overall_fit_score']

            except Exception as e:
                logger.warning(f"Error analyzing size {size}: {e}")
                all_results[size] = {
                    'overall_fit_score': 0,
                    'fit_meters': {},
                    'error': str(e)
                }
                size_scores[size] = 0

        # Find best size (highest score)
        if size_scores:
            recommended_size = max(size_scores, key=size_scores.get)
            recommended_score = size_scores[recommended_size]
        else:
            recommended_size = 'M'  # Fallback
            recommended_score = 0

        # Find alternative sizes (within 10 points of best)
        alternatives = []
        for size, score in size_scores.items():
            if size != recommended_size and score >= recommended_score - 10:
                alternatives.append({
                    'size': size,
                    'score': score,
                    'difference': recommended_score - score
                })

        # Sort alternatives by score
        alternatives.sort(key=lambda x: x['score'], reverse=True)

        result = {
            'all_sizes': all_results,
            'size_scores': size_scores,
            'recommended_size': recommended_size,
            'recommended_score': recommended_score,
            'alternatives': alternatives[:3],  # Top 3 alternatives
            'total_sizes_analyzed': len(available_sizes)
        }

        logger.info(f"Size analysis complete. Recommended: {recommended_size} ({recommended_score}/100)")
        return result

