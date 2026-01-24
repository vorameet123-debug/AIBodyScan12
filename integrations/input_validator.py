"""
Input validation utilities for AI prompts and user inputs
Prevents injection attacks and ensures data integrity
"""
import re
from typing import Optional
from loguru import logger


class InputValidator:
    """Validates and sanitizes user inputs for AI prompts"""
    
    # Maximum lengths for different input types
    MAX_SEASON_LENGTH = 50
    MAX_CATEGORY_LENGTH = 50
    MAX_ITEM_NAME_LENGTH = 100
    
    # Allowed patterns
    SEASON_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-]+$')
    CATEGORY_PATTERN = re.compile(r'^[a-zA-Z\s\-]+$')
    ITEM_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-\'\"]+$')
    
    @staticmethod
    def sanitize_season(season: Optional[str]) -> Optional[str]:
        """
        Sanitize season input
        
        Args:
            season: Season string to validate
            
        Returns:
            Sanitized season string or None if invalid
        """
        if not season:
            return None
            
        season = season.strip()
        
        # Check length
        if len(season) > InputValidator.MAX_SEASON_LENGTH:
            logger.warning(f"Season input too long: {len(season)} chars")
            return None
        
        # Check pattern
        if not InputValidator.SEASON_PATTERN.match(season):
            logger.warning(f"Invalid season pattern: {season}")
            return None
            
        return season
    
    @staticmethod
    def sanitize_category(category: Optional[str]) -> Optional[str]:
        """
        Sanitize category input
        
        Args:
            category: Category string to validate
            
        Returns:
            Sanitized category string or None if invalid
        """
        if not category:
            return None
            
        category = category.strip()
        
        # Check length
        if len(category) > InputValidator.MAX_CATEGORY_LENGTH:
            logger.warning(f"Category input too long: {len(category)} chars")
            return None
        
        # Check pattern
        if not InputValidator.CATEGORY_PATTERN.match(category):
            logger.warning(f"Invalid category pattern: {category}")
            return None
            
        return category
    
    @staticmethod
    def sanitize_item_name(item_name: Optional[str]) -> Optional[str]:
        """
        Sanitize item name input
        
        Args:
            item_name: Item name string to validate
            
        Returns:
            Sanitized item name string or None if invalid
        """
        if not item_name:
            return None
            
        item_name = item_name.strip()
        
        # Check length
        if len(item_name) > InputValidator.MAX_ITEM_NAME_LENGTH:
            logger.warning(f"Item name input too long: {len(item_name)} chars")
            return None
        
        # Check pattern
        if not InputValidator.ITEM_PATTERN.match(item_name):
            logger.warning(f"Invalid item name pattern: {item_name}")
            return None
            
        return item_name
    
    @staticmethod
    def validate_prompt_safety(prompt: str) -> bool:
        """
        Check if a prompt contains potentially dangerous patterns
        
        Args:
            prompt: The prompt to validate
            
        Returns:
            True if safe, False if potentially dangerous
        """
        # Check for common injection patterns
        dangerous_patterns = [
            r'ignore\s+previous\s+instructions',
            r'disregard\s+all\s+previous',
            r'forget\s+everything',
            r'system\s*:',
            r'<\s*script',
            r'javascript:',
            r'eval\s*\(',
        ]
        
        prompt_lower = prompt.lower()
        for pattern in dangerous_patterns:
            if re.search(pattern, prompt_lower):
                logger.warning(f"Potentially dangerous pattern detected in prompt: {pattern}")
                return False
        
        return True
