"""
Gemini AI Service Wrapper
Provides AI-powered analysis for garment images and generates roasts/recommendations
"""
import io
import json
import os
from typing import Any

import google.generativeai as genai
from loguru import logger
from PIL import Image


class GeminiService:
    """Wrapper for Google Gemini 1.5 Flash API"""

    def __init__(self, api_key: str | None = None):
        """
        Initialize Gemini service with multiple keys for failover
        
        Args:
            api_key: Optional specific API key to prioritize
        """
        # List of available keys (Primary + Fallback)
        self.api_keys = [
            os.getenv("GEMINI_API_KEY", "AIzaSyD0CFD1RTpXtIKDR7CIcZTfSL1eWUneNBo"),
            "AIzaSyAEWtEN_g9VrktZyPdc8ryiHWLaFPedyew"
        ]

        if api_key:
            self.api_keys.insert(0, api_key) # Prioritize passed key

        # Remove duplicates
        self.api_keys = list(dict.fromkeys(self.api_keys))

        self.current_key_index = 0
        self._configure_active_key()

    def _configure_active_key(self):
        """Configure the active API key and refresh models"""
        key = self.api_keys[self.current_key_index]
        genai.configure(api_key=key)

        # Initialize models
        self.vision_model = genai.GenerativeModel('gemini-2.5-flash-lite')
        self.text_model = genai.GenerativeModel('gemini-2.5-flash-lite')

        masked_key = key[:5] + "..." + key[-5:]
        logger.info(f"Gemini service initialized with key index {self.current_key_index} ({masked_key})")

    def _rotate_key(self) -> bool:
        """Switch to next key. Returns True if successful, False if all keys exhausted."""
        if self.current_key_index + 1 < len(self.api_keys):
            self.current_key_index += 1
            logger.warning(f"Rotating API Key due to error. Switching to index {self.current_key_index}")
            self._configure_active_key()
            return True
        logger.error("All API keys exhausted.")
        return False

    def _generate_content_safe(self, model, content):
        """Execute generation with automatic key rotation on 429/quota errors"""
        attempts = 0
        max_attempts = len(self.api_keys)

        while attempts < max_attempts:
            try:
                return model.generate_content(content)
            except Exception as e:
                error_str = str(e).lower()
                if "429" in error_str or "quota" in error_str or "resource exhausted" in error_str:
                    logger.warning(f"Quota exceeded on key index {self.current_key_index}. Attempting rotation...")
                    if self._rotate_key():
                        attempts += 1
                        continue
                # If not quota error, or rotation failed, raise
                raise e
        raise Exception("All API keys exhausted quota limits.")

    def analyze_garment_image(self, image_data: bytes) -> dict[str, Any]:
        """
        Analyze garment image to extract type, material, color, style, and pattern
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary with garment analysis
        """
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))

            prompt = """Analyze this clothing/garment image and provide detailed information in JSON format.

Extract the following information:
1. garment_type: What type of clothing is this? (e.g., "shirt", "t-shirt", "pants", "dress", "jacket")
2. material: What material does it appear to be made of? (e.g., "cotton", "denim", "polyester", "silk", "wool")
3. colors: List of colors with RGB values and percentage. Format: [{"rgb": [R, G, B], "name": "color_name", "percentage": 80}]
4. style: What's the style? (e.g., "casual button-down", "formal dress shirt", "streetwear hoodie", "business casual")
5. pattern: What pattern does it have? (e.g., "solid", "checkered", "striped", "floral", "polka dot", "plaid")
6. fit_type: What fit does it appear to be? (e.g., "regular fit", "slim fit", "oversized", "tailored")
7. formality_level: Rate formality 1-10 (1=very casual, 10=very formal)

Respond ONLY with valid JSON, no additional text.

Example response:
{
    "garment_type": "shirt",
    "material": "cotton",
    "colors": [
        {"rgb": [45, 120, 200], "name": "blue", "percentage": 70},
        {"rgb": [255, 255, 255], "name": "white", "percentage": 30}
    ],
    "style": "casual button-down",
    "pattern": "checkered",
    "fit_type": "regular fit",
    "formality_level": 4
}"""

            response = self._generate_content_safe(self.vision_model, [prompt, image])

            # Parse JSON response
            response_text = response.text.strip()
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            result = json.loads(response_text.strip())

            logger.info(f"Garment analysis FULL RESULT: {json.dumps(result)}")
            logger.info(f"Garment analysis complete: {result.get('garment_type', 'unknown')}")
            return result

        except Exception as e:
            logger.error(f"Error analyzing garment image: {e}")
            # Return default values on error
            return {
                "garment_type": "unknown",
                "material": "unknown",
                "colors": [{"rgb": [128, 128, 128], "name": "gray", "percentage": 100}],
                "style": "casual",
                "pattern": "solid",
                "fit_type": "regular fit",
                "formality_level": 5
            }

    def generate_fit_roast(self, fit_data: dict[str, Any], worst_metric: str) -> dict[str, str]:
        """
        Generate humorous roast based on fit issues
        
        Args:
            fit_data: Dictionary with fit meter data
            worst_metric: The worst-performing measurement (e.g., "waist")
            
        Returns:
            Dictionary with roast text and verdict stamp
        """
        try:
            metric_info = fit_data.get(worst_metric, {})
            ease = metric_info.get('ease', 0)
            zone = metric_info.get('zone', 'unknown')
            user_measurement = metric_info.get('user_measurement', 0)
            garment_measurement = metric_info.get('garment_measurement', 0)

            prompt = f"""Generate a HILARIOUS, SAVAGE but FRIENDLY roast for someone trying on clothes.

Context:
- Body part: {worst_metric}
- User's {worst_metric}: {user_measurement}cm
- Garment's {worst_metric}: {garment_measurement}cm
- Ease (difference): {ease}cm
- Fit zone: {zone} (green=perfect, red=too tight, blue=too loose)

CRITICAL RULES:
1. Generate 2-3 sentences (40-80 words)
2. Be SPECIFIC about the measurements and ease
3. Use VIVID, RELATABLE comparisons (food, everyday situations, pop culture)
4. Mention SPECIFIC RISKS or consequences
5. Be SAVAGE but FRIENDLY - make them laugh while being honest
6. Include the EXACT ease measurement in your roast
7. Make it conversational like talking to a friend

EXAMPLES TO MATCH THIS STYLE:

For TIGHT fit (red zone):
"Your {worst_metric} meter is hitting the Red Zone harder than a Ferrari. You have {ease}cm of breathing room. If you eat one (1) single french fry, this button pops. Size up, or prepare to hold your breath for 4 hours."

For LOOSE fit (blue zone):
"Bro, you've got {ease}cm of extra space around your {worst_metric}. That's not a shirt, that's a parachute. You could smuggle a whole pizza under there and nobody would notice. Maybe try a size down unless you're going for that 'borrowed from dad' aesthetic."

For PERFECT fit (green zone):
"Chef's kiss! Your {worst_metric} has {ease}cm of ease - that's the Goldilocks zone. Not too tight, not too loose. You can breathe, move, AND look good. This is what the fit gods intended. Buy it before someone else does!"

Now generate a roast in this EXACT style and length for the current fit:"""

            # Configure safety settings to prevent truncation of "savage" roasts
            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_NONE"
                }
            ]

            response = self.text_model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.95,  # Very high creativity for humor
                    top_p=0.98,
                    top_k=50,
                    max_output_tokens=300
                ),
                safety_settings=safety_settings
            )

            roast_text = response.text.strip()

            # Debug: Log the full roast text
            logger.info(f"Generated roast text (length: {len(roast_text)}): {roast_text}")

            # Determine verdict stamp
            if zone == 'green':
                verdict = "PERFECT FIT"
                stamp_color = "green"
            elif zone == 'red':
                verdict = "BUTTON POP RISK"
                stamp_color = "red"
            else:  # blue zone
                verdict = "TENT MODE"
                stamp_color = "blue"

            logger.info(f"Generated fit roast for {worst_metric}")

            return {
                "fit_roast": roast_text,
                "verdict_stamp": verdict,
                "stamp_color": stamp_color
            }

        except Exception as e:
            logger.error(f"Error generating fit roast: {e}")
            return {
                "fit_roast": "The fit gods are mysterious today. Try it on and see!",
                "verdict_stamp": "TRY IT ON",
                "stamp_color": "gray"
            }

    def generate_color_roast(self, skin_tone: str, garment_color: str, match_score: float) -> str:
        """
        Generate funny commentary on color matching
        
        Args:
            skin_tone: User's skin tone category
            garment_color: Primary garment color name
            match_score: Color match score (0-100)
            
        Returns:
            Humorous color commentary
        """
        try:
            prompt = f"""Generate a SHORT, FUNNY comment about this color combination.

Context:
- Skin tone: {skin_tone}
- Garment color: {garment_color}
- Match score: {match_score}/100

Rules:
1. Keep it under 50 words
2. Be playful and relatable
3. If score > 75, give a fun compliment
4. If score < 60, suggest it might not be the best choice (but keep it light)
5. Use creative comparisons

Examples:
- "Blue on you? Chef's kiss! You'll look like the main character."
- "That yellow might make you look like a highlighter. Not bad if you want to be SEEN."
- "Red is bold, and you can pull it off... if you're ready for all the attention."

Generate the comment now:"""

            response = self.text_model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.85,
                    max_output_tokens=100
                )
            )

            return response.text.strip()

        except Exception as e:
            logger.error(f"Error generating color roast: {e}")
            return f"{garment_color.capitalize()} looks good on most people!"

    def suggest_outfit_pairing(
        self,
        garment_type: str,
        color: str,
        style: str,
        occasion: str
    ) -> list[str]:
        """
        Suggest outfit pairings using AI
        
        Args:
            garment_type: Type of garment
            color: Primary color
            style: Style category
            occasion: Occasion for wearing
            
        Returns:
            List of outfit suggestions
        """
        try:
            prompt = f"""Suggest 3 complete outfit pairings for this item.

Item details:
- Type: {garment_type}
- Color: {color}
- Style: {style}
- Occasion: {occasion}

Rules:
1. Each suggestion should be specific and actionable
2. Include bottoms, shoes, and accessories
3. Keep each suggestion under 30 words
4. Make them trendy and practical
5. Consider the occasion

Format as a JSON array of strings.

Example:
["Pair with dark wash jeans, white sneakers, and a leather watch for effortless casual vibes", "Match with black chinos, brown loafers, and a minimalist belt for smart-casual", "Style with grey joggers and white trainers for a relaxed weekend look"]

Generate now:"""

            response = self.text_model.generate_content(prompt)

            # Parse JSON response
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            suggestions = json.loads(response_text.strip())

            logger.info(f"Generated {len(suggestions)} outfit suggestions")
            return suggestions

        except Exception as e:
            logger.error(f"Error generating outfit suggestions: {e}")
            return [
                f"Pair this {garment_type} with complementary pieces for a complete look",
                f"Style with neutral colors to let the {color} stand out",
                f"Keep it simple and let the {garment_type} be the statement piece"
            ]

    def analyze_occasion_fit(
        self,
        garment_type: str,
        style: str,
        formality_level: int,
        occasion: str
    ) -> dict[str, Any]:
        """
        Analyze if garment suits the occasion
        
        Args:
            garment_type: Type of garment
            style: Style category
            formality_level: Formality rating 1-10
            occasion: Target occasion
            
        Returns:
            Dictionary with occasion analysis
        """
        try:
            prompt = f"""Analyze if this clothing item suits the occasion.

Item:
- Type: {garment_type}
- Style: {style}
- Formality level: {formality_level}/10

Occasion: {occasion}

Provide analysis in JSON format:
{{
    "occasion_match_score": 85,  // 0-100
    "is_appropriate": true,
    "recommendation": "Short, fun recommendation",
    "alternative_occasions": ["occasion1", "occasion2"]
}}

Be honest but encouraging. If it's not perfect, suggest when it WOULD work.

Generate now:"""

            response = self.text_model.generate_content(prompt)

            # Parse JSON response
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            result = json.loads(response_text.strip())

            logger.info(f"Occasion analysis complete: {result.get('occasion_match_score', 0)}/100")
            return result

        except Exception as e:
            logger.error(f"Error analyzing occasion fit: {e}")
            return {
                "occasion_match_score": 70,
                "is_appropriate": True,
                "recommendation": f"This {garment_type} works for {occasion}!",
                "alternative_occasions": ["casual outings", "everyday wear"]
            }

    def generate_comprehensive_advice(
        self,
        fit_meters_result: dict[str, Any],
        garment_analysis: dict[str, Any],
        occasion: str,
        skin_tone: str,
        user_size: str
    ) -> dict[str, Any]:
        """
        Generate comprehensive fit advice in a single call to save API quota.
        Merges functionality of: Fit Roast, Color Roast, Style Recs, Occasion Analysis.
        """
        try:
            # Prepare summary data
            fit_data = fit_meters_result.get('fit_meters', {})
            worst_metric = fit_meters_result.get('worst_metric', 'unknown')
            fit_summary = ", ".join([f"{k}: {v.get('ease',0)}cm ease ({v.get('status','unknown')})" for k,v in fit_data.items()])

            garment_colors = [c.get('name') for c in garment_analysis.get('colors', [])]

            prompt = f"""You are a savage but helpful fashion AI. Analyze this fit data and provide a comprehensive report in JSON.

INPUT DATA:
- Garment: {garment_analysis.get('garment_type', 'clothing')} ({garment_analysis.get('style', 'casual')}, {garment_analysis.get('material', 'fabric')})
- Colors: {garment_colors}
- User Size: {user_size}
- Fit Summary: {fit_summary}
- Worst Issue: {worst_metric}
- Occasion: {occasion}
- Skin Tone: {skin_tone}

TASK:
1. Generate a 'Fit Roast' (funny, savage, specific to the worst fit issue of {worst_metric}). mention the ease value if relevant.
2. Generate a 'Verdict Stamp' (short, punchy, e.g. "BUTTON POP RISK", "TENT MODE", "PERFECT MATCH").
3. Generate a 'Color Roast' (assess compatibility with {skin_tone} skin).
4. Suggest 'Outfit Pairings' (3-4 items).
5. Analyze 'Occasion' appropriateness ({occasion}).

RESPONSE FORMAT (JSON ONLY):
{{
    "roast": {{
        "fit_roast": "string (2-3 sentences)",
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

            response = self._generate_content_safe(self.text_model, prompt)

            # Parse JSON
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            result = json.loads(response_text.strip())
            logger.info("Comprehensive advice generated successfully")
            return result

        except Exception as e:
            logger.error(f"Error generating comprehensive advice: {e}")
            # Return minimal default structure
            return {}

