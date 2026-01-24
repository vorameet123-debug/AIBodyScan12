"""
Fit Meter Calculator
Calculates fit based on ease (difference between garment and body measurements)
Uses color-coded zones: Green (perfect), Red (too tight), Blue (too loose)
"""
from typing import Dict, List, Optional, Any
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
    
    def _normalize_measurements(self, measurements: Dict[str, float]) -> Dict[str, float]:
        """
        Normalize measurement keys to standard names
        e.g., 'chest circumference' -> 'chest'
        """
        normalized = {}
        for key, value in measurements.items():
            key_clean = key.lower().strip()
            # Remove 'circumference' suffix
            if key_clean.endswith(' circumference'):
                key_clean = key_clean.replace(' circumference', '')
            
            # Alias mapping
            if key_clean == 'bust':
                key_clean = 'chest'
            elif key_clean == 'hips':
                key_clean = 'hip'
            elif 'shoulder' in key_clean:
                key_clean = 'shoulder'
            elif 'sleeve' in key_clean or 'arm' in key_clean:
                if 'length' in key_clean:
                    key_clean = 'sleeve_length'
            elif 'height' in key_clean and key_clean != 'height':
                # e.g. 'torso height' -> length for simplicity if needed, but height is height
                pass
            
            normalized[key_clean] = value
        
        # Derived measurements if missing
        if 'length' not in normalized:
            if 'height' in normalized:
                # Roughly estimate torso length as 30% of height for tops
                normalized['length'] = normalized['height'] * 0.38
                
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
        user_measurements: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Estimate garment measurements based on standard sizing (Absolute estimation)
        """
        # Normalize keys first (though we don't rely on user measurements for base specs anymore)
        user_measurements = self._normalize_measurements(user_measurements)

        # Size multipliers (relative to M/32)
        # 1 size step approx 4cm for girths, 1cm for lengths
        size_adjustments = {
            'xs': -8, 'xxs': -12,
            's': -4,
            'm': 0, '38': 0, '32': 0, 'medium': 0,
            'l': 4, '40': 4, '34': 4, 'large': 4,
            'xl': 8, '42': 8, '36': 8,
            'xxl': 12, '44': 12, '38': 12,
            'xxxl': 16
        }
        
        # Parse size
        size_key = size.lower().strip()
        adjustment = size_adjustments.get(size_key)
        
        # Fallback for numeric sizes not in map
        if adjustment is None and size_key.isdigit():
            val = int(size_key)
            if 28 <= val <= 46: # Waist sizing
                adjustment = (val - 32) * 2.54 # inches to cm diff? roughly 2.5cm per inch
                # actually typical sizing is 2 inch steps. 32->34.
                # Let's simple mapping: (val - 32) * 2
                adjustment = (val - 32) * 2

        if adjustment is None:
            adjustment = 0 # Default to M if unknown

        # Get base specs for this garment type
        base = self.BASE_SPECS.get(garment_type.lower(), self.BASE_SPECS['shirt'])
        
        estimated = {}
        for measurement, base_val in base.items():
            # Apply adjustment
            # Girths get full adjustment, lengths get partial (e.g. 25%)
            if measurement in ['length', 'sleeve_length', 'inseam', 'shoulder']:
                current_val = base_val + (adjustment * 0.25)
            else:
                current_val = base_val + adjustment
            
            estimated[measurement] = current_val
        
        logger.info(f"Estimated measurements for {garment_type} size {size} (Adj: {adjustment})")
        return estimated
    
    def calculate_fit_meters(
        self,
        user_measurements: Dict[str, float],
        garment_measurements: Dict[str, float],
        garment_type: str
    ) -> Dict[str, Any]:
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
