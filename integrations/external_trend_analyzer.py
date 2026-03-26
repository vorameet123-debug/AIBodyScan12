"""
External Trend Analyzer using Groq API
Analyzes fashion trends from external sources using AI
"""
from __future__ import annotations

import json
import os
from datetime import UTC, datetime
from typing import Any

from groq import BadRequestError, Groq, RateLimitError
from loguru import logger

from .cache_service import get_cache
from .input_validator import InputValidator


class ExternalTrendAnalyzer:
    """Analyzes external fashion trends using Groq AI"""

    def __init__(self, api_key: str | None = None):
        """
        Initialize external trend analyzer
        
        Args:
            api_key: Groq API key (if None, uses GROQ_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")

        self.client = Groq(api_key=self.api_key)
        # Primary model: Llama 3.3 for text analysis
        self.model = "llama-3.3-70b-versatile"
        # Fallback model when rate limits are hit
        self.fallback_model = "openai/gpt-oss-120b"
        # Initialize cache
        self.cache = get_cache()
        logger.info(f"External Trend Analyzer initialized with primary: {self.model}, fallback: {self.fallback_model}")

    def analyze_fashion_trends(
        self,
        season: str | None = None,
        category: str | None = None
    ) -> dict[str, Any]:
        """
        Analyze current fashion trends using Groq AI
        
        Args:
            season: Optional season filter (e.g., "spring 2024", "winter")
            category: Optional category filter (e.g., "menswear", "womenswear")
            
        Returns:
            Dictionary with trending items, colors, styles, etc.
        """
        # Sanitize inputs to prevent injection attacks
        season = InputValidator.sanitize_season(season)
        category = InputValidator.sanitize_category(category)

        # Try cache first
        cache_key = self.cache._generate_key('trend_analysis', season=season, category=category)
        cached_result = self.cache.get(cache_key)
        if cached_result:
            logger.info(f"Returning cached trend analysis for season={season}, category={category}")
            return cached_result

        try:
            season_context = f" for {season}" if season else ""
            category_context = f" in {category}" if category else ""

            prompt = f"""You are a fashion trend analyst. Analyze current fashion trends{season_context}{category_context} and provide a comprehensive trend report.

Based on current fashion trends from social media (Instagram, TikTok), fashion blogs, and runway shows, identify:

1. **Trending Garment Types**: CRITICAL - You MUST provide EXACTLY 12-15 diverse trending items. Include variety across ALL categories:
   
   REQUIRED CATEGORIES (provide at least 2-3 items from EACH):
   - Tops: oversized blazers, turtleneck sweaters, crop tops, graphic tees, silk blouses
   - Bottoms: cargo pants, wide-leg jeans, mini skirts, pleated trousers, leather pants
   - Dresses: slip dresses, maxi dresses, shirt dresses, wrap dresses
   - Outerwear: trench coats, puffer jackets, leather jackets, cardigans
   - Shoes: chunky sneakers, ankle boots, platform heels, loafers
   - Accessories: bucket hats, crossbody bags, statement belts, layered necklaces
   
   EXAMPLE OUTPUT (you should return similar variety):
   - Oversized Blazers
   - Cargo Pants  
   - Slip Dresses
   - Chunky Sneakers
   - Bucket Hats
   - Wide-Leg Jeans
   - Turtleneck Sweaters
   - Ankle Boots
   - Crossbody Bags
   - Leather Jackets
   - Mini Skirts
   - Platform Heels
   
   DO NOT return less than 12 items. This is MANDATORY.
2. **Trending Colors**: What colors are popular right now? (e.g., sage green, terracotta, cream)
3. **Trending Styles**: What styles are in? (e.g., minimalist, Y2K, cottagecore, streetwear)
4. **Trending Patterns**: What patterns are popular? (e.g., checkerboard, floral, abstract)
5. **Trending Materials**: What fabrics are trending? (e.g., linen, corduroy, satin)
6. **Key Trends**: List 5-7 key fashion trends with brief descriptions

