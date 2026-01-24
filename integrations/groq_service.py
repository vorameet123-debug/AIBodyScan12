import os
import json
import base64
import time
from groq import Groq, BadRequestError, RateLimitError
from loguru import logger
from typing import Dict, Any, List, Optional
from functools import wraps
from requests.exceptions import Timeout, RequestException

class GroqServiceError(Exception):
    """Custom exception for Groq service errors"""
    pass

def retry_with_backoff(max_retries: int = 3, base_delay: float = 1.0, timeout: float = 30.0):
    """
    Decorator for retrying API calls with exponential backoff and timeout
    
    Args:
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds for exponential backoff
        timeout: Request timeout in seconds
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    # Add timeout to the kwargs if not present
                    if 'timeout' not in kwargs:
                        kwargs['timeout'] = timeout
                    return func(self, *args, **kwargs)
                except (Timeout, RequestException, Exception) as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)  # Exponential backoff
                        logger.warning(
                            f"Groq API call failed (attempt {attempt + 1}/{max_retries}): {str(e)}. "
                            f"Retrying in {delay:.1f}s..."
                        )
                        time.sleep(delay)
                    else:
                        logger.error(f"Groq API call failed after {max_retries} attempts: {str(e)}")
                        raise GroqServiceError(f"API call failed after {max_retries} attempts: {str(e)}") from e
            
            # Should never reach here, but just in case
            raise GroqServiceError(f"API call failed: {str(last_exception)}") from last_exception
        return wrapper
    return decorator

class GroqService:
    """Wrapper for Groq API (Llama 4) for Vision and Text generation with retry logic and timeout handling."""
    
    def __init__(self, api_key: str, timeout: float = 30.0, max_retries: int = 3):
        self.api_key = api_key
        self.client = Groq(api_key=self.api_key)
        # Primary model: Llama 4 Scout/Maverick for Multimodal (Vision + Text)
        self.model = "meta-llama/llama-4-scout-17b-16e-instruct"
        # Fallback model when rate limits are hit
        self.fallback_model = "openai/gpt-oss-120b"
        self.timeout = timeout
        self.max_retries = max_retries
        logger.info(f"Groq service initialized with primary model: {self.model}, fallback: {self.fallback_model} (timeout: {timeout}s, retries: {max_retries})")

    @retry_with_backoff(max_retries=3, base_delay=1.0, timeout=30.0)
    def analyze_garment_image(self, image_data: bytes, timeout: float = 30.0) -> Dict[str, Any]:
        """
        Analyze garment image using Groq Vision (Llama 4 Scout).
        Extracts type, material, color, style, etc.
        
        Args:
            image_data: Image bytes
            timeout: Request timeout in seconds
            
        Returns:
            Dictionary with garment analysis
            
        Raises:
            GroqServiceError: If API call fails after retries
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

            # Try primary model first
            model_to_use = self.model
            try:
                completion = self.client.chat.completions.create(
                    model=model_to_use,
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
                    response_format={"type": "json_object"},
                    timeout=timeout
                )
            except (BadRequestError, RateLimitError) as e:
                # Check if it's a rate limit error
                if "rate_limit" in str(e).lower() or "429" in str(e) or isinstance(e, RateLimitError):
                    logger.warning(f"Rate limit hit on {model_to_use}, switching to fallback model {self.fallback_model}")
                    model_to_use = self.fallback_model
                    # Retry with fallback model (text-only, no vision)
                    completion = self.client.chat.completions.create(
                        model=model_to_use,
                        messages=[
                            {
                                "role": "user",
                                "content": prompt + "\n\nNote: Image analysis unavailable. Provide generic clothing analysis."
                            }
                        ],
                        temperature=0.1,
                        max_tokens=1024,
                        top_p=1,
                        stream=False,
                        response_format={"type": "json_object"},
                        timeout=timeout
                    )
                else:
                    raise
            
            response_text = completion.choices[0].message.content.strip()
            result = json.loads(response_text)
            logger.debug(f"Groq Vision analysis complete using {model_to_use}: {result.get('garment_type', 'unknown')}")
            return result
            
        except (Timeout, RequestException) as e:
            logger.error(f"Timeout/Network error in Groq Vision analysis: {e}")
            raise GroqServiceError(f"API request timed out after {timeout}s: {str(e)}") from e
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response from Groq: {e}")
            raise GroqServiceError(f"Invalid JSON response from API: {str(e)}") from e
        except Exception as e:
            logger.error(f"Unexpected error in Groq Vision analysis: {e}")
            raise GroqServiceError(f"Unexpected error: {str(e)}") from e
    
    @retry_with_backoff(max_retries=3, base_delay=1.0, timeout=30.0)
    def generate_comprehensive_advice(
        self,
        fit_meters_result: Dict[str, Any],
        garment_analysis: Dict[str, Any],
        occasion: str,
        skin_tone: str,
        user_size: str,
        timeout: float = 30.0
    ) -> Dict[str, Any]:
        """
        Generate comprehensive fit advice using Groq (Fast Text LLM).
        
        Args:
            fit_meters_result: Fit meter calculation results
            garment_analysis: Garment analysis data
            occasion: Occasion for wearing
            skin_tone: User's skin tone
            user_size: User's selected size
            timeout: Request timeout in seconds
            
        Returns:
            Dictionary with comprehensive advice
            
        Raises:
            GroqServiceError: If API call fails after retries
        """
        try:
            # Prepare summary data
            fit_data = fit_meters_result.get('fit_meters', {})
            worst_metric = fit_meters_result.get('worst_metric', 'unknown')
            fit_summary = ", ".join([f"{k}: {v.get('ease',0)}cm ease ({v.get('status','unknown')})" for k,v in fit_data.items()])
            
            # Get worst metric ease value explicitly
            worst_ease = fit_data.get(worst_metric, {}).get('ease', 0) if worst_metric in fit_data else 0
            
            garment_colors = [c.get('name') for c in garment_analysis.get('colors', [])]
            
            # Get list of actual measurements being analyzed
            measured_parts = list(fit_data.keys())
            measured_parts_str = ", ".join(measured_parts)
            
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
1. ONLY mention these measurements: {measured_parts_str}
2. DO NOT mention measurements that are NOT in the list above (e.g., don't mention "chest" for pants!)
3. You MUST use the EXACT ease value provided ({worst_ease}cm) in your roast
4. Be specific about the {worst_metric} measurement issue
5. Make it funny but accurate to the data
6. DO NOT make up different numbers - use {worst_ease}cm

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

            # Try primary model first
            model_to_use = self.model
            try:
                completion = self.client.chat.completions.create(
                    model=model_to_use,
                    messages=[
                        {"role": "system", "content": "You are a JSON-only response bot."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1024,
                    top_p=1,
                    stream=False,
                    response_format={"type": "json_object"},
                    timeout=timeout
                )
            except (BadRequestError, RateLimitError) as e:
                # Check if it's a rate limit error
                if "rate_limit" in str(e).lower() or "429" in str(e) or isinstance(e, RateLimitError):
                    logger.warning(f"Rate limit hit on {model_to_use}, switching to fallback model {self.fallback_model}")
                    model_to_use = self.fallback_model
                    # Retry with fallback model
                    completion = self.client.chat.completions.create(
                        model=model_to_use,
                        messages=[
                            {"role": "system", "content": "You are a JSON-only response bot."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.7,
                        max_tokens=1024,
                        top_p=1,
                        stream=False,
                        response_format={"type": "json_object"},
                        timeout=timeout
                    )
                else:
                    raise
            
            response_text = completion.choices[0].message.content.strip()
            result = json.loads(response_text)
            logger.debug(f"Groq comprehensive advice generated successfully using {model_to_use}")
            return result

        except (Timeout, RequestException) as e:
            logger.error(f"Timeout/Network error generating Groq advice: {e}")
            raise GroqServiceError(f"API request timed out after {timeout}s: {str(e)}") from e
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response from Groq: {e}")
            raise GroqServiceError(f"Invalid JSON response from API: {str(e)}") from e
        except Exception as e:
            logger.error(f"Unexpected error generating Groq advice: {e}")
            raise GroqServiceError(f"Unexpected error: {str(e)}") from e
