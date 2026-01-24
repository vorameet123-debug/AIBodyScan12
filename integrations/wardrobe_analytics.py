"""
Wardrobe Analytics Service
Analyzes user's fit check history to provide wardrobe insights
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import Counter
from sqlmodel import Session, select
from fashion_iq_models import FitCheckHistory
from loguru import logger


class WardrobeAnalytics:
    """Analyzes wardrobe composition, colors, trends, and gaps"""
    
    ESSENTIALS = {
        'formal': ['dress_shirt', 'blazer', 'dress_pants', 'formal_shoes'],
        'casual': ['jeans', 't-shirt', 'sneakers'],
        'seasonal': ['jacket', 'coat', 'shorts']
    }
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_wardrobe_composition(self, user_id: int, filter_type: str = 'all') -> Dict:
        """
        Get wardrobe breakdown by garment type
        filter_type: 'all', 'purchased', 'wishlist'
        """
        query = select(FitCheckHistory).where(FitCheckHistory.user_id == user_id)
        
        if filter_type == 'purchased':
            query = query.where(FitCheckHistory.purchased == True)
        elif filter_type == 'wishlist':
            query = query.where(
                FitCheckHistory.purchased == False,
                FitCheckHistory.purchase_intent == 'yes'
            )
        
        checks = self.session.exec(query).all()
        
        if not checks:
            return {
                'total_items': 0,
                'by_type': {},
                'percentages': {},
                'filter_applied': filter_type
            }
        
        composition = {}
        for check in checks:
            garment_type = check.garment_type
            composition[garment_type] = composition.get(garment_type, 0) + 1
        
        total = len(checks)
        percentages = {k: round(v / total * 100, 1) for k, v in composition.items()}
        
        logger.info(f"Wardrobe composition for user {user_id} ({filter_type}): {total} items")
        
        return {
            'total_items': total,
            'by_type': composition,
            'percentages': percentages,
            'filter_applied': filter_type
        }
    
    def get_color_distribution(self, user_id: int, filter_type: str = 'all') -> Dict:
        """Get color breakdown with filtering"""
        query = select(FitCheckHistory).where(FitCheckHistory.user_id == user_id)
        
        if filter_type == 'purchased':
            query = query.where(FitCheckHistory.purchased == True)
        elif filter_type == 'wishlist':
            query = query.where(
                FitCheckHistory.purchased == False,
                FitCheckHistory.purchase_intent == 'yes'
            )
        
        checks = self.session.exec(query).all()
        
        if not checks:
            return {
                'distribution': {},
                'percentages': {},
                'dominant_color': None,
                'filter_applied': filter_type
            }
        
        colors = {}
        for check in checks:
            color = check.color or 'unknown'
            colors[color] = colors.get(color, 0) + 1
        
        total = len(checks)
        percentages = {k: round(v / total * 100, 1) for k, v in colors.items()}
        dominant = max(colors, key=colors.get) if colors else None
        
        return {
            'distribution': colors,
            'percentages': percentages,
            'dominant_color': dominant,
            'filter_applied': filter_type
        }
    
    def get_fit_score_history(self, user_id: int, days: int = 30, filter_type: str = 'all') -> List:
        """Get fit scores over time with filtering"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        query = select(FitCheckHistory).where(
            FitCheckHistory.user_id == user_id,
            FitCheckHistory.checked_at >= cutoff
        )
        
        if filter_type == 'purchased':
            query = query.where(FitCheckHistory.purchased == True)
        elif filter_type == 'wishlist':
            query = query.where(
                FitCheckHistory.purchased == False,
                FitCheckHistory.purchase_intent == 'yes'
            )
        
        checks = self.session.exec(query.order_by(FitCheckHistory.checked_at)).all()
        
        return [
            {
                'date': check.checked_at.strftime('%Y-%m-%d'),
                'score': check.fit_score,
                'garment': check.garment_type,
                'purchased': check.purchased
            }
            for check in checks
        ]
    
    def detect_wardrobe_gaps(self, user_id: int) -> List:
        """Identify missing essential items (purchased items only)"""
        query = select(FitCheckHistory).where(
            FitCheckHistory.user_id == user_id,
            FitCheckHistory.purchased == True
        )
        checks = self.session.exec(query).all()
        garment_types = [c.garment_type for c in checks]
        
        gaps = []
        
        # Check for missing essentials
        for category, items in self.ESSENTIALS.items():
            for item in items:
                if item not in garment_types:
                    gaps.append({
                        'item': item,
                        'category': category,
                        'reason': f'No {item.replace("_", " ")} in wardrobe',
                        'priority': 'high' if category == 'formal' else 'medium'
                    })
        
        return gaps
    
    def get_wishlist_items(self, user_id: int) -> List:
        """Get items not purchased with purchase_intent = 'yes' or 'maybe'"""
        query = select(FitCheckHistory).where(
            FitCheckHistory.user_id == user_id,
            FitCheckHistory.purchased == False,
            FitCheckHistory.purchase_intent.in_(['yes', 'maybe'])
        ).order_by(FitCheckHistory.fit_score.desc())
        
        wishlist = self.session.exec(query).all()
        
        return [
            {
                'id': c.id,
                'garment': c.garment_type,
                'size': c.size,
                'score': c.fit_score,
                'color': c.color,
                'checked_at': c.checked_at.strftime('%Y-%m-%d'),
                'days_ago': (datetime.utcnow() - c.checked_at).days
            }
            for c in wishlist
        ]
    
    def get_conversion_stats(self, user_id: int) -> Dict:
        """Get purchase conversion statistics"""
        all_checks = self.session.exec(
            select(FitCheckHistory).where(FitCheckHistory.user_id == user_id)
        ).all()
        
        if not all_checks:
            return {
                'total_checks': 0,
                'purchased': 0,
                'wishlist': 0,
                'conversion_rate': 0,
                'avg_purchased_score': 0
            }
        
        purchased = [c for c in all_checks if c.purchased]
        wishlist = [c for c in all_checks if (c.purchase_intent in ['yes', 'maybe']) and not c.purchased]
        
        avg_score = sum(c.fit_score for c in purchased) / len(purchased) if purchased else 0
        
        return {
            'total_checks': len(all_checks),
            'purchased': len(purchased),
            'wishlist': len(wishlist),
            'conversion_rate': round(len(purchased) / len(all_checks) * 100, 1),
            'avg_purchased_score': round(avg_score, 1)
        }
    
    def get_complete_analytics(self, user_id: int, filter_type: str = 'all') -> Dict:
        """Get all analytics in one call"""
        return {
            'composition': self.get_wardrobe_composition(user_id, filter_type),
            'colors': self.get_color_distribution(user_id, filter_type),
            'fit_history': self.get_fit_score_history(user_id, 30, filter_type),
            'gaps': self.detect_wardrobe_gaps(user_id),
            'wishlist': self.get_wishlist_items(user_id),
            'conversion': self.get_conversion_stats(user_id)
        }