Provide your analysis in JSON format with the following structure:
{{
    "trending_items": [
        {{
            "item": "item name",
            "description": "why it's trending",
            "popularity_score": 85,
            "trend_direction": "rising" or "stable" or "falling"
        }}
    ],
    "trending_colors": [
        {{
            "color": "color name",
            "hex": "#hexcode",
            "popularity_score": 80,
            "description": "why it's trending"
        }}
    ],
    "trending_styles": [
        {{
            "style": "style name",
            "description": "style description",
            "popularity_score": 75
        }}
    ],
    "trending_patterns": [
        {{
            "pattern": "pattern name",
            "description": "pattern description",
            "popularity_score": 70
        }}
    ],
    "trending_materials": [
        {{
            "material": "material name",
            "description": "why it's trending",
            "popularity_score": 65
        }}
    ],
    "key_trends": [
        {{
            "trend_name": "trend name",
            "description": "detailed trend description",
            "impact": "high" or "medium" or "low"
        }}
    ],
    "season": "{season or 'current'}",
    "analysis_date": "{datetime.now(UTC).strftime('%Y-%m-%d')}",
    "confidence": 0.85
}}

Focus on REAL, CURRENT trends (last 1-3 months). Be specific and accurate.
Output JSON ONLY, no markdown blocks."""

            # Try primary model first
            model_to_use = self.model
            try:
                completion = self.client.chat.completions.create(
                    model=model_to_use,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a fashion trend analyst. Always respond with valid JSON only."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7,
                    max_tokens=2048,
                    top_p=1,
                    stream=False,
                    response_format={"type": "json_object"}
                )
            except (BadRequestError, RateLimitError) as e:
                # Rate limit error - switch to fallback model
                if "rate_limit" in str(e).lower() or "429" in str(e) or isinstance(e, RateLimitError):
                    logger.warning(f"Rate limit hit on {model_to_use}, switching to fallback model {self.fallback_model}")
                    model_to_use = self.fallback_model
                    # Retry with fallback model
                    completion = self.client.chat.completions.create(
                        model=model_to_use,
                        messages=[
                            {
                                "role": "system",
                                "content": "You are a fashion trend analyst. Always respond with valid JSON only."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        temperature=0.7,
                        max_tokens=2048,
                        top_p=1,
                        stream=False,
                        response_format={"type": "json_object"}
                    )
                else:
                    raise

            response_text = completion.choices[0].message.content.strip()

            # Clean up response if it has markdown
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            result = json.loads(response_text.strip())

            # CRITICAL FIX: Ensure we have AT LEAST 12 trending items
            trending_items = result.get('trending_items', [])
            if len(trending_items) < 12:
                logger.warning(f"AI returned only {len(trending_items)} items, padding to 12 minimum")

                # Fallback items to ensure variety
                fallback_items = [
                    {"item": "Wide-Leg Jeans", "description": "Comfortable and stylish denim with a relaxed fit", "popularity_score": 82, "trend_direction": "rising"},
                    {"item": "Turtleneck Sweaters", "description": "Classic winter staple making a comeback", "popularity_score": 80, "trend_direction": "stable"},
                    {"item": "Ankle Boots", "description": "Versatile footwear for any occasion", "popularity_score": 85, "trend_direction": "stable"},
                    {"item": "Crossbody Bags", "description": "Hands-free convenience meets style", "popularity_score": 78, "trend_direction": "stable"},
                    {"item": "Trench Coats", "description": "Timeless outerwear piece", "popularity_score": 83, "trend_direction": "rising"},
                    {"item": "Mini Skirts", "description": "Y2K revival bringing back short hemlines", "popularity_score": 79, "trend_direction": "rising"},
                    {"item": "Platform Heels", "description": "Height and comfort combined", "popularity_score": 76, "trend_direction": "stable"},
                    {"item": "Bucket Hats", "description": "Streetwear staple accessory", "popularity_score": 74, "trend_direction": "stable"},
                    {"item": "Leather Jackets", "description": "Edgy outerwear essential", "popularity_score": 88, "trend_direction": "stable"},
                    {"item": "Maxi Dresses", "description": "Flowy and elegant for any season", "popularity_score": 81, "trend_direction": "rising"},
                    {"item": "Chunky Loafers", "description": "Comfortable and trendy footwear", "popularity_score": 77, "trend_direction": "rising"},
                    {"item": "Statement Belts", "description": "Accessory to cinch and define waistlines", "popularity_score": 73, "trend_direction": "stable"},
                ]

                # Add fallback items until we have at least 12
                existing_items = {item.get('item', '').lower() for item in trending_items}
                for fallback in fallback_items:
                    if len(trending_items) >= 12:
                        break
                    if fallback['item'].lower() not in existing_items:
                        trending_items.append(fallback)
                        logger.info(f"Added fallback item: {fallback['item']}")

                result['trending_items'] = trending_items

            # Add metadata
            result["source"] = "groq_ai_analysis"
            result["analyzed_at"] = datetime.now(UTC).isoformat()

            logger.info(f"External trend analysis complete: {len(result.get('trending_items', []))} items, {len(result.get('trending_colors', []))} colors")
            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Groq trend analysis JSON: {e}")
            logger.error(f"Response was: {response_text[:200]}")
            return self._get_fallback_trends()
        except Exception as e:
            logger.error(f"Error analyzing external trends with Groq: {e}")
            return self._get_fallback_trends()

    def analyze_specific_trend(self, item_name: str) -> dict[str, Any]:
        """
        Get detailed analysis of a specific fashion item/trend
        
        Args:
            item_name: Name of the item to analyze (e.g., "oversized blazer")
            
        Returns:
            Detailed trend analysis for the item
        """
        # Sanitize input
        item_name = InputValidator.sanitize_item_name(item_name)
        if not item_name:
            logger.error("Invalid item name provided")
            return {
                "error": "Invalid item name",
                "analyzed_at": datetime.now(UTC).isoformat()
            }

        try:
            prompt = f"""Analyze the fashion trend for "{item_name}" in detail.

