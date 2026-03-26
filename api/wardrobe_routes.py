"""
Wardrobe Analytics API Routes
"""
from fastapi import Depends, HTTPException
from loguru import logger
from sqlmodel import Session


def register_wardrobe_routes(app, get_session):
    """Register wardrobe analytics routes"""

    @app.get("/api/v1/wardrobe/analytics/{user_id}")
    async def get_wardrobe_analytics(
        user_id: int,
        filter: str = 'all',
        session: Session = Depends(get_session)
    ):
        """Get complete wardrobe analytics"""
        try:
            from integrations.wardrobe_analytics import WardrobeAnalytics

            analytics = WardrobeAnalytics(session)
            data = analytics.get_complete_analytics(user_id, filter)

            return {
                "success": True,
                "data": data
            }
        except Exception as e:
            logger.error(f"Error getting wardrobe analytics: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/v1/wardrobe/composition/{user_id}")
    async def get_composition(
        user_id: int,
        filter: str = 'all',
        session: Session = Depends(get_session)
    ):
        """Get wardrobe composition"""
        try:
            from integrations.wardrobe_analytics import WardrobeAnalytics

            analytics = WardrobeAnalytics(session)
            data = analytics.get_wardrobe_composition(user_id, filter)

            return {"success": True, "data": data}
        except Exception as e:
            logger.error(f"Error getting composition: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/v1/wardrobe/wishlist/{user_id}")
    async def get_wishlist(user_id: int, session: Session = Depends(get_session)):
        """Get wishlist items"""
        try:
            from integrations.wardrobe_analytics import WardrobeAnalytics

            analytics = WardrobeAnalytics(session)
            data = analytics.get_wishlist_items(user_id)

            return {"success": True, "wishlist": data}
        except Exception as e:
            logger.error(f"Error getting wishlist: {e}")
            raise HTTPException(status_code=500, detail=str(e))

