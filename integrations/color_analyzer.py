"""
Color Analysis Engine
Extracts clothing color from image and analyzes compatibility with skin tone
"""

import cv2
import numpy as np
from loguru import logger
from sklearn.cluster import KMeans


class ColorAnalyzer:
    """
    Analyzes clothing colors and their compatibility with skin tones
    """

    def __init__(self):
        """Initialize color analyzer"""
        # Color compatibility rules based on skin tone
        self.color_compatibility = {
            'light': {
                'excellent': ['Navy', 'Black', 'Burgundy', 'Forest Green', 'Charcoal', 'Deep Purple'],
                'good': ['Royal Blue', 'Teal', 'Maroon', 'Olive', 'Gray'],
                'avoid': ['White', 'Beige', 'Light Yellow', 'Pastel Pink']
            },
            'medium-light': {
                'excellent': ['Navy', 'Burgundy', 'Emerald', 'Teal', 'Charcoal', 'Deep Purple'],
                'good': ['Royal Blue', 'Olive', 'Maroon', 'Gray', 'Black'],
                'avoid': ['Light Yellow', 'Pastel Colors']
            },
            'medium': {
                'excellent': ['Navy', 'Burgundy', 'Emerald', 'Teal', 'Charcoal', 'Deep Purple', 'Black'],
                'good': ['Royal Blue', 'Olive', 'Maroon', 'Gray', 'Rich Brown'],
                'avoid': ['Light Yellow', 'Pastel Colors', 'Neon']
            },
            'medium-dark': {
                'excellent': ['Navy', 'Burgundy', 'Emerald', 'Teal', 'Charcoal', 'Deep Purple', 'Black', 'Rich Brown'],
                'good': ['Royal Blue', 'Olive', 'Maroon', 'Gray', 'Crimson'],
                'avoid': ['Light Colors', 'Pastel Colors']
            },
            'dark': {
                'excellent': ['Navy', 'Burgundy', 'Emerald', 'Teal', 'Charcoal', 'Deep Purple', 'Black', 'Rich Brown', 'Crimson'],
                'good': ['Royal Blue', 'Olive', 'Maroon', 'Gray', 'Deep Red'],
                'avoid': ['Light Colors', 'Pastel Colors', 'Neon']
            }
        }

        # Color name mapping from RGB ranges
        self.color_names = {
            'Navy': {'r': (0, 50), 'g': (0, 50), 'b': (80, 150)},
            'Black': {'r': (0, 30), 'g': (0, 30), 'b': (0, 30)},
            'Burgundy': {'r': (100, 150), 'g': (0, 50), 'b': (0, 50)},
            'Forest Green': {'r': (0, 50), 'g': (80, 120), 'b': (0, 50)},
            'Charcoal': {'r': (50, 80), 'g': (50, 80), 'b': (50, 80)},
            'Deep Purple': {'r': (80, 120), 'g': (0, 50), 'b': (100, 150)},
            'Royal Blue': {'r': (0, 50), 'g': (50, 100), 'b': (150, 200)},
            'Teal': {'r': (0, 50), 'g': (100, 150), 'b': (100, 150)},
            'Maroon': {'r': (100, 150), 'g': (0, 50), 'b': (0, 50)},
            'Olive': {'r': (100, 150), 'g': (120, 180), 'b': (0, 80)},
            'Gray': {'r': (100, 180), 'g': (100, 180), 'b': (100, 180)},
            'Emerald': {'r': (0, 50), 'g': (150, 200), 'b': (50, 100)},
            'Rich Brown': {'r': (100, 150), 'g': (50, 100), 'b': (0, 50)},
            'Crimson': {'r': (150, 200), 'g': (0, 50), 'b': (0, 50)},
            'Deep Red': {'r': (150, 200), 'g': (0, 50), 'b': (0, 50)},
        }

        logger.info("ColorAnalyzer initialized")

    def extract_dominant_colors(self, image: np.ndarray, n_colors: int = 3) -> list[dict]:
        """
        Extract dominant colors from clothing image
        
        Args:
            image: Image as numpy array (BGR format)
            n_colors: Number of dominant colors to extract
        
        Returns:
            List of color dictionaries with RGB values and names
        """
        try:
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # Reshape image to be a list of pixels
            pixels = rgb_image.reshape(-1, 3)

            # Use KMeans to find dominant colors
            kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
            kmeans.fit(pixels)

            # Get cluster centers (dominant colors)
            colors = kmeans.cluster_centers_.astype(int)

            # Get color labels for each pixel
            labels = kmeans.labels_

            # Calculate percentage of each color
            unique, counts = np.unique(labels, return_counts=True)
            percentages = (counts / len(labels)) * 100

            # Create color list with names
            color_list = []
            for i, color in enumerate(colors):
                color_name = self._identify_color_name(color)
                color_list.append({
                    'rgb': {'r': int(color[0]), 'g': int(color[1]), 'b': int(color[2])},
                    'name': color_name,
                    'percentage': round(percentages[i], 1)
                })

            # Sort by percentage (most dominant first)
            color_list.sort(key=lambda x: x['percentage'], reverse=True)

            return color_list

        except Exception as e:
            logger.error(f"Error extracting colors: {e}")
            return [{
                'rgb': {'r': 128, 'g': 128, 'b': 128},
                'name': 'Unknown',
                'percentage': 100
            }]

    def _identify_color_name(self, rgb: np.ndarray) -> str:
        """Identify color name from RGB values"""
        r, g, b = rgb

        best_match = 'Unknown'
        best_score = float('inf')

        for color_name, ranges in self.color_names.items():
            r_min, r_max = ranges['r']
            g_min, g_max = ranges['g']
            b_min, b_max = ranges['b']

            # Calculate distance from color range
            r_dist = min(abs(r - r_min), abs(r - r_max)) if not (r_min <= r <= r_max) else 0
            g_dist = min(abs(g - g_min), abs(g - g_max)) if not (g_min <= g <= g_max) else 0
            b_dist = min(abs(b - b_min), abs(b - b_max)) if not (b_min <= b <= b_max) else 0

            total_dist = r_dist + g_dist + b_dist

            if total_dist < best_score:
                best_score = total_dist
                best_match = color_name

        return best_match

    def analyze_color_compatibility(
        self,
        clothing_colors: list[dict],
        skin_tone: str
    ) -> dict:
        """
        Analyze how well clothing colors match skin tone
        
        Args:
            clothing_colors: List of dominant colors from clothing
            skin_tone: Skin tone category (light, medium-light, medium, medium-dark, dark)
        
        Returns:
            Dictionary with compatibility analysis
        """
        if not clothing_colors:
            return {
                'match_score': 0,
                'compatibility': 'unknown',
                'primary_color': None,
                'recommendation': 'Unable to analyze color compatibility'
            }

        primary_color = clothing_colors[0]  # Most dominant color
        color_name = primary_color['name']

        # Get compatibility rules for this skin tone
        if skin_tone not in self.color_compatibility:
            skin_tone = 'medium'  # Default

        compatibility_rules = self.color_compatibility[skin_tone]

        # Determine compatibility
        if color_name in compatibility_rules['excellent']:
            match_score = 95
            compatibility = 'excellent'
            recommendation = f'{color_name} looks excellent with your skin tone!'
        elif color_name in compatibility_rules['good']:
            match_score = 80
            compatibility = 'good'
            recommendation = f'{color_name} looks good with your skin tone.'
        elif color_name in compatibility_rules['avoid']:
            match_score = 40
            compatibility = 'poor'
            recommendation = f'{color_name} may not complement your skin tone well.'
        else:
            match_score = 65
            compatibility = 'fair'
            recommendation = f'{color_name} is a neutral choice.'

        # Get alternative color suggestions
        alternative_colors = self._get_alternative_colors(skin_tone, color_name)

        return {
            'match_score': match_score,
            'compatibility': compatibility,
            'primary_color': primary_color,
            'all_colors': clothing_colors,
            'recommendation': recommendation,
            'alternative_colors': alternative_colors
        }

    def _get_alternative_colors(self, skin_tone: str, current_color: str) -> list[dict]:
        """Get alternative color suggestions based on skin tone"""
        if skin_tone not in self.color_compatibility:
            skin_tone = 'medium'

        compatibility_rules = self.color_compatibility[skin_tone]

        # Get excellent colors (excluding current)
        excellent_colors = [c for c in compatibility_rules['excellent'] if c != current_color]

        # Get good colors
        good_colors = [c for c in compatibility_rules['good'] if c != current_color]

        # Combine and limit to top 5
        alternatives = (excellent_colors[:3] + good_colors[:2])[:5]

        # Create color swatches with RGB approximations
        color_swatches = []
        for color_name in alternatives:
            # Approximate RGB for display
            if color_name in self.color_names:
                ranges = self.color_names[color_name]
                rgb = {
                    'r': int((ranges['r'][0] + ranges['r'][1]) / 2),
                    'g': int((ranges['g'][0] + ranges['g'][1]) / 2),
                    'b': int((ranges['b'][0] + ranges['b'][1]) / 2)
                }
            else:
                rgb = {'r': 128, 'g': 128, 'b': 128}

            color_swatches.append({
                'name': color_name,
                'rgb': rgb,
                'match_score': 95 if color_name in compatibility_rules['excellent'] else 80
            })

        return color_swatches

