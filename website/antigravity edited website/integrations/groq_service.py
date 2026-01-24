import os
import json
import base64
from groq import Groq
from loguru import logger
from typing import Dict, Any, List

class GroqService:
    """Wrapper for Groq API (Llama 4) for Vision and Text generation."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = Groq(api_key=self.api_key)
        # Using Llama 4 Scout/Maverick for Multimodal (Vision + Text)
        self.model = "meta-llama/llama-4-scout-17b-16e-instruct"
        logger.info(f"Groq service initialized with multimodal model: {self.model}")

    def analyze_garment_image(self, image_data: bytes) -> Dict[str, Any]:
        """
        Analyze garment image using Groq Vision (Llama 4 Scout).
        Extracts type, material, color, style, etc.
        """
        try:
            # Convert bytes to base64
            base64_image = base64.b64encode(image_data).decode('utf-8')
            data_url = f"data:image/jpeg;base64,{base64_image}"

            prompt = """Analyze the clothing item in this image. Provide a detailed analysis in JSON format.
Focus on:
1. garment_type: Generic category (e.g., "shirt", "pants", "dress")
2. material: Fabric appearance (e.g., "cotton", "denim", "silk")
3. colors: List of dominant colors with [R,G,B] and percentage. [{"rgb": [255,0,0], "name": "red", "percentage": 80}]
4. style: Style description (e.g., "casual", "formal")
5. pattern: Pattern (e.g., "solid", "striped")
6. fit_type: Fit (e.g., "slim", "regular")
7. formality_level: 1-10

Output JSON ONLY. No markdown blocks."""

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": data_url}}
                        ]
                    }
                ],
                temperature=0.1,
                max_tokens=1024,
                top_p=1,
                stream=False,
                response_format={"type": "json_object"}
            )
            
            response_text = completion.choices[0].message.content.strip()
            result = json.loads(response_text)
            logger.info(f"Groq Vision analysis complete: {result.get('garment_type', 'unknown')}")
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing garment with Groq Vision: {e}")
            # Fallback
            return {
                "garment_type": "clothing",
                "material": "fabric",
                "colors": [{"rgb": [128, 128, 128], "name": "gray", "percentage": 100}],
                "style": "casual",
                "pattern": "solid",
                "fit_type": "regular",
                "formality_level": 5
            }
    
    def generate_comprehensive_advice(
        self,
        fit_meters_result: Dict[str, Any],
        garment_analysis: Dict[str, Any],
        occasion: str,
        skin_tone: str,
        user_size: str
    ) -> Dict[str, Any]:
        """
        Generate comprehensive fit advice using Groq (Fast Text LLM).
        """
        try:
            # Prepare summary data
            fit_data = fit_meters_result.get('fit_meters', {})
            worst_metric = fit_meters_result.get('worst_metric', 'unknown')
            fit_summary = ", ".join([f"{k}: {v.get('ease',0)}cm ease ({v.get('status','unknown')})" for k,v in fit_data.items()])
            
            # Get worst metric ease value explicitly
            worst_ease = fit_data.get(worst_metric, {}).get('ease', 0) if worst_metric in fit_data else 0
            
            garment_colors = [c.get('name') for c in garment_analysis.get('colors', [])]
            
            prompt = f"""You are a savage but helpful fashion AI. Analyze this fit data and provide a comprehensive report in JSON.

INPUT DATA:
- Garment: {garment_analysis.get('garment_type', 'clothing')} ({garment_analysis.get('style', 'casual')}, {garment_analysis.get('material', 'fabric')})
- Colors: {garment_colors}
- User Size: {user_size}
- Fit Summary: {fit_summary}
- Worst Issue: {worst_metric} with {worst_ease}cm ease
- Occasion: {occasion}
- Skin Tone: {skin_tone}

CRITICAL RULES FOR FIT ROAST:
1. You MUST use the EXACT ease value provided ({worst_ease}cm) in your roast
2. Be specific about the {worst_metric} measurement issue
3. Make it funny but accurate to the data
4. DO NOT make up different numbers - use {worst_ease}cm

TASK:
1. Generate a 'Fit Roast' (funny, savage, MUST mention the exact {worst_ease}cm ease value for {worst_metric})
2. Generate a 'Verdict Stamp' (short, punchy, e.g. "BUTTON POP RISK", "TENT MODE", "PERFECT MATCH")
3. Generate a 'Color Roast' (assess compatibility with {skin_tone} skin)
4. Suggest 'Outfit Pairings' (3-4 items)
5. Analyze 'Occasion' appropriateness ({occasion})

RESPONSE FORMAT (JSON ONLY):
{{
    "roast": {{
        "fit_roast": "string (2-3 sentences, MUST include {worst_ease}cm)",
        "verdict_stamp": "string (2-3 words, uppercase)",
        "stamp_color": "red or blue or green"
    }},
    "color_analysis": {{
        "match_score": 85,
        "roast": "string",
        "suggested_colors": ["color1", "color2"]
    }},
    "style_recommendations": {{
        "outfit_suggestions": ["item1", "item2"],
        "style_score": 85
    }},
    "occasion_analysis": {{
        "occasion_match_score": 90,
        "is_appropriate": true,
        "recommendation": "string",
        "alternative_occasions": ["occ1", "occ2"]
    }}
}}
"""

            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a JSON-only response bot."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1024,
                top_p=1,
                stream=False,
                response_format={"type": "json_object"}
            )
            
            response_text = completion.choices[0].message.content.strip()
            result = json.loads(response_text)
            logger.info("Groq comprehensive advice generated successfully")
            return result

        except Exception as e:
            logger.error(f"Error generating Groq advice: {e}")
            return {}
