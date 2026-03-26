"""
Comprehensive Sizing Charts for Accurate Fit Analysis
Contains real-world sizing data for various garment categories
"""
from typing import Any

# Fit type adjustments (in cm)
# Applied to girth measurements (chest, waist, hip)
FIT_TYPE_ADJUSTMENTS = {
    'slim': 0,      # Use chart as-is (slim fit)
    'regular': 2,   # Add 2cm to girths (regular fit)
    'loose': 4      # Add 4cm to girths (loose/relaxed fit)
}

# Men's Slim Fit Shirt Sizing
MENS_SHIRT_SLIM = {
    'XS': {'chest': 85, 'waist': 78.5, 'shoulder': 40.5, 'sleeve_length': 59.5, 'length': 67, 'neck': 37},
    'S': {'chest': 92, 'waist': 86, 'shoulder': 42.5, 'sleeve_length': 61.5, 'length': 69, 'neck': 38},
    'M': {'chest': 98, 'waist': 92.5, 'shoulder': 44.5, 'sleeve_length': 63.5, 'length': 71, 'neck': 40},
    'L': {'chest': 104, 'waist': 99.5, 'shoulder': 46.5, 'sleeve_length': 65.5, 'length': 74, 'neck': 42},
    'XL': {'chest': 110, 'waist': 106.5, 'shoulder': 48.5, 'sleeve_length': 67.5, 'length': 77, 'neck': 44},
    'XXL': {'chest': 116, 'waist': 113.5, 'shoulder': 50.5, 'sleeve_length': 68.5, 'length': 80, 'neck': 46},
    'XXXL': {'chest': 122, 'waist': 120.5, 'shoulder': 52.5, 'sleeve_length': 70.5, 'length': 83, 'neck': 48},
}

# Men's Pants Sizing
MENS_PANTS = {
    'XS': {'waist': 80, 'hip': 90, 'thigh': 42, 'outseam': 95},
    'S': {'waist': 86, 'hip': 96, 'thigh': 47, 'outseam': 98},
    'M': {'waist': 92, 'hip': 102, 'thigh': 52, 'outseam': 101},
    'L': {'waist': 98, 'hip': 108, 'thigh': 57, 'outseam': 104},
    'XL': {'waist': 104, 'hip': 114, 'thigh': 62, 'outseam': 107},
    'XXL': {'waist': 110, 'hip': 120, 'thigh': 67, 'outseam': 110},
    'XXXL': {'waist': 116, 'hip': 126, 'thigh': 72, 'outseam': 113},
}

# Men's Jacket Sizing
MENS_JACKET = {
    'XS': {'chest': 93.5, 'shoulder': 41.5, 'sleeve_length': 60.5, 'length': 65.5, 'waist': 83.5},
    'S': {'chest': 100.5, 'shoulder': 43.5, 'sleeve_length': 62.5, 'length': 68.5, 'waist': 90.5},
    'M': {'chest': 107.5, 'shoulder': 46, 'sleeve_length': 64.5, 'length': 71.5, 'waist': 97.5},
    'L': {'chest': 114.5, 'shoulder': 49, 'sleeve_length': 66.5, 'length': 74.5, 'waist': 104.5},
    'XL': {'chest': 121.5, 'shoulder': 52, 'sleeve_length': 68.5, 'length': 77.5, 'waist': 111.5},
    'XXL': {'chest': 128.5, 'shoulder': 55, 'sleeve_length': 70.5, 'length': 80.5, 'waist': 118.5},
    'XXXL': {'chest': 135.5, 'shoulder': 58, 'sleeve_length': 72.5, 'length': 83.5, 'waist': 125.5},
}

# Men's Ethnic Wear (Kurta)
MENS_KURTA = {
    'S': {'chest': 92.5, 'waist': 90, 'hip': 94, 'shoulder': 42.5, 'length': 97.5},
    'M': {'chest': 102.5, 'waist': 97.5, 'hip': 104, 'shoulder': 45.5, 'length': 107.5},
    'L': {'chest': 112.5, 'waist': 107.5, 'hip': 114, 'shoulder': 48.5, 'length': 112.5},
}

