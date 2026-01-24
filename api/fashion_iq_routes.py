"""
Fashion IQ API Endpoints
Handles all Fashion IQ related API routes
"""
from typing import Optional
from fastapi import HTTPException, Depends
from sqlmodel import Session, select
from loguru import logger

# These will be imported from app.py
# from db import get_session, User
# from fashion_iq_models import FashionIQScore
# from integrations.fashion_iq_calculator import FashionIQCalculator


def register_fashion_iq_routes(app, get_session, User):
    """Register Fashion IQ routes with the FastAPI app"""
    
    @app.get("/api/v1/fashion-iq/{user_id}")
    async def get_fashion_iq(
        user_id: int,
        session: Session = Depends(get_session)
    ):
        """Get user's Fashion IQ score and breakdown"""
        try:
            from integrations.fashion_iq_calculator import FashionIQCalculator
            from fashion_iq_models import FashionIQScore
            
            # Check if score exists in database
            statement = select(FashionIQScore).where(FashionIQScore.user_id == user_id)
            existing_score = session.exec(statement).first()
            
            if existing_score:
                # Return cached score
                return {
                    "success": True,
                    "data": {
                        "overall_score": existing_score.overall_score,
                        "fit_knowledge": existing_score.fit_knowledge_score,
                        "style_consistency": existing_score.style_consistency_score,
                        "trend_awareness": existing_score.trend_awareness_score,
                        "level": existing_score.level,
                        "badges": existing_score.badges.get('badges', []),
                        "total_checks": existing_score.total_checks,
                        "last_calculated": existing_score.last_calculated.isoformat()
                    }
                }
            else:
                # Calculate new score
                calculator = FashionIQCalculator(session)
                iq_data = calculator.calculate_overall_iq(user_id)
                calculator.save_iq_score(user_id, iq_data)
                
                return {
                    "success": True,
                    "data": {
                        "overall_score": iq_data['overall_score'],
                        "fit_knowledge": iq_data['fit_knowledge'],
                        "style_consistency": iq_data['style_consistency'],
                        "trend_awareness": iq_data['trend_awareness'],
                        "level": iq_data['level'],
                        "badges": iq_data['badges'],
                        "total_checks": iq_data['total_checks']
                    }
                }
        except Exception as e:
            logger.error(f"Error getting Fashion IQ for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    
    @app.get("/api/v1/fashion-iq/leaderboard")
    async def get_leaderboard(
        limit: int = 10,
        city: Optional[str] = None,
        session: Session = Depends(get_session)
    ):
        """Get top users by Fashion IQ score"""
        try:
            from fashion_iq_models import FashionIQScore
            
            # Query top scores
            statement = select(FashionIQScore).order_by(FashionIQScore.overall_score.desc()).limit(limit)
            top_scores = session.exec(statement).all()
            
            leaderboard = []
            for idx, score in enumerate(top_scores, 1):
                # Get user info
                user_statement = select(User).where(User.id == score.user_id)
                user = session.exec(user_statement).first()
                
                leaderboard.append({
                    "rank": idx,
                    "user_id": score.user_id,
                    "user_name": user.full_name if user else "Anonymous",
                    "overall_score": score.overall_score,
                    "level": score.level,
                    "total_checks": score.total_checks
                })
            
            return {
                "success": True,
                "leaderboard": leaderboard,
                "total_users": len(leaderboard)
            }
        except Exception as e:
            logger.error(f"Error getting leaderboard: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    
    @app.post("/api/v1/fashion-iq/recalculate/{user_id}")
    async def recalculate_iq(
        user_id: int,
        session: Session = Depends(get_session)
    ):
        """Manually trigger IQ recalculation"""
        try:
            from integrations.fashion_iq_calculator import FashionIQCalculator
            
            calculator = FashionIQCalculator(session)
            iq_data = calculator.calculate_overall_iq(user_id)
            calculator.save_iq_score(user_id, iq_data)
            
            return {
                "success": True,
                "message": "Fashion IQ recalculated successfully",
                "data": {
                    "overall_score": iq_data['overall_score'],
                    "level": iq_data['level']
                }
            }
        except Exception as e:
            logger.error(f"Error recalculating IQ for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))
