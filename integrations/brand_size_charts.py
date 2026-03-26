"""
Brand Size Charts Database
Stores brand-specific size charts and fit characteristics
"""

from loguru import logger


class BrandSizeCharts:
    """
    Database of brand-specific size charts and fit characteristics
    """

    def __init__(self):
        """Initialize brand size charts"""
        self.brand_fits = {
            'nike': {
                'runs': 'small',
                'adjustment_cm': +2,  # Add 2cm to expected measurements
                'description': 'Nike typically runs small - consider sizing up',
                'size_chart': 'standard'  # Uses standard size chart with adjustment
            },
            'zara': {
                'runs': 'large',
                'adjustment_cm': -2,  # Subtract 2cm from expected measurements
                'description': 'Zara typically runs large - consider sizing down',
                'size_chart': 'standard'
            },
            'h&m': {
                'runs': 'small',
                'adjustment_cm': +1,
                'description': 'H&M typically runs small',
                'size_chart': 'standard'
            },
            'adidas': {
                'runs': 'true',
                'adjustment_cm': 0,
                'description': 'Adidas runs true to size',
                'size_chart': 'standard'
            },
            'puma': {
                'runs': 'true',
                'adjustment_cm': 0,
                'description': 'Puma runs true to size',
                'size_chart': 'standard'
            },
            'levi\'s': {
                'runs': 'true',
                'adjustment_cm': 0,
                'description': 'Levi\'s runs true to size',
                'size_chart': 'standard'
            },
            'gap': {
                'runs': 'true',
                'adjustment_cm': 0,
                'description': 'Gap runs true to size',
                'size_chart': 'standard'
            },
            'uniqlo': {
                'runs': 'small',
                'adjustment_cm': +1.5,
                'description': 'Uniqlo typically runs slightly small',
                'size_chart': 'standard'
            },
            'forever 21': {
                'runs': 'small',
                'adjustment_cm': +2,
                'description': 'Forever 21 typically runs small',
                'size_chart': 'standard'
            },
            'old navy': {
                'runs': 'large',
                'adjustment_cm': -1.5,
                'description': 'Old Navy typically runs large',
                'size_chart': 'standard'
            }
        }
        logger.info("BrandSizeCharts initialized")

    def get_brand_fit_info(self, brand: str) -> dict | None:
        """
        Get fit information for a brand
        
        Args:
            brand: Brand name
        
        Returns:
            Dictionary with brand fit information or None if not found
        """
        brand_lower = brand.lower().strip()

        # Try exact match
        if brand_lower in self.brand_fits:
            return self.brand_fits[brand_lower]

        # Try partial match (e.g., "Nike Air" -> "nike")
        for brand_key, fit_info in self.brand_fits.items():
            if brand_key in brand_lower or brand_lower in brand_key:
                return fit_info

        return None

    def get_size_adjustment(self, brand: str) -> float:
        """
        Get size adjustment in cm for a brand
        
        Args:
            brand: Brand name
        
        Returns:
            Size adjustment in cm (positive = runs small, negative = runs large)
        """
        fit_info = self.get_brand_fit_info(brand)
        if fit_info:
            return fit_info.get('adjustment_cm', 0)
        return 0

    def add_brand(self, brand: str, runs: str, adjustment_cm: float, description: str = None):
        """
        Add or update brand fit information
        
        Args:
            brand: Brand name
            runs: How it runs ('small', 'large', 'true')
            adjustment_cm: Size adjustment in cm
            description: Optional description
        """
        brand_lower = brand.lower().strip()
        self.brand_fits[brand_lower] = {
            'runs': runs,
            'adjustment_cm': adjustment_cm,
            'description': description or f'{brand} typically runs {runs}',
            'size_chart': 'standard'
        }
        logger.info(f"Added/updated brand fit info for {brand}")

