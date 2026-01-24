"""
Purchase Tracking API Routes
Handles marking items as purchased and setting purchase intent
"""
from typing import Optional
from fastapi import HTTPException, Depends
from sqlmodel import Session, select
from loguru import logger
from datetime import datetime


def register_purchase_routes(app, get_session):
    """Register purchase tracking routes with the FastAPI app"""
    
    @app.post("/api/v1/wardrobe/mark-purchased/{check_id}")
    async def mark_as_purchased(
        check_id: int,
        purchased: bool,
        session: Session = Depends(get_session)
    ):
        """Mark a fit check item as purchased or not"""
        try:
            from fashion_iq_models import FitCheckHistory
            
            # Get the fit check record
            statement = select(FitCheckHistory).where(FitCheckHistory.id == check_id)
            fit_check = session.exec(statement).first()
            
            if not fit_check:
                raise HTTPException(status_code=404, detail="Fit check not found")
            
            # Update purchase status
            fit_check.purchased = purchased
            if purchased:
                fit_check.purchased_at = datetime.utcnow()
            else:
                fit_check.purchased_at = None
            
            session.add(fit_check)
            session.commit()
            session.refresh(fit_check)
            
            logger.info(f"Marked fit check {check_id} as {'purchased' if purchased else 'not purchased'}")
            
            return {
                "success": True,
                "message": f"Item marked as {'purchased' if purchased else 'not purchased'}",
                "check_id": check_id,
                "purchased": purchased
            }
        except Exception as e:
            logger.error(f"Error marking purchase status: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    
    @app.post("/api/v1/wardrobe/purchase-intent/{check_id}")
    async def set_purchase_intent(
        check_id: int,
        intent: str,  # "yes", "maybe", "no"
        session: Session = Depends(get_session)
    ):
        """Set purchase intent for a fit check item"""
        try:
            from fashion_iq_models import FitCheckHistory
            
            # Validate intent
            if intent not in ["yes", "maybe", "no"]:
                raise HTTPException(status_code=400, detail="Intent must be 'yes', 'maybe', or 'no'")
            
            # Get the fit check record
            statement = select(FitCheckHistory).where(FitCheckHistory.id == check_id)
            fit_check = session.exec(statement).first()
            
            if not fit_check:
                raise HTTPException(status_code=404, detail="Fit check not found")
            
            # Update purchase intent
            fit_check.purchase_intent = intent
            
            # If intent is "yes", optionally mark as purchased
            if intent == "yes":
                fit_check.purchased = True
                fit_check.purchased_at = datetime.utcnow()
            
            session.add(fit_check)
            session.commit()
            session.refresh(fit_check)
            
            logger.info(f"Set purchase intent for fit check {check_id} to '{intent}'")
            
            return {
                "success": True,
                "message": f"Purchase intent set to '{intent}'",
                "check_id": check_id,
                "intent": intent,
                "purchased": fit_check.purchased
            }
        except Exception as e:
            logger.error(f"Error setting purchase intent: {e}")
            raise HTTPException(status_code=500, detail=str(e))
