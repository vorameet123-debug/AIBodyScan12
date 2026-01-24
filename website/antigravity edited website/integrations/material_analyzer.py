"""
Material Comfort Analysis Engine
Analyzes material properties for comfort, breathability, and occasion suitability
"""
from typing import Dict, Optional
from loguru import logger


class MaterialAnalyzer:
    """
    Analyzes material comfort and suitability
    """
    
    def __init__(self):
        """Initialize material analyzer with material database"""
        self.material_properties = {
            'Cotton': {
                'breathability': 95,
                'softness': 90,
                'durability': 80,
                'moisture_wicking': 60,
                'warmth': 50,
                'coolness': 90,
                'skin_sensitivity': 'low',
                'best_for': ['Casual', 'Summer', 'Sensitive Skin', 'Everyday'],
                'climate': ['Warm', 'Moderate'],
                'care': 'Easy - Machine washable',
                'shrinkage_risk': 'Medium'
            },
            'Polyester': {
                'breathability': 50,
                'softness': 70,
                'durability': 95,
                'moisture_wicking': 90,
                'warmth': 60,
                'coolness': 40,
                'skin_sensitivity': 'low',
                'best_for': ['Sports', 'Activewear', 'Winter', 'Outdoor'],
                'climate': ['Cold', 'Moderate'],
                'care': 'Easy - Machine washable, quick dry',
                'shrinkage_risk': 'Low'
            },
            'Wool': {
                'breathability': 70,
                'softness': 60,
                'durability': 85,
                'moisture_wicking': 80,
                'warmth': 95,
                'coolness': 20,
                'skin_sensitivity': 'medium',
                'best_for': ['Winter', 'Formal', 'Cold Weather'],
                'climate': ['Cold'],
                'care': 'Moderate - Hand wash or dry clean',
                'shrinkage_risk': 'High',
                'sensitivity_warning': 'May cause itching for sensitive skin'
            },
            'Linen': {
                'breathability': 98,
                'softness': 75,
                'durability': 70,
                'moisture_wicking': 85,
                'warmth': 30,
                'coolness': 95,
                'skin_sensitivity': 'low',
                'best_for': ['Summer', 'Casual', 'Beach', 'Hot Weather'],
                'climate': ['Warm', 'Hot'],
                'care': 'Moderate - Wrinkles easily, iron needed',
                'shrinkage_risk': 'Medium'
            },
            'Silk': {
                'breathability': 80,
                'softness': 98,
                'durability': 60,
                'moisture_wicking': 70,
                'warmth': 50,
                'coolness': 70,
                'skin_sensitivity': 'low',
                'best_for': ['Formal', 'Party', 'Wedding', 'Luxury'],
                'climate': ['Moderate'],
                'care': 'Difficult - Dry clean recommended',
                'shrinkage_risk': 'Medium'
            },
            'Denim': {
                'breathability': 60,
                'softness': 70,
                'durability': 98,
                'moisture_wicking': 50,
                'warmth': 70,
                'coolness': 50,
                'skin_sensitivity': 'low',
                'best_for': ['Casual', 'Everyday', 'Jeans'],
                'climate': ['Moderate', 'Cool'],
                'care': 'Easy - Machine washable',
                'shrinkage_risk': 'Low'
            },
            'Spandex': {
                'breathability': 70,
                'softness': 85,
                'durability': 90,
                'moisture_wicking': 85,
                'warmth': 50,
                'coolness': 60,
                'skin_sensitivity': 'low',
                'best_for': ['Sports', 'Activewear', 'Athletic'],
                'climate': ['Moderate'],
                'care': 'Easy - Machine washable',
                'shrinkage_risk': 'Low'
            },
            'Nylon': {
                'breathability': 40,
                'softness': 80,
                'durability': 95,
                'moisture_wicking': 85,
                'warmth': 60,
                'coolness': 40,
                'skin_sensitivity': 'low',
                'best_for': ['Sports', 'Outdoor', 'Activewear'],
                'climate': ['Moderate', 'Cold'],
                'care': 'Easy - Machine washable',
                'shrinkage_risk': 'Low'
            },
            'Rayon': {
                'breathability': 85,
                'softness': 90,
                'durability': 65,
                'moisture_wicking': 70,
                'warmth': 50,
                'coolness': 80,
                'skin_sensitivity': 'low',
                'best_for': ['Casual', 'Summer', 'Everyday'],
                'climate': ['Warm', 'Moderate'],
                'care': 'Moderate - Delicate wash',
                'shrinkage_risk': 'High'
            },
            'Viscose': {
                'breathability': 80,
                'softness': 85,
                'durability': 70,
                'moisture_wicking': 75,
                'warmth': 50,
                'coolness': 75,
                'skin_sensitivity': 'low',
                'best_for': ['Casual', 'Summer', 'Everyday'],
                'climate': ['Warm', 'Moderate'],
                'care': 'Moderate - Delicate wash',
                'shrinkage_risk': 'High'
            },
            'Leather': {
                'breathability': 20,
                'softness': 60,
                'durability': 98,
                'moisture_wicking': 10,
                'warmth': 80,
                'coolness': 20,
                'skin_sensitivity': 'low',
                'best_for': ['Formal', 'Winter', 'Jackets'],
                'climate': ['Cold'],
                'care': 'Difficult - Specialized cleaning',
                'shrinkage_risk': 'Low'
            },
            'Synthetic Blend': {
                'breathability': 60,
                'softness': 75,
                'durability': 85,
                'moisture_wicking': 75,
                'warmth': 60,
                'coolness': 60,
                'skin_sensitivity': 'low',
                'best_for': ['Casual', 'Everyday', 'Sports'],
                'climate': ['Moderate'],
                'care': 'Easy - Machine washable',
                'shrinkage_risk': 'Low'
            }
        }
        
        # Occasion requirements
        self.occasion_requirements = {
            'Sports': {
                'required_properties': ['moisture_wicking', 'breathability'],
                'min_scores': {'moisture_wicking': 70, 'breathability': 60},
                'preferred_materials': ['Polyester', 'Spandex', 'Nylon']
            },
            'Casual': {
                'required_properties': ['softness', 'breathability'],
                'min_scores': {'softness': 70, 'breathability': 60},
                'preferred_materials': ['Cotton', 'Linen', 'Denim']
            },
            'Formal': {
                'required_properties': ['durability', 'softness'],
                'min_scores': {'durability': 70, 'softness': 70},
                'preferred_materials': ['Wool', 'Silk', 'Cotton']
            },
            'Party': {
                'required_properties': ['softness'],
                'min_scores': {'softness': 80},
                'preferred_materials': ['Silk', 'Rayon', 'Viscose']
            },
            'Business': {
                'required_properties': ['durability', 'softness'],
                'min_scores': {'durability': 75, 'softness': 70},
                'preferred_materials': ['Cotton', 'Wool', 'Synthetic Blend']
            },
            'Wedding': {
                'required_properties': ['softness'],
                'min_scores': {'softness': 85},
                'preferred_materials': ['Silk', 'Linen', 'Cotton']
            },
            'Beach': {
                'required_properties': ['breathability', 'coolness'],
                'min_scores': {'breathability': 80, 'coolness': 80},
                'preferred_materials': ['Linen', 'Cotton', 'Rayon']
            },
            'Winter': {
                'required_properties': ['warmth'],
                'min_scores': {'warmth': 70},
                'preferred_materials': ['Wool', 'Polyester', 'Leather']
            },
            'Summer': {
                'required_properties': ['breathability', 'coolness'],
                'min_scores': {'breathability': 75, 'coolness': 75},
                'preferred_materials': ['Cotton', 'Linen', 'Rayon']
            }
        }
        
        logger.info("MaterialAnalyzer initialized")
    
    def analyze_material(
        self,
        material: str,
        occasion: Optional[str] = None,
        climate: Optional[str] = None
    ) -> Dict:
        """
        Analyze material comfort and suitability
        
        Args:
            material: Material name
            occasion: Occasion type (optional)
            climate: Climate/season (optional)
        
        Returns:
            Dictionary with material analysis
        """
        material_cap = material.capitalize()
        
        if material_cap not in self.material_properties:
            logger.warning(f"Unknown material: {material}, using default")
            return {
                'comfort_score': 70,
                'breathability': 50,
                'softness': 50,
                'durability': 50,
                'moisture_wicking': 50,
                'warmth': 50,
                'coolness': 50,
                'skin_sensitivity': 'unknown',
                'suitability': 'unknown',
                'occasion_suitability': 'unknown',
                'climate_suitability': 'unknown',
                'best_for': [],
                'care_instructions': 'Unknown',
                'shrinkage_risk': 'Unknown',
                'warnings': [],
                'recommendations': []
            }
        
        properties = self.material_properties[material_cap]
        
        # Calculate overall comfort score (weighted average)
        comfort_score = (
            properties['breathability'] * 0.3 +
            properties['softness'] * 0.3 +
            properties['moisture_wicking'] * 0.2 +
            (100 - properties.get('skin_sensitivity_score', 0)) * 0.2
        )
        
        # Check occasion suitability
        occasion_suitability = 'good'
        occasion_warnings = []
        occasion_recommendations = []
        
        if occasion and occasion in self.occasion_requirements:
            req = self.occasion_requirements[occasion]
            
            # Check if material meets requirements
            meets_requirements = True
            for prop in req['required_properties']:
                if prop in properties:
                    min_score = req['min_scores'].get(prop, 0)
                    if properties[prop] < min_score:
                        meets_requirements = False
                        occasion_warnings.append(
                            f"{material_cap} may not be ideal for {occasion} - {prop} score is {properties[prop]}/100 (recommended: {min_score}+)"
                        )
            
            if not meets_requirements:
                occasion_suitability = 'poor'
                if material_cap not in req['preferred_materials']:
                    occasion_recommendations.append(
                        f"Consider materials like {', '.join(req['preferred_materials'][:3])} for {occasion}"
                    )
            elif material_cap in req['preferred_materials']:
                occasion_suitability = 'excellent'
        
        # Check climate suitability
        climate_suitability = 'good'
        climate_warnings = []
        
        if climate:
            if climate.lower() in ['warm', 'summer', 'hot']:
                if properties['coolness'] < 70:
                    climate_suitability = 'poor'
                    climate_warnings.append(
                        f"{material_cap} may be too warm for {climate} weather"
                    )
            elif climate.lower() in ['cold', 'winter']:
                if properties['warmth'] < 70:
                    climate_suitability = 'poor'
                    climate_warnings.append(
                        f"{material_cap} may not provide enough warmth for {climate} weather"
                    )
        
        # Collect all warnings
        all_warnings = []
        if properties.get('sensitivity_warning'):
            all_warnings.append(properties['sensitivity_warning'])
        all_warnings.extend(occasion_warnings)
        all_warnings.extend(climate_warnings)
        
        # Determine overall suitability
        if occasion_suitability == 'excellent' and climate_suitability == 'good':
            overall_suitability = 'excellent'
        elif occasion_suitability == 'good' and climate_suitability == 'good':
            overall_suitability = 'good'
        elif occasion_suitability == 'poor' or climate_suitability == 'poor':
            overall_suitability = 'poor'
        else:
            overall_suitability = 'fair'
        
        return {
            'comfort_score': round(comfort_score, 1),
            'breathability': properties['breathability'],
            'softness': properties['softness'],
            'durability': properties['durability'],
            'moisture_wicking': properties['moisture_wicking'],
            'warmth': properties.get('warmth', 50),
            'coolness': properties.get('coolness', 50),
            'skin_sensitivity': properties.get('skin_sensitivity', 'low'),
            'suitability': overall_suitability,
            'occasion_suitability': occasion_suitability,
            'climate_suitability': climate_suitability,
            'best_for': properties.get('best_for', []),
            'care_instructions': properties.get('care', 'Unknown'),
            'shrinkage_risk': properties.get('shrinkage_risk', 'Unknown'),
            'warnings': all_warnings,
            'recommendations': occasion_recommendations
        }