Provide:
1. Why is it trending? (social media, celebrity influence, runway, etc.)
2. How to style it
3. Best colors/patterns for this item
4. Who it suits best
5. Expected trend duration (short-term, medium-term, long-term)
6. Similar trending items

Output JSON format:
{{
    "item": "{item_name}",
    "trend_reason": "why it's trending",
    "styling_tips": ["tip1", "tip2", "tip3"],
    "best_colors": ["color1", "color2"],
    "best_patterns": ["pattern1", "pattern2"],
    "suitable_for": "description of who it suits",
    "trend_duration": "short-term" or "medium-term" or "long-term",
    "similar_items": ["item1", "item2"],
    "popularity_score": 85,
    "confidence": 0.9
}}"""

            # Try primary model first
            model_to_use = self.model
            try:
                completion = self.client.chat.completions.create(
                    model=model_to_use,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a fashion trend analyst. Always respond with valid JSON only."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.7,
                    max_tokens=1024,
                    top_p=1,
                    stream=False,
                    response_format={"type": "json_object"}
                )
            except (BadRequestError, RateLimitError) as e:
                if "rate_limit" in str(e).lower() or "429" in str(e) or isinstance(e, RateLimitError):
                    logger.warning(f"Rate limit hit, switching to fallback model {self.fallback_model}")
                    model_to_use = self.fallback_model
                    completion = self.client.chat.completions.create(
                        model=model_to_use,
                        messages=[
                            {
                                "role": "system",
                                "content": "You are a fashion trend analyst. Always respond with valid JSON only."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        temperature=0.7,
                        max_tokens=1024,
                        top_p=1,
                        stream=False,
                        response_format={"type": "json_object"}
                    )
                else:
                    raise

            response_text = completion.choices[0].message.content.strip()

            # Clean up response
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            result = json.loads(response_text.strip())
            result["analyzed_at"] = datetime.now(UTC).isoformat()

            logger.info(f"Detailed trend analysis for '{item_name}' complete")
            return result

        except Exception as e:
            logger.error(f"Error analyzing specific trend '{item_name}': {e}")
            return {
                "item": item_name,
                "error": str(e),
                "analyzed_at": datetime.now(UTC).isoformat()
            }

    def compare_trends(self, item1: str, item2: str) -> dict[str, Any]:
        """
        Compare two fashion trends
        
        Args:
            item1: First item to compare
            item2: Second item to compare
            
        Returns:
            Comparison analysis
        """
        # Sanitize inputs
        item1 = InputValidator.sanitize_item_name(item1)
        item2 = InputValidator.sanitize_item_name(item2)

        if not item1 or not item2:
            logger.error("Invalid item names provided for comparison")
            return {"error": "Invalid item names"}

        try:
            prompt = f"""Compare these two fashion trends: "{item1}" vs "{item2}".

