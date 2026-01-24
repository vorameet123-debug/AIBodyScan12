"""
Configuration constants and default values for the Fit Checker API
Centralizes hardcoded values for easier maintenance and adjustment
"""

# Default values for fit check responses when AI analysis fails
FIT_CHECK_DEFAULTS = {
    "roast": {
        "fit_roast": "The fit seems... interesting.",
        "verdict_stamp": "UNCERTAIN",
        "stamp_color": "gray"
    },
    "color": {
        "match_score": 50,
        "roast": "Colors are subjective, but take a second look.",
        "suggested_colors": [],
        "primary_color": {
            "name": "Detected",
            "rgb": {"r": 128, "g": 128, "b": 128}
        }
    },
    "style": {
        "outfit_suggestions": [],
        "style_score": 70
    },
    "occasion": {
        "occasion_match_score": 50,
        "is_appropriate": True,
        "recommendation": "Wear it if you feel confident!",
        "alternative_occasions": []
    },
    "material_comfort": {
        "score": 8,
        "description": "Standard comfort"
    },
    "fit_meters_fallback": {
        "fit_meters": {},
        "overall_fit_score": 0,
        "worst_metric": "none"
    }
}

# File upload constraints
FILE_UPLOAD_LIMITS = {
    "max_size_mb": 10,
    "allowed_extensions": ["jpg", "jpeg", "png", "webp"],
    "max_size_string_length": 10,
    "max_occasion_string_length": 50
}

# Fit type options
VALID_FIT_TYPES = ["slim", "regular", "loose"]
DEFAULT_FIT_TYPE = "slim"

# API configuration
API_CONFIG = {
    "default_timeout_seconds": 30,
    "max_retries": 3,
    "retry_delay_seconds": 1,
    "retry_exponential_base": 2  # Exponential backoff multiplier
}