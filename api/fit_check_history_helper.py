"""
Helper function to save fit check history for Fashion IQ
"""
from fashion_iq_models import FitCheckHistory
from loguru import logger


def save_fit_check_history(session, user_id, garment_analysis, size, size_analysis, fit_meters_result, color_data=None):
    """
    Save fit check data to FitCheckHistory table for Fashion IQ calculation
    
    Args:
        session: Database session
        user_id: User ID
        garment_analysis: Garment analysis data
        size: Selected size (or None)
        size_analysis: Size analysis results
        fit_meters_result: Fit meters calculation result
        color_data: Color analysis data (optional)
    """
    try:
        # Extract actual color from color_data if available
        actual_color = "unknown"
        if color_data and "primary_color" in color_data:
            actual_color = color_data["primary_color"].get("name", "unknown")

        # Check if item is trending
        is_trending = False
        try:
            from integrations.trend_analyzer import TrendAnalyzer
            trend_analyzer = TrendAnalyzer(session)
            garment_type = garment_analysis.get("garment_type", "unknown")
            if garment_type != "unknown":
                is_trending = trend_analyzer.is_item_trending(garment_type, days=7)
        except Exception as trend_error:
            logger.warning(f"Could not check trend status: {trend_error}")
            # Continue with is_trending=False if trend check fails

        fit_check_entry = FitCheckHistory(
            user_id=user_id,
            garment_type=garment_analysis.get("garment_type", "unknown"),
            size=size if size else size_analysis['recommended_size'],
            fit_score=fit_meters_result.get('overall_fit_score', 0),
            color=actual_color,  # Use extracted color
            style=garment_analysis.get("style", "unknown"),
            formality_level=garment_analysis.get("formality", 5),
            is_trending=is_trending,  # Now actually calculated!
            purchased=False
        )

        session.add(fit_check_entry)
        session.commit()
        session.refresh(fit_check_entry)  # Get the generated ID
        logger.info(f"✅ Saved fit check history for user {user_id}: {garment_analysis.get('garment_type')} size {size if size else size_analysis['recommended_size']} (score: {fit_meters_result.get('overall_fit_score', 0)}) [ID: {fit_check_entry.id}]")

        # Automatically recalculate Fashion IQ score
        try:
            from integrations.fashion_iq_calculator import FashionIQCalculator
            calculator = FashionIQCalculator(session)
            iq_data = calculator.calculate_overall_iq(user_id)
            calculator.save_iq_score(user_id, iq_data)
            logger.info(f"Recalculated Fashion IQ for user {user_id}: {iq_data['overall_score']} ({iq_data['level']})")
        except Exception as calc_error:
            logger.warning(f"Failed to recalculate Fashion IQ: {calc_error}")

        return fit_check_entry.id  # Return the check ID
    except Exception as e:
        logger.warning(f"❌ Failed to save fit check history: {e}")
        return False

