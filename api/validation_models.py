"""
Pydantic Validation Models with Strict Mode
Enhanced request/response validation for security and data integrity
"""
import re
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Strict mode configuration for all models
STRICT_MODEL_CONFIG = ConfigDict(
    strict=True,  # Enforce type coercion rules
    str_strip_whitespace=True,  # Strip whitespace from strings
    str_min_length=1,  # No empty strings (unless Optional)
    validate_default=True,  # Validate default values
    extra="forbid",  # Reject extra fields not in model
    frozen=False,  # Allow mutation (set True for immutable)
)


# Common validation patterns
class ValidationPatterns:
    """Common regex patterns for validation"""
    EMAIL = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PHONE = re.compile(r'^\+?[1-9]\d{9,14}$')  # E.164 format
    ALPHANUMERIC = re.compile(r'^[a-zA-Z0-9\s\-_]+$')
    SIZE_CODE = re.compile(r'^(XXS|XS|S|M|L|XL|XXL|XXXL|\d{1,3})$', re.IGNORECASE)
    SAFE_STRING = re.compile(r'^[a-zA-Z0-9\s\-_.,!?\'"()]+$')


# ====== Authentication Models (Strict) ======

class StrictRegisterRequest(BaseModel):
    """Strict registration request validation"""
    model_config = STRICT_MODEL_CONFIG

    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str | None = Field(None, max_length=100)
    phone_number: str | None = Field(None, max_length=20)

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not ValidationPatterns.EMAIL.match(v):
            raise ValueError('Invalid email format')
        return v.lower()

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v

    @field_validator('phone_number')
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None:
            return v
        # Remove spaces and dashes for validation
        cleaned = re.sub(r'[\s\-]', '', v)
        if not ValidationPatterns.PHONE.match(cleaned):
            raise ValueError('Invalid phone number format. Use E.164 format: +1234567890')
        return cleaned


class StrictLoginRequest(BaseModel):
    """Strict login request validation"""
    model_config = STRICT_MODEL_CONFIG

    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.lower().strip()


# ====== Payment Models (Strict) ======

class StrictCreateOrderRequest(BaseModel):
    """Strict payment order creation validation"""
    model_config = STRICT_MODEL_CONFIG

    plan_id: str = Field(..., pattern=r'^(pro|enterprise)$')
    billing_cycle: str = Field(..., pattern=r'^(monthly|yearly)$')


class StrictVerifyPaymentRequest(BaseModel):
    """Strict payment verification validation"""
    model_config = STRICT_MODEL_CONFIG

    razorpay_order_id: str = Field(..., min_length=10, max_length=50)
    razorpay_payment_id: str = Field(..., min_length=10, max_length=50)
    razorpay_signature: str = Field(..., min_length=64, max_length=128)
    plan_id: str = Field(..., pattern=r'^(pro|enterprise)$')
    billing_cycle: str = Field(..., pattern=r'^(monthly|yearly)$')

    @field_validator('razorpay_order_id')
    @classmethod
    def validate_order_id(cls, v: str) -> str:
        if not v.startswith('order_'):
            raise ValueError('Invalid Razorpay order ID format')
        return v

    @field_validator('razorpay_payment_id')
    @classmethod
    def validate_payment_id(cls, v: str) -> str:
        if not v.startswith('pay_'):
            raise ValueError('Invalid Razorpay payment ID format')
        return v


# ====== Clothing Analysis Models (Strict) ======

class StrictClothingFitRequest(BaseModel):
    """Strict clothing fit check validation"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_default=True,
        extra="ignore",  # Allow extra fields for flexibility
    )

    measurement_id: int = Field(..., gt=0)
    size: str | None = Field(None, max_length=10)
    occasion: str | None = Field(None, max_length=100)
    fit_type: str = Field("slim", pattern=r'^(slim|regular|loose|relaxed)$')

    @field_validator('size')
    @classmethod
    def validate_size(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.upper().strip()
        if not ValidationPatterns.SIZE_CODE.match(v):
            raise ValueError('Invalid size format. Use XS, S, M, L, XL, XXL or numeric sizes')
        return v

    @field_validator('occasion')
    @classmethod
    def validate_occasion(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not ValidationPatterns.SAFE_STRING.match(v):
            raise ValueError('Occasion contains invalid characters')
        return v


# ====== Measurement Models (Strict) ======

class StrictSaveMeasurementRequest(BaseModel):
    """Strict measurement save validation"""
    model_config = STRICT_MODEL_CONFIG

    name: str = Field(..., min_length=1, max_length=100)
    measurement_data: dict[str, Any] = Field(...)

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not ValidationPatterns.SAFE_STRING.match(v):
            raise ValueError('Name contains invalid characters')
        return v

    @field_validator('measurement_data')
    @classmethod
    def validate_measurement_data(cls, v: dict[str, Any]) -> dict[str, Any]:
        # Ensure measurements dict is not empty
        if not v:
            raise ValueError('Measurement data cannot be empty')
        # Ensure it has required structure
        if 'measurements' not in v and not any(
            key in v for key in ['chest', 'waist', 'hips', 'height']
        ):
            raise ValueError('Measurement data must contain body measurements')
        return v


# ====== Utility Functions ======

def sanitize_string(value: str, max_length: int = 255, allow_special: bool = False) -> str:
    """
    Sanitize a string value for safe storage/processing.
    
    Args:
        value: String to sanitize
        max_length: Maximum allowed length
        allow_special: Allow special characters beyond alphanumeric
        
    Returns:
        Sanitized string
    """
    if not value:
        return ""

    # Strip whitespace
    value = value.strip()

    # Truncate to max length
    value = value[:max_length]

    # Remove or escape dangerous characters
    if not allow_special:
        value = re.sub(r'[<>"\'\r\n]', '', value)

    return value


def validate_file_type(filename: str, allowed_types: list[str]) -> bool:
    """
    Validate file type by extension.
    
    Args:
        filename: Name of the file
        allowed_types: List of allowed extensions (without dot)
        
    Returns:
        True if valid, False otherwise
    """
    if not filename:
        return False

    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    return ext in [t.lower() for t in allowed_types]

