"""
Standardized error handling utilities for the Fit Checker API
Provides consistent error messages and formats across all endpoints
"""
from typing import Any

from fastapi import HTTPException
from loguru import logger


class APIError(Exception):
    """Base exception for API errors"""
    def __init__(self, message: str, status_code: int = 500, error_code: str = None, details: dict[str, Any] = None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or "INTERNAL_ERROR"
        self.details = details or {}
        super().__init__(self.message)


def handle_api_error(error: Exception, default_message: str = "An error occurred") -> HTTPException:
    """
    Convert various exceptions to standardized HTTPException
    
    Args:
        error: The exception to handle
        default_message: Default message if error type is unknown
        
    Returns:
        HTTPException with standardized format
    """
    if isinstance(error, APIError):
        logger.error(f"API Error [{error.error_code}]: {error.message}")
        return HTTPException(
            status_code=error.status_code,
            detail={
                "error": error.error_code,
                "message": error.message,
                "details": error.details
            }
        )
    elif isinstance(error, HTTPException):
        # Already an HTTPException, return as-is
        return error
    else:
        # Unknown error - log and return generic error
        logger.exception(f"Unhandled error: {error}")
        return HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_ERROR",
                "message": default_message,
                "details": {}
            }
        )


def format_error_response(error_code: str, message: str, details: dict[str, Any] | None = None) -> dict[str, Any]:
    """
    Format a standardized error response
    
    Args:
        error_code: Error code identifier
        message: Human-readable error message
        details: Additional error details
        
    Returns:
        Formatted error dictionary
    """
    return {
        "error": error_code,
        "message": message,
        "details": details or {}
    }


# Common error codes
class ErrorCodes:
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR"
    TIMEOUT_ERROR = "TIMEOUT_ERROR"
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
    PROCESSING_ERROR = "PROCESSING_ERROR"
