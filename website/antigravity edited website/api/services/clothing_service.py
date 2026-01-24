import asyncio
import cv2
import numpy as np
import logging
from typing import Dict, Any, Optional, List
from fastapi import UploadFile

# Import existing analyzers (assuming they are importable, or we will need to refactor app.py imports)
# Ideally, we should move analyzer instantiation out of app.py too, but for now we will 
# accept them as dependencies or import them if possible.

logger = logging.getLogger(__name__)

class ClothingAnalysisService:
    def __init__(
        self,
        page_analyzer,
        fit_analyzer,
        style_analyzer,
        color_analyzer,
        material_analyzer,
        body_type_classifier,
        skin_tone_detector
    ):
        self.page_analyzer = page_analyzer
        self.fit_analyzer = fit_analyzer
        self.style_analyzer = style_analyzer
        self.color_analyzer = color_analyzer
        self.material_analyzer = material_analyzer
        self.body_type_classifier = body_type_classifier
        self.skin_tone_detector = skin_tone_detector

    async def analyze_clothing_fit(
        self,
        product_image_bytes: bytes,
        user_measurements: Dict[str, float],
        user_metadata: Dict[str, Any],
        size: str,
        occasion: str,
        size_system: str = "US",
        user_photo_bytes: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """
        Orchestrates the clothing analysis process with parallel execution.
        """
        
        # 1. Decode Images (CPU bound)
        product_img = self._decode_image(product_image_bytes)
        if product_img is None:
            raise ValueError("Could not decode product image")
            
        user_photo = None
        if user_photo_bytes:
            user_photo = self._decode_image(user_photo_bytes)

        # 2. Extract Product Info (OCR) - Must be done first
        # Run in thread pool to avoid blocking event loop
        logger.info("Starting OCR analysis...")
        product_info = await asyncio.to_thread(self.page_analyzer.analyze_product_page, product_img)
        logger.info(f"Product Info extracted: {product_info}")

        clothing_type = product_info.get('product_type', 'unknown')
        if clothing_type == 'unknown':
            # Fallback or error? For now error as per original logic
            raise ValueError("Could not identify product type from image")
            
        brand = product_info.get('brand', 'Unknown')
        material_text = product_info.get('material', 'Unknown')

        # 3. Parallel Analysis (Fit, Style, Color, Material, Body Type)
        # All these are independent once we have clothing_type
        
        gender = user_metadata.get("gender")
        
        # wrapper for async execution
        async def run_fit():
            return await asyncio.to_thread(
                self.fit_analyzer.analyze_fit,
                user_measurements,
                size,
                clothing_type,
                size_system,
                brand if brand != "Unknown" else None
            )

        async def run_body_type():
            return await asyncio.to_thread(
                self.body_type_classifier.classify,
                user_measurements,
                gender
            )
            
        async def run_color():
            return await asyncio.to_thread(
                self.color_analyzer.extract_dominant_colors,
                product_img
            )
            
        async def run_skin_tone():
            if user_photo is not None:
                return await asyncio.to_thread(
                    self.skin_tone_detector.detect_from_image,
                    user_photo
                )
            return None

        # Execute parallel tasks
        logger.info("Starting parallel analysis tasks...")
        fit_result, body_type_result, clothing_colors, skin_tone_result = await asyncio.gather(
            run_fit(),
            run_body_type(),
            run_color(),
            run_skin_tone()
        )
        
        # 4. Dependent Analysis (Style depends on Body Type)
        style_result = await asyncio.to_thread(
            self.style_analyzer.analyze_style,
            body_type_result['body_type'],
            clothing_type,
            occasion
        )
        
        # 5. Synthesis (Color Analysis depends on skin tone)
        color_analysis = await asyncio.to_thread(
            self.color_analyzer.analyze_color_compatibility,
            clothing_colors,
            skin_tone_result['tone_category'] if skin_tone_result else None
        )
        
        if not skin_tone_result:
            # Default if no user photo
            skin_tone_result = {
                'tone_category': 'medium',
                'description': 'Medium (default)',
                'rgb_values': {'r': 170, 'g': 140, 'b': 120},
                'confidence': 0.5
            }
            
        color_analysis['skin_tone'] = skin_tone_result
        
        # 6. Material Synthesis
        climate = 'Moderate'
        if occasion and occasion.lower() in ['winter', 'cold']:
            climate = 'Cold'
        elif occasion and occasion.lower() in ['summer', 'beach', 'hot']:
            climate = 'Warm'
            
        # Enrich style analysis with body type info (required for response model)
        if body_type_result:
            style_result['body_type'] = body_type_result.get('body_type', 'Unknown')
            style_result['body_type_description'] = body_type_result.get('description', 'Unknown')
            
        material_analysis = await asyncio.to_thread(
            self.material_analyzer.analyze_material,
            material=material_text,
            occasion=occasion,
            climate=climate
        )

        # 7. Generate Response/Recommendation
        # Calculate overall score
        scores = [
            fit_result.get('fit_confidence', 0),
            style_result.get('style_compatibility', 0),
            color_analysis.get('match_score', 0),
            material_analysis.get('comfort_score', 0)
        ]
        overall_score = sum(scores) / len(scores)
        
        rec_text = "Consider"
        if overall_score >= 85:
            rec_text = "Buy"
        elif overall_score < 60:
            rec_text = "Skip"

        response = {
            "success": True,
            "product_info": {
                "detected_type": clothing_type,
                "detected_material": material_text,
                "detected_brand": brand
            },
            "fit_analysis": fit_result,
            "style_analysis": style_result,
            "color_analysis": color_analysis,
            "material_analysis": material_analysis,
            "overall_recommendation": {
                "recommendation": rec_text,
                "overall_score": round(overall_score, 1),
                "breakdown": {
                    "fit": fit_result.get('fit_confidence', 0),
                    "style": style_result.get('style_compatibility', 0),
                    "color": color_analysis.get('match_score', 0),
                    "material": material_analysis.get('comfort_score', 0)
                }
            },
            "alerts": fit_result.get('problem_areas', []) # Simplified alerts
        }
        
        return response

    def _decode_image(self, image_bytes: bytes) -> Optional[np.ndarray]:
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            logger.error(f"Image decoding failed: {e}")
            return None
