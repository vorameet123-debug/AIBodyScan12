"""
Body Intelligence API Routes
Provides endpoints for measurement history, trends, and body tracking
"""
from fastapi import HTTPException, Depends
from sqlmodel import Session
from loguru import logger
from typing import Optional  # CRITICAL: Import Optional here!


def register_body_intelligence_routes(app, get_session):
    """Register body intelligence routes with the FastAPI app"""
    
    @app.get("/api/v1/body/history/{user_id}")
    async def get_measurement_history(
        user_id: int,
        days: int = 90,
        person_name: Optional[str] = None,
        session: Session = Depends(get_session)
    ):
        """
        Get measurement timeline for charts
        
        Args:
            user_id: User ID
            days: Number of days to look back (default 90)
            person_name: Optional filter by person name
        """
        try:
            from integrations.body_intelligence import BodyIntelligence
            
            tracker = BodyIntelligence(session)
            history = tracker.get_measurement_history(user_id, days, person_name)
            
            return {
                "success": True,
                "data": history,
                "count": len(history)
            }
        except Exception as e:
            logger.error(f"Error getting measurement history: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    
    @app.get("/api/v1/body/trends/{user_id}")
    async def get_body_trends(
        user_id: int,
        lookback: int = 5,
        session: Session = Depends(get_session)
    ):
        """
        Get measurement trends (increasing/decreasing/stable)
        
        Args:
            user_id: User ID
            lookback: Number of recent measurements to analyze
        """
        try:
            from integrations.body_intelligence import BodyIntelligence
            
            tracker = BodyIntelligence(session)
            trends = tracker.calculate_trends(user_id, lookback)
            changes = tracker.detect_shape_changes(user_id)
            
            return {
                "success": True,
                "trends": trends,
                "significant_changes": changes
            }
        except Exception as e:
            logger.error(f"Error calculating trends: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    
    @app.get("/api/v1/body/comparison/{user_id}")
    async def get_comparison(
        user_id: int,
        id1: int,
        id2: int,
        session: Session = Depends(get_session)
    ):
        """
        Compare two specific measurements
        
        Args:
            user_id: User ID
            id1: First measurement ID
            id2: Second measurement ID
        """
        try:
            from integrations.body_intelligence import BodyIntelligence
            
            tracker = BodyIntelligence(session)
            comparison = tracker.get_comparison(user_id, id1, id2)
            
            if 'error' in comparison:
                raise HTTPException(status_code=404, detail=comparison['error'])
            
            return {
                "success": True,
                "comparison": comparison
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error comparing measurements: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    
    @app.get("/api/v1/body/progress/{user_id}")
    async def get_progress_summary(
        user_id: int,
        person_name: Optional[str] = None,
        session: Session = Depends(get_session)
    ):
        """
        Get overall progress summary with trends and insights
        
        Args:
            user_id: User ID
            person_name: Optional person name to filter by (for multi-person accounts)
        """
        try:
            from integrations.body_intelligence import BodyIntelligence
            
            tracker = BodyIntelligence(session)
            summary = tracker.get_progress_summary(user_id, person_name=person_name)
            
            return {
                "success": True,
                "summary": summary
            }
        except Exception as e:
            logger.error(f"Error getting progress summary: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    
    @app.get("/api/v1/body/body-shape/{user_id}")
    async def get_body_shape(
        user_id: int,
        session: Session = Depends(get_session)
    ):
        """
        Get body shape classification
        
        Args:
            user_id: User ID
        """
        try:
            from integrations.body_intelligence import BodyIntelligence
            
            tracker = BodyIntelligence(session)
            body_shape = tracker.classify_body_shape(user_id)
            
            return {
                "success": True,
                "body_shape": body_shape
            }
        except Exception as e:
            logger.error(f"Error classifying body shape: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    
    @app.get("/api/v1/body/patterns/{user_id}")
    async def get_body_patterns(
        user_id: int,
        session: Session = Depends(get_session)
    ):
        """
        Detect body transformation patterns
        
        Args:
            user_id: User ID
        """
        try:
            from integrations.body_intelligence import BodyIntelligence
            
            tracker = BodyIntelligence(session)
            patterns = tracker.detect_body_patterns(user_id)
            
            return {
                "success": True,
                "patterns": patterns
            }
        except Exception as e:
            logger.error(f"Error detecting patterns: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    
    @app.get("/api/v1/body/velocity/{user_id}")
    async def get_trend_velocity(
        user_id: int,
        session: Session = Depends(get_session)
    ):
        """
        Get trend velocity and acceleration
        
        Args:
            user_id: User ID
        """
        try:
            from integrations.body_intelligence import BodyIntelligence
            
            tracker = BodyIntelligence(session)
            velocity = tracker.calculate_trend_velocity(user_id)
            
            return {
                "success": True,
                "velocity": velocity
            }
        except Exception as e:
            logger.error(f"Error calculating velocity: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    
    @app.get("/api/v1/body/size-changes/{user_id}")
    async def get_size_changes(
        user_id: int,
        session: Session = Depends(get_session)
    ):
        """
        Track size recommendation changes over time
        
        Args:
            user_id: User ID
        """
        try:
            from integrations.body_intelligence import BodyIntelligence
            
            tracker = BodyIntelligence(session)
            size_changes = tracker.track_size_changes(user_id)
            
            return {
                "success": True,
                "size_changes": size_changes
            }
        except Exception as e:
            logger.error(f"Error tracking size changes: {e}")
            raise HTTPException(status_code=500, detail=str(e))