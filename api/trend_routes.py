"""
Trend Intelligence API Routes
Provides endpoints for trend analysis and user alignment
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import Optional, List, Dict, Any
from loguru import logger
from integrations.trend_analyzer import TrendAnalyzer
from integrations.external_trend_analyzer import ExternalTrendAnalyzer
from integrations.fashion_trend_advisor import FashionTrendAdvisor
from fashion_iq_models import ExternalTrend
from datetime import datetime, timedelta


def register_trend_routes(app, get_session):
    """Register trend intelligence routes"""
    
    router = APIRouter(prefix="/api/v1/trends", tags=["Trends"])
    
    @router.get("/current")
    async def get_current_trends(
        days: int = Query(7, description="Number of days to analyze", ge=1, le=90),
        min_velocity: float = Query(20.0, description="Minimum velocity to be considered trending", ge=0),
        session: Session = Depends(get_session)
    ):
        """Get currently trending items based on fit check data"""
        try:
            analyzer = TrendAnalyzer(session)
            trends = analyzer.detect_trending_items(days=days, min_velocity=min_velocity)
            return {
                "success": True,
                "trends": trends,
                "period_days": days,
                "total_trending": len(trends)
            }
        except Exception as e:
            logger.error(f"Error getting current trends: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get trends: {str(e)}")
    
    @router.get("/user-alignment/{user_id}")
    async def get_user_alignment(
        user_id: int,
        days: int = Query(7, description="Number of days to analyze trends", ge=1, le=90),
        session: Session = Depends(get_session)
    ):
        """Get user's alignment with current trends"""
        try:
            analyzer = TrendAnalyzer(session)
            alignment = analyzer.calculate_trend_alignment(user_id, days=days)
            return {
                "success": True,
                "alignment": alignment
            }
        except Exception as e:
            logger.error(f"Error calculating user alignment: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to calculate alignment: {str(e)}")
    
    @router.get("/styles")
    async def get_style_trends(
        days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
        session: Session = Depends(get_session)
    ):
        """Get trending styles and colors"""
        try:
            analyzer = TrendAnalyzer(session)
            style_trends = analyzer.detect_style_trends(days=days)
            return {
                "success": True,
                "style_trends": style_trends
            }
        except Exception as e:
            logger.error(f"Error getting style trends: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get style trends: {str(e)}")
    
    @router.get("/forecast")
    async def get_trend_forecast(
        days: int = Query(7, description="Number of days to analyze", ge=1, le=30),
        session: Session = Depends(get_session)
    ):
        """Forecast trends based on acceleration"""
        try:
            analyzer = TrendAnalyzer(session)
            forecasts = analyzer.forecast_trends(days=days)
            return {
                "success": True,
                "forecasts": forecasts,
                "total_forecasts": len(forecasts)
            }
        except Exception as e:
            logger.error(f"Error forecasting trends: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to forecast trends: {str(e)}")
    
    @router.get("/external")
    async def get_external_trends(
        days: int = Query(7, description="Number of days to look back", ge=1, le=90),
        session: Session = Depends(get_session)
    ):
        """Get external trends analyzed by AI"""
        try:
            analyzer = TrendAnalyzer(session)
            external_trends = analyzer.get_external_trends(days=days)
            return {
                "success": True,
                "trends": external_trends
            }
        except Exception as e:
            logger.error(f"Error getting external trends: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get external trends: {str(e)}")
    
    @router.get("/combined")
    async def get_combined_trends(
        days: int = Query(7, description="Number of days to analyze", ge=1, le=90),
        session: Session = Depends(get_session)
    ):
        """Get combined internal and external trends"""
        try:
            analyzer = TrendAnalyzer(session)
            combined = analyzer.get_combined_trends(days=days)
            return {
                "success": True,
                "data": combined
            }
        except Exception as e:
            logger.error(f"Error getting combined trends: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get combined trends: {str(e)}")
    
    @router.post("/analyze-external")
    async def analyze_external_trends(
        season: Optional[str] = Query(None, description="Season filter (e.g., 'spring 2024')"),
        category: Optional[str] = Query(None, description="Category filter (e.g., 'menswear')"),
        session: Session = Depends(get_session)
    ):
        """Trigger external trend analysis using Groq AI and store results"""
        try:
            # Initialize external analyzer
            external_analyzer = ExternalTrendAnalyzer()
            
            # Analyze trends
            trends_data = external_analyzer.analyze_fashion_trends(
                season=season,
                category=category
            )
            
            # Store in database
            stored_count = 0
            
            # Store trending items
            for item in trends_data.get("trending_items", []):
                trend = ExternalTrend(
                    trend_type="item",
                    trend_name=item.get("item", ""),
                    trend_data=item,
                    popularity_score=item.get("popularity_score", 0),
                    trend_direction=item.get("trend_direction", "stable"),
                    source="groq_ai",
                    season=season,
                    confidence=trends_data.get("confidence", 0.8),
                    expires_at=datetime.utcnow() + timedelta(days=30),
                    is_active=True
                )
                session.add(trend)
                stored_count += 1
            
            # Store trending colors
            for color in trends_data.get("trending_colors", []):
                trend = ExternalTrend(
                    trend_type="color",
                    trend_name=color.get("color", ""),
                    trend_data=color,
                    popularity_score=color.get("popularity_score", 0),
                    trend_direction="stable",
                    source="groq_ai",
                    season=season,
                    confidence=trends_data.get("confidence", 0.8),
                    expires_at=datetime.utcnow() + timedelta(days=30),
                    is_active=True
                )
                session.add(trend)
                stored_count += 1
            
            # Store trending styles
            for style in trends_data.get("trending_styles", []):
                trend = ExternalTrend(
                    trend_type="style",
                    trend_name=style.get("style", ""),
                    trend_data=style,
                    popularity_score=style.get("popularity_score", 0),
                    trend_direction="stable",
                    source="groq_ai",
                    season=season,
                    confidence=trends_data.get("confidence", 0.8),
                    expires_at=datetime.utcnow() + timedelta(days=30),
                    is_active=True
                )
                session.add(trend)
                stored_count += 1
            
            session.commit()
            
            return {
                "success": True,
                "message": f"Analyzed and stored {stored_count} external trends",
                "trends_analyzed": trends_data,
                "stored_count": stored_count
            }
            
        except Exception as e:
            logger.error(f"Error analyzing external trends: {e}")
            session.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to analyze external trends: {str(e)}")
    
    @router.get("/for-you/{user_id}")
    async def get_trends_for_user(
        user_id: int,
        days: int = Query(7, description="Days to look back for trends", ge=1, le=90),
        min_match: float = Query(60.0, description="Minimum match score", ge=0, le=100),
        person_name: Optional[str] = Query(None, description="Filter by person name"),
        session: Session = Depends(get_session)
    ):
        """Get personalized trends for user"""
        try:
            advisor = FashionTrendAdvisor(session)
            trends = advisor.get_trends_for_user(user_id, days=days, min_match_score=min_match)
            
            # Add body shape changes if available
            from integrations.body_intelligence import BodyIntelligence
            from datetime import datetime, timedelta
            
            tracker = BodyIntelligence(session)
            shape_changes = tracker.detect_shape_changes(user_id, person_name=person_name)
            
            # Filter to recent changes (last 30 days)
            recent_changes = []
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            for change in shape_changes:
                change_date = datetime.strptime(change['change_date'], '%Y-%m-%d')
                if change_date >= cutoff_date:
                    recent_changes.append(change)
            
            # Add body insights to response if there are recent changes
            response_data = trends
            if recent_changes:
                response_data['body_insights'] = {
                    'shape_changes': recent_changes,
                    'latest_shape': recent_changes[-1]['to_shape'] if recent_changes else None
                }
            
            return {
                "success": True,
                "data": response_data
            }
        except Exception as e:
            logger.error(f"Error getting trends for user: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to get personalized trends: {str(e)}")
    
    @router.get("/explain/{user_id}")
    async def explain_trend(
        user_id: int,
        item: str = Query(..., description="Trend item to explain"),
        session: Session = Depends(get_session)
    ):
        """Get detailed explanation for a specific trend"""
        try:
            advisor = FashionTrendAdvisor(session)
            explanation = advisor.get_trend_explanation(item, user_id)
            return {
                "success": True,
                "explanation": explanation
            }
        except Exception as e:
            logger.error(f"Error explaining trend: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to explain trend: {str(e)}")
    
    # Register router with app
    app.include_router(router)
    logger.info("Trend intelligence routes registered successfully")
