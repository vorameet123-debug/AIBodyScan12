"""
Skin Tone Detection
Auto-detects skin tone from user's photo for color compatibility analysis
"""

import cv2
import numpy as np
from loguru import logger


class SkinToneDetector:
    """
    Detects skin tone from user photos using color analysis
    """

    def __init__(self):
        """Initialize skin tone detector"""
        # Skin tone categories with RGB ranges
        self.skin_tone_ranges = {
            'light': {
                'r_range': (200, 255),
                'g_range': (180, 240),
                'b_range': (160, 220),
                'description': 'Light/Fair'
            },
            'medium-light': {
                'r_range': (180, 220),
                'g_range': (150, 200),
                'b_range': (130, 180),
                'description': 'Medium-Light'
            },
            'medium': {
                'r_range': (150, 190),
                'g_range': (120, 170),
                'b_range': (100, 150),
                'description': 'Medium'
            },
            'medium-dark': {
                'r_range': (120, 160),
                'g_range': (90, 140),
                'b_range': (70, 120),
                'description': 'Medium-Dark/Tan'
            },
            'dark': {
                'r_range': (80, 130),
                'g_range': (60, 110),
                'b_range': (40, 90),
                'description': 'Dark'
            }
        }
        logger.info("SkinToneDetector initialized")

    def detect_from_image(self, image: np.ndarray) -> dict:
        """
        Detect skin tone from image
        
        Args:
            image: Image as numpy array (BGR format from OpenCV)
        
        Returns:
            Dictionary with skin tone information
        """
        try:
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # Detect face region (more accurate for skin tone)
            face_region = self._extract_face_region(rgb_image)

            if face_region is None:
                # Fallback: use entire image
                logger.warning("Face detection failed, using entire image")
                face_region = rgb_image

            # Calculate average skin color
            avg_color = self._calculate_average_color(face_region)

            # Classify skin tone
            tone_category = self._classify_skin_tone(avg_color)

            return {
                'tone_category': tone_category,
                'description': self.skin_tone_ranges[tone_category]['description'],
                'rgb_values': {
                    'r': int(avg_color[0]),
                    'g': int(avg_color[1]),
                    'b': int(avg_color[2])
                },
                'confidence': 0.85  # Basic confidence score
            }
        except Exception as e:
            logger.error(f"Error detecting skin tone: {e}")
            return {
                'tone_category': 'medium',
                'description': 'Medium (default)',
                'rgb_values': {'r': 170, 'g': 140, 'b': 120},
                'confidence': 0.5
            }

    def _extract_face_region(self, image: np.ndarray) -> np.ndarray | None:
        """
        Extract face region from image for more accurate skin tone detection
        Uses simple color-based skin detection as fallback
        """
        try:
            # Convert to HSV for better skin detection
            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)

            # Define skin color range in HSV
            # These ranges work for most skin tones
            lower_skin = np.array([0, 20, 70], dtype=np.uint8)
            upper_skin = np.array([20, 255, 255], dtype=np.uint8)

            # Create mask for skin-colored pixels
            mask = cv2.inRange(hsv, lower_skin, upper_skin)

            # Apply morphological operations to clean up mask
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

            # Find largest contour (likely face/body)
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            if contours:
                # Get largest contour
                largest_contour = max(contours, key=cv2.contourArea)

                # Get bounding box
                x, y, w, h = cv2.boundingRect(largest_contour)

                # Extract region (with some padding)
                padding = 10
                x = max(0, x - padding)
                y = max(0, y - padding)
                w = min(image.shape[1] - x, w + 2 * padding)
                h = min(image.shape[0] - y, h + 2 * padding)

                # Extract face/body region
                region = image[y:y+h, x:x+w]

                # Only use if region is reasonably sized
                if region.size > 1000:  # At least some pixels
                    return region

            # Fallback: use center region of image
            h, w = image.shape[:2]
            center_region = image[h//4:3*h//4, w//4:3*w//4]
            return center_region

        except Exception as e:
            logger.warning(f"Error extracting face region: {e}")
            return None

    def _calculate_average_color(self, image: np.ndarray) -> tuple[float, float, float]:
        """Calculate average RGB color of image region"""
        # Reshape to list of pixels
        pixels = image.reshape(-1, 3)

        # Calculate mean for each channel
        avg_r = np.mean(pixels[:, 0])
        avg_g = np.mean(pixels[:, 1])
        avg_b = np.mean(pixels[:, 2])

        return (avg_r, avg_g, avg_b)

    def _classify_skin_tone(self, rgb: tuple[float, float, float]) -> str:
        """
        Classify skin tone based on RGB values
        
        Args:
            rgb: Tuple of (R, G, B) values
        
        Returns:
            Skin tone category string
        """
        r, g, b = rgb

        # Calculate scores for each category
        scores = {}

        for category, ranges in self.skin_tone_ranges.items():
            r_min, r_max = ranges['r_range']
            g_min, g_max = ranges['g_range']
            b_min, b_max = ranges['b_range']

            # Calculate how well RGB values fit in this range
            r_score = 1.0 if r_min <= r <= r_max else max(0, 1 - abs(r - (r_min + r_max)/2) / 50)
            g_score = 1.0 if g_min <= g <= g_max else max(0, 1 - abs(g - (g_min + g_max)/2) / 50)
            b_score = 1.0 if b_min <= b <= b_max else max(0, 1 - abs(b - (b_min + b_max)/2) / 50)

            # Average score
            scores[category] = (r_score + g_score + b_score) / 3

        # Return category with highest score
        best_category = max(scores, key=scores.get)
        return best_category

