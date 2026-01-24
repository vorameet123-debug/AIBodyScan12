"""
Fashion Trend Advisor Service
Analyzes external trends and provides personalized recommendations
"""
from __future__ import annotations

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from loguru import logger
from sqlmodel import Session, select
from collections import Counter

from integrations.external_trend_analyzer import ExternalTrendAnalyzer
from integrations.body_intelligence import BodyIntelligence
from integrations.wardrobe_analytics import WardrobeAnalytics
from fashion_iq_models import FitCheckHistory, ExternalTrend


class FashionTrendAdvisor:
    """Provides personalized fashion trend recommendations"""
    
    def __init__(self, session: Session):
        self.session = session
        self.external_analyzer = ExternalTrendAnalyzer()
        self.body_intelligence = BodyIntelligence(session)
        self.wardrobe_analytics = WardrobeAnalytics(session)
    
    def get_user_profile(self, user_id: int) -> Dict[str, Any]:
        """
        Get comprehensive user profile for trend matching
        
        Returns:
            Dictionary with body type, skin tone, wardrobe colors, style preferences
        """
        try:
            profile = {
                'body_type': None,
                'skin_tone': None,
                'wardrobe_colors': [],
                'style_preferences': [],
                'fit_preferences': [],
                'dominant_colors': []
            }
            
            # Get body type
            try:
                body_shape = self.body_intelligence.classify_body_shape(user_id)
                profile['body_type'] = body_shape.get('shape', 'unknown')
            except Exception as e:
                logger.warning(f"Could not get body type: {e}")
            
            # Get wardrobe colors
            try:
                color_data = self.wardrobe_analytics.get_color_distribution(user_id, 'all')
                profile['wardrobe_colors'] = list(color_data.get('distribution', {}).keys())
                profile['dominant_colors'] = [
                    color_data.get('dominant_color', 'unknown')
                ] if color_data.get('dominant_color') else []
            except Exception as e:
                logger.warning(f"Could not get wardrobe colors: {e}")
            
            # Get style preferences from fit check history
            try:
                cutoff = datetime.utcnow() - timedelta(days=90)
                checks = self.session.exec(
                    select(FitCheckHistory)
                    .where(
                        FitCheckHistory.user_id == user_id,
                        FitCheckHistory.checked_at >= cutoff
                    )
                ).all()
                
                if checks:
                    style_counts = Counter(c.style for c in checks if c.style and c.style != 'unknown')
                    profile['style_preferences'] = [style for style, _ in style_counts.most_common(3)]
                    
                    # Get fit preferences (from formality level)
                    formality_levels = [c.formality_level for c in checks if c.formality_level]
                    if formality_levels:
                        avg_formality = sum(formality_levels) / len(formality_levels)
                        if avg_formality >= 7:
                            profile['fit_preferences'] = ['formal']
                        elif avg_formality >= 4:
                            profile['fit_preferences'] = ['semi-formal', 'casual']
                        else:
                            profile['fit_preferences'] = ['casual']
            except Exception as e:
                logger.warning(f"Could not get style preferences: {e}")
            
            # Note: Skin tone would need to be stored separately or extracted from images
            # For now, we'll use a default or try to infer from color preferences
            profile['skin_tone'] = 'neutral'  # Default, can be enhanced later
            
            logger.info(f"User profile for {user_id}: body_type={profile['body_type']}, styles={profile['style_preferences']}")
            return profile
            
        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return {
                'body_type': 'unknown',
                'skin_tone': 'neutral',
                'wardrobe_colors': [],
                'style_preferences': [],
                'fit_preferences': [],
                'dominant_colors': []
            }
    
    def match_trend_with_user(
        self,
        trend_item: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Match a trend item with user profile
        
        Returns:
            Match score (0-100) and reasons
        """
        match_score = 0
        reasons = []
        max_score = 100
        
        # Body type compatibility (40% weight)
        body_type = user_profile.get('body_type', 'unknown')
        if body_type != 'unknown':
            # Simple compatibility check (can be enhanced with style rules)
            # For now, we'll give a base score if body type is known
            match_score += 30
            reasons.append(f"Compatible with your {body_type} body type")
        
        # Style preference match (30% weight)
        user_styles = user_profile.get('style_preferences', [])
        if user_styles:
            # Check if trend style matches user preferences
            trend_style = trend_item.get('style', '').lower()
            if any(style.lower() in trend_style or trend_style in style.lower() for style in user_styles):
                match_score += 30
                reasons.append(f"Matches your {user_styles[0]} style preference")
            else:
                match_score += 15
                reasons.append("Style versatility - works with multiple styles")
        
        # Color compatibility (20% weight)
        wardrobe_colors = user_profile.get('wardrobe_colors', [])
        dominant_colors = user_profile.get('dominant_colors', [])
        if wardrobe_colors or dominant_colors:
            # Colors that work well together
            neutral_colors = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'brown']
            trend_color = trend_item.get('color', '').lower()
            
            if any(neutral in trend_color or trend_color in neutral for neutral in neutral_colors):
                match_score += 20
                reasons.append("Neutral color - pairs well with your wardrobe")
            elif any(color.lower() in trend_color for color in wardrobe_colors):
                match_score += 15
                reasons.append("Complements your existing color palette")
            else:
                match_score += 10
                reasons.append("Adds variety to your color palette")
        
        # Trend momentum (10% weight)
        trend_direction = trend_item.get('trend_direction', 'stable')
        popularity_score = trend_item.get('popularity_score', 0)
        
        if trend_direction == 'rising' and popularity_score >= 80:
            match_score += 10
            reasons.append("Hot trend - high momentum")
        elif trend_direction == 'stable':
            match_score += 8
            reasons.append("Stable trend - safe investment")
        else:
            match_score += 5
        
        # Calculate confidence
        confidence = match_score / max_score
        
        return {
            'match_score': round(match_score, 1),
            'confidence': round(confidence, 2),
            'reasons': reasons,
            'max_score': max_score
        }
    
    def get_trends_for_user(
        self,
        user_id: int,
        days: int = 7,
        min_match_score: float = 60.0
    ) -> Dict[str, Any]:
        """
        Get personalized trends for user
        
        Args:
            user_id: User ID
            days: Days to look back for external trends
            min_match_score: Minimum match score to include (0-100)
            
        Returns:
            Personalized trend recommendations
        """
        try:
            # Get user profile
            user_profile = self.get_user_profile(user_id)
            
            # Get external trends (from database or analyze fresh)
            external_trends = self._get_or_analyze_trends(days)
            
            # Match trends with user
            matched_trends = []
            seen_items = set()  # Track items we've already added (case-insensitive)
            
            for item in external_trends.get('trending_items', []):
                # Normalize item name for deduplication
                item_name = item.get('item', '').strip()
                item_name_lower = item_name.lower()
                
                # Skip if we've already seen this item (case-insensitive)
                if item_name_lower in seen_items:
                    logger.debug(f"Skipping duplicate item: {item_name}")
                    continue
                
                match_result = self.match_trend_with_user(item, user_profile)
                
                if match_result['match_score'] >= min_match_score:
                    matched_trends.append({
                        'item': item_name,  # Use the original capitalization from AI
                        'description': item.get('description', ''),
                        'popularity_score': item.get('popularity_score', 0),
                        'trend_direction': item.get('trend_direction', 'stable'),
                        'match_score': match_result['match_score'],
                        'confidence': match_result['confidence'],
                        'reasons': match_result['reasons'],
                        'trend_data': item
                    })
                    seen_items.add(item_name_lower)  # Mark as seen
            
            # Sort by match score (highest first)
            matched_trends.sort(key=lambda x: x['match_score'], reverse=True)
            
            # Get trending colors
            matched_colors = []
            for color in external_trends.get('trending_colors', []):
                # Simple color matching (can be enhanced)
                match_score = 70  # Base score for colors
                matched_colors.append({
                    'color': color.get('color', ''),
                    'hex': color.get('hex', ''),
                    'popularity_score': color.get('popularity_score', 0),
                    'match_score': match_score,
                    'description': color.get('description', '')
                })
            
            matched_colors.sort(key=lambda x: x['match_score'], reverse=True)
            
            return {
                'user_profile': {
                    'body_type': user_profile.get('body_type', 'unknown'),
                    'style_preferences': user_profile.get('style_preferences', []),
                    'dominant_colors': user_profile.get('dominant_colors', [])
                },
                'trending_items': matched_trends[:10],  # Top 10
                'trending_colors': matched_colors[:5],  # Top 5
                'trending_styles': external_trends.get('trending_styles', [])[:5],
                'total_matched': len(matched_trends),
                'analysis_date': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting trends for user {user_id}: {e}")
            return {
                'user_profile': {},
                'trending_items': [],
                'trending_colors': [],
                'trending_styles': [],
                'total_matched': 0,
                'error': str(e)
            }
    
    def get_trend_explanation(
        self,
        trend_item: str,
        user_id: int
    ) -> Dict[str, Any]:
        """
        Get detailed explanation for a specific trend
        
        Args:
            trend_item: Name of the trend item
            user_id: User ID
            
        Returns:
            Detailed explanation with why trending, why for user, how to style
        """
        try:
            # Get user profile
            user_profile = self.get_user_profile(user_id)
            
            # Get trend data
            external_trends = self._get_or_analyze_trends(7)
            trend_data = None
            
            for item in external_trends.get('trending_items', []):
                if item.get('item', '').lower() == trend_item.lower():
                    trend_data = item
                    break
            
            if not trend_data:
                return {
                    'error': f'Trend "{trend_item}" not found',
                    'trend_item': trend_item
                }
            
            # Match with user
            match_result = self.match_trend_with_user(trend_data, user_profile)
            
            # Generate explanation using Groq AI
            try:
                explanation = self._generate_ai_explanation(
                    trend_data,
                    user_profile,
                    match_result
                )
            except Exception as e:
                logger.warning(f"AI explanation failed, using basic: {e}")
                explanation = self._generate_basic_explanation(
                    trend_data,
                    user_profile,
                    match_result
                )
            
            return {
                'trend_item': trend_item,
                'why_trending': explanation.get('why_trending', {}),
                'why_for_you': explanation.get('why_for_you', {}),
                'how_to_style': explanation.get('how_to_style', []),
                'occasions': explanation.get('occasions', []),
                'match_score': match_result['match_score'],
                'confidence': match_result['confidence']
            }
            
        except Exception as e:
            logger.error(f"Error getting trend explanation: {e}")
            return {'error': str(e)}
    
    def _get_or_analyze_trends(self, days: int = 7) -> Dict[str, Any]:
        """Get external trends from database or analyze fresh"""
        try:
            # Try to get from database first
            cutoff = datetime.utcnow() - timedelta(days=days)
            trends = self.session.exec(
                select(ExternalTrend)
                .where(
                    ExternalTrend.is_active == True,
                    ExternalTrend.created_at >= cutoff,
                    ExternalTrend.trend_type == 'item'
                )
                .order_by(ExternalTrend.popularity_score.desc())
                .limit(20)
            ).all()
            
            if trends and len(trends) >= 5:
                # Convert to format
                return {
                    'trending_items': [
                        {
                            'item': t.trend_name,
                            'description': t.trend_data.get('description', ''),
                            'popularity_score': t.popularity_score,
                            'trend_direction': t.trend_direction
                        }
                        for t in trends
                    ],
                    'trending_colors': [],
                    'trending_styles': [],
                    'source': 'database'
                }
            else:
                # Analyze fresh
                logger.info("No recent trends in database, analyzing fresh...")
                return self.external_analyzer.analyze_fashion_trends()
                
        except Exception as e:
            logger.warning(f"Error getting trends from database: {e}, analyzing fresh...")
            return self.external_analyzer.analyze_fashion_trends()
    
    def _generate_ai_explanation(
        self,
        trend_data: Dict[str, Any],
        user_profile: Dict[str, Any],
        match_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate explanation using Groq AI"""
        try:
            from groq import BadRequestError, RateLimitError
            
            body_type = user_profile.get('body_type', 'unknown')
            styles = ', '.join(user_profile.get('style_preferences', ['casual']))
            colors = ', '.join(user_profile.get('dominant_colors', ['neutral']))
            
            prompt = f"""You are a fashion stylist. Provide a detailed explanation for the trend "{trend_data.get('item', '')}".

Trend Details:
- Description: {trend_data.get('description', '')}
- Popularity: {trend_data.get('popularity_score', 0)}/100
- Direction: {trend_data.get('trend_direction', 'stable')}

User Profile:
- Body Type: {body_type}
- Style Preferences: {styles}
- Dominant Colors: {colors}
- Match Score: {match_result['match_score']}/100

Provide a JSON response with:
{{
    "why_trending": {{
        "social_media": "brief description",
        "celebrities": ["name1", "name2"],
        "runway": "brief description",
        "blogs": "brief description"
    }},
    "why_for_you": {{
        "body_type": "why it works for {body_type} body type",
        "style": "why it matches {styles} style",
        "colors": "why it works with {colors} colors",
        "overall": "overall explanation"
    }},
    "how_to_style": [
        "styling tip 1",
        "styling tip 2",
        "styling tip 3"
    ],
    "occasions": [
        "occasion 1",
        "occasion 2"
    ]
}}

Be specific and helpful. Output JSON only."""

            # Try primary model first
            model_to_use = self.external_analyzer.model
            try:
                response = self.external_analyzer.client.chat.completions.create(
                    model=model_to_use,
                    messages=[
                        {"role": "system", "content": "You are a fashion stylist. Always respond with valid JSON only."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1024,
                    response_format={"type": "json_object"}
                )
            except (BadRequestError, RateLimitError) as e:
                if "rate_limit" in str(e).lower() or "429" in str(e) or isinstance(e, RateLimitError):
                    logger.warning(f"Rate limit hit on {model_to_use}, switching to fallback model {self.external_analyzer.fallback_model}")
                    model_to_use = self.external_analyzer.fallback_model
                    # Retry with fallback model
                    response = self.external_analyzer.client.chat.completions.create(
                        model=model_to_use,
                        messages=[
                            {"role": "system", "content": "You are a fashion stylist. Always respond with valid JSON only."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.7,
                        max_tokens=1024,
                        response_format={"type": "json_object"}
                    )
                else:
                    raise
            
            response_text = response.choices[0].message.content.strip()
            logger.debug(f"Raw AI response from {model_to_use}: {response_text[:200]}...")
            
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            result = json.loads(response_text.strip())
            
            # CRITICAL FIX: Validate and ensure ALL required fields are populated
            # This prevents empty UI cards in the frontend
            
            # Ensure why_for_you exists and has ALL required fields
            if not result.get('why_for_you') or not isinstance(result.get('why_for_you'), dict):
                logger.warning(f"AI response missing or invalid 'why_for_you' section. Full response: {result}")
                result['why_for_you'] = {}
            
            # Validate and populate each field in why_for_you
            why_for_you = result['why_for_you']
            body_type = user_profile.get('body_type', 'your')
            styles = user_profile.get('style_preferences', ['casual'])
            style_str = styles[0] if styles else 'casual'
            colors = user_profile.get('dominant_colors', ['neutral'])
            color_str = colors[0] if colors else 'neutral'
            
            # Ensure body_type field is not empty
            if not why_for_you.get('body_type') or not why_for_you.get('body_type').strip():
                why_for_you['body_type'] = f"Tailored advice for your {body_type} body type."
            
            # Ensure style field is not empty
            if not why_for_you.get('style') or not why_for_you.get('style').strip():
                why_for_you['style'] = f"Matches your {style_str} style preference."
            
            # Ensure colors field is not empty
            if not why_for_you.get('colors') or not why_for_you.get('colors').strip():
                why_for_you['colors'] = f"Works well with your {color_str} color palette."
            
            # Ensure overall field is not empty
            if not why_for_you.get('overall') or not why_for_you.get('overall').strip():
                why_for_you['overall'] = f"A great match for your personal style profile."
            
            result['why_for_you'] = why_for_you
            
            # Ensure how_to_style exists and is not empty
            if not result.get('how_to_style') or not isinstance(result.get('how_to_style'), list) or len(result.get('how_to_style', [])) == 0:
                logger.warning(f"AI response missing or empty 'how_to_style' section")
                result['how_to_style'] = [
                    "Pair with complementary pieces from your wardrobe.",
                    "Balance proportions with fitted or structured items.",
                    "Accessorize to complete the look."
                ]
            else:
                # Filter out empty strings from how_to_style
                result['how_to_style'] = [tip for tip in result['how_to_style'] if tip and tip.strip()]
                if len(result['how_to_style']) == 0:
                    result['how_to_style'] = ["Pair this with structured neutrals for an elevated look."]
            
            # Ensure why_trending exists
            if not result.get('why_trending') or not isinstance(result.get('why_trending'), dict):
                result['why_trending'] = {
                    'social_media': f"{trend_data.get('item', 'This trend')} is gaining traction on social media.",
                    'celebrities': [],
                    'runway': 'Featured in recent fashion shows.',
                    'blogs': 'Covered in fashion blogs and magazines.'
                }
            
            # Ensure occasions exists
            if not result.get('occasions') or not isinstance(result.get('occasions'), list):
                result['occasions'] = ['Casual outings', 'Weekend events']
            
            logger.info(f"AI explanation validated and populated successfully using {model_to_use}")
            logger.debug(f"Final explanation structure: why_for_you={result.get('why_for_you')}, how_to_style_count={len(result.get('how_to_style', []))}")
            return result
            
        except Exception as e:
            logger.error(f"Error generating AI explanation: {e}")
            raise
    
    def _generate_basic_explanation(
        self,
        trend_data: Dict[str, Any],
        user_profile: Dict[str, Any],
        match_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate basic explanation without AI"""
        body_type = user_profile.get('body_type', 'unknown')
        styles = user_profile.get('style_preferences', ['casual'])
        
        return {
            'why_trending': {
                'social_media': f"{trend_data.get('item', '')} is trending on social media",
                'celebrities': [],
                'runway': 'Featured in recent fashion shows',
                'blogs': 'Covered in fashion blogs'
            },
            'why_for_you': {
                'body_type': f"Works well for {body_type} body types",
                'style': f"Matches your {styles[0] if styles else 'casual'} style preference",
                'colors': 'Versatile color options available',
                'overall': f"High match score ({match_result['match_score']}/100) indicates good compatibility"
            },
            'how_to_style': [
                'Pair with items from your existing wardrobe',
                'Choose colors that complement your style',
                'Accessorize to complete the look'
            ],
            'occasions': [
                'Casual outings',
                'Weekend events'
            ]
        }