# Women's Tops and Blouses
WOMENS_TOPS = {
    'XS': {'chest': 80, 'waist': 62, 'shoulder': 34.5, 'length': 57},
    'S': {'chest': 86, 'waist': 68, 'shoulder': 36.5, 'length': 59},
    'M': {'chest': 92, 'waist': 74, 'shoulder': 38.5, 'length': 62},
    'L': {'chest': 98, 'waist': 80, 'shoulder': 40.5, 'length': 65},
    'XL': {'chest': 106, 'waist': 86, 'shoulder': 42.5, 'length': 67},
    'XXL': {'chest': 114, 'waist': 94, 'shoulder': 44.5, 'length': 69},
    'XXXL': {'chest': 122, 'waist': 102, 'shoulder': 46.5, 'length': 71},
}

# Women's Bottom Wear (Pants/Jeans)
WOMENS_BOTTOMS = {
    'XS': {'waist': 64, 'hip': 88, 'thigh': 47.5, 'outseam': 95},
    'S': {'waist': 70, 'hip': 94, 'thigh': 51.5, 'outseam': 97},
    'M': {'waist': 76, 'hip': 100, 'thigh': 55.5, 'outseam': 99},
    'L': {'waist': 82, 'hip': 106, 'thigh': 59.5, 'outseam': 101},
    'XL': {'waist': 88, 'hip': 112, 'thigh': 63.5, 'outseam': 103},
    'XXL': {'waist': 94, 'hip': 118, 'thigh': 67.5, 'outseam': 105},
    'XXXL': {'waist': 100, 'hip': 124, 'thigh': 71.5, 'outseam': 107},
}

# Women's Maxi Dresses
WOMENS_MAXI = {
    'XS': {'chest': 82, 'waist': 64, 'hip': 90, 'shoulder': 35.5, 'length': 133.5},
    'S': {'chest': 88, 'waist': 70, 'hip': 96, 'shoulder': 37.5, 'length': 137.5},
    'M': {'chest': 94, 'waist': 76, 'hip': 102, 'shoulder': 39.5, 'length': 141.5},
    'L': {'chest': 101, 'waist': 83, 'hip': 109, 'shoulder': 41.5, 'length': 145.5},
    'XL': {'chest': 109, 'waist': 91, 'hip': 117, 'shoulder': 43.5, 'length': 149.5},
    'XXL': {'chest': 117, 'waist': 99, 'hip': 125, 'shoulder': 45.5, 'length': 153.5},
}

# Saree Blouse
SAREE_BLOUSE = {
    'XS': {'chest': 82.5, 'below_bust': 69.5, 'shoulder': 34.5, 'armhole': 37, 'front_neck_depth': 18.5},
    'S': {'chest': 87.5, 'below_bust': 74.5, 'shoulder': 35.5, 'armhole': 40, 'front_neck_depth': 19.5},
    'M': {'chest': 93, 'below_bust': 80, 'shoulder': 37.5, 'armhole': 43, 'front_neck_depth': 20.5},
    'L': {'chest': 99.5, 'below_bust': 86, 'shoulder': 39.5, 'armhole': 46, 'front_neck_depth': 21.5},
    'XL': {'chest': 106.5, 'below_bust': 92.5, 'shoulder': 41.5, 'armhole': 49, 'front_neck_depth': 22.5},
}

# Salwar Kameez / Kurtis
SALWAR_KAMEEZ = {
    'XS': {'chest': 86, 'waist': 79.5, 'hip': 93, 'shoulder': 35.5, 'length': 97.5},
    'S': {'chest': 92, 'waist': 85.5, 'hip': 99, 'shoulder': 36.5, 'length': 102.5},
    'M': {'chest': 98, 'waist': 92, 'hip': 105, 'shoulder': 38.5, 'length': 107.5},
    'L': {'chest': 104, 'waist': 98, 'hip': 111, 'shoulder': 40.5, 'length': 112.5},
    'XL': {'chest': 110, 'waist': 104, 'hip': 117, 'shoulder': 42.5, 'length': 117.5},
}