Analyze:
1. Which is more popular right now?
2. Trend direction (rising/falling) for each
3. Style differences
4. Target audience differences
5. Which will last longer?

Output JSON:
{{
    "item1": "{item1}",
    "item2": "{item2}",
    "more_popular": "item1" or "item2",
    "item1_analysis": {{
        "popularity": 85,
        "trend_direction": "rising",
        "description": "analysis"
    }},
    "item2_analysis": {{
        "popularity": 70,
        "trend_direction": "stable",
        "description": "analysis"
    }},
    "comparison": "detailed comparison",
    "winner": "item1" or "item2" or "tie"
}}"""

            # Try primary model first
            model_to_use = self.model
            try:
                completion = self.client.chat.completions.create(
                    model=model_to_use,
                    messages=[
                        {"role": "system", "content": "You are a fashion trend analyst. Always respond with valid JSON only."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1024,
                    top_p=1,
                    stream=False,
                    response_format={"type": "json_object"}
                )
            except (BadRequestError, RateLimitError) as e:
                if "rate_limit" in str(e).lower() or "429" in str(e) or isinstance(e, RateLimitError):
                    logger.warning(f"Rate limit hit, switching to fallback model {self.fallback_model}")
                    model_to_use = self.fallback_model
                    completion = self.client.chat.completions.create(
                        model=model_to_use,
                        messages=[
                            {"role": "system", "content": "You are a fashion trend analyst. Always respond with valid JSON only."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.7,
                        max_tokens=1024,
                        top_p=1,
                        stream=False,
                        response_format={"type": "json_object"}
                    )
                else:
                    raise

            response_text = completion.choices[0].message.content.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            result = json.loads(response_text.strip())
            result["compared_at"] = datetime.now(UTC).isoformat()

            return result

        except Exception as e:
            logger.error(f"Error comparing trends: {e}")
            return {"error": str(e)}

    def _get_fallback_trends(self) -> dict[str, Any]:
        """Return fallback trends if API fails"""
        return {
            "trending_items": [
                {
                    "item": "oversized blazer",
                    "description": "Classic piece making a comeback",
                    "popularity_score": 80,
                    "trend_direction": "rising"
                }
            ],
            "trending_colors": [
                {
                    "color": "sage green",
                    "hex": "#87AE73",
                    "popularity_score": 75,
                    "description": "Nature-inspired neutral"
                }
            ],
            "trending_styles": [
                {
                    "style": "minimalist",
                    "description": "Clean, simple aesthetics",
                    "popularity_score": 70
                }
            ],
            "trending_patterns": [],
            "trending_materials": [],
            "key_trends": [],
            "source": "fallback",
            "analyzed_at": datetime.now(UTC).isoformat(),
            "confidence": 0.5
        }