# Master sizing chart mapping
SIZING_CHARTS = {
    # Men's wear
    'shirt': MENS_SHIRT_SLIM,
    't-shirt': MENS_SHIRT_SLIM,  # Use shirt sizing
    'pants': MENS_PANTS,
    'jeans': MENS_PANTS,
    'trousers': MENS_PANTS,
    'jacket': MENS_JACKET,
    'blazer': MENS_JACKET,
    'coat': MENS_JACKET,
    'kurta': MENS_KURTA,

    # Women's wear
    'top': WOMENS_TOPS,
    'blouse': WOMENS_TOPS,
    'tunic': WOMENS_TOPS,
    'dress': WOMENS_MAXI,  # Use maxi for general dresses
    'maxi': WOMENS_MAXI,
    'palazzo': WOMENS_BOTTOMS,
    'leggings': WOMENS_BOTTOMS,
    'skirt': WOMENS_BOTTOMS,

    # Ethnic wear
    'saree blouse': SAREE_BLOUSE,
    'salwar': SALWAR_KAMEEZ,
    'kameez': SALWAR_KAMEEZ,
    'kurti': SALWAR_KAMEEZ,
}

# Special garment handling flags
SPECIAL_GARMENTS = {
    'leggings': {
        'negative_ease': True,
        'recommended_ease': -6,  # Should be 6cm smaller
        'warning': "For leggings, choose a size where the garment is 5-8cm smaller than your measurements!"
    },
    'palazzo': {
        'length_critical': True,
        'min_height_for_100cm': 165,
        'warning': "Unless you're wearing 4-inch heels, these will drag on the floor!"
    },
    'jeans': {
        'hip_gap_check': True,
        'hip_waist_ratio_threshold': 1.15,
        'warning': "Hip-gap alert! You'll need a belt or look for 'Curvy Fit' jeans!"
    }
}


def get_sizing_chart(garment_type: str) -> dict[str, dict[str, float]]:
    """
    Get the appropriate sizing chart for a garment type
    
    Args:
        garment_type: Type of garment (e.g., 'shirt', 'pants', 'dress')
        
    Returns:
        Dictionary of size -> measurements
    """
    garment_key = garment_type.lower().strip()

    # Try exact match first
    if garment_key in SIZING_CHARTS:
        return SIZING_CHARTS[garment_key]

    # Try partial match
    for key in SIZING_CHARTS:
        if key in garment_key or garment_key in key:
            return SIZING_CHARTS[key]

    # Default to shirt for tops, pants for bottoms
    if any(word in garment_key for word in ['top', 'shirt', 'blouse', 'tunic']):
        return WOMENS_TOPS if 'women' in garment_key else MENS_SHIRT_SLIM
    elif any(word in garment_key for word in ['pant', 'jean', 'trouser', 'bottom']):
        return WOMENS_BOTTOMS if 'women' in garment_key else MENS_PANTS

    # Ultimate fallback
    return MENS_SHIRT_SLIM


def apply_fit_adjustment(measurements: dict[str, float], fit_type: str) -> dict[str, float]:
    """
    Apply fit type adjustments to garment measurements
    
    Args:
        measurements: Base measurements from sizing chart
        fit_type: 'slim', 'regular', or 'loose'
        
    Returns:
        Adjusted measurements
    """
    adjustment = FIT_TYPE_ADJUSTMENTS.get(fit_type.lower(), 0)

    if adjustment == 0:
        return measurements

    adjusted = measurements.copy()

    # Apply adjustment to girth measurements only
    girth_keys = ['chest', 'waist', 'hip', 'thigh']
    for key in girth_keys:
        if key in adjusted:
            adjusted[key] += adjustment

    return adjusted


def get_special_garment_info(garment_type: str) -> dict[str, Any]:
    """
    Get special handling information for specific garment types
    
    Args:
        garment_type: Type of garment
        
    Returns:
        Dictionary with special handling flags and warnings
    """
    garment_key = garment_type.lower().strip()

    for special_type, info in SPECIAL_GARMENTS.items():
        if special_type in garment_key:
            return info

    return {}

