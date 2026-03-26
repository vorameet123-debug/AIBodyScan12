"""
Authentication Router
Handles user registration, login, token refresh, and user info endpoints
"""

from auth import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_password_hash,
    revoke_refresh_token,
    verify_password,
    verify_refresh_token,
)
from db import User, get_session
from fastapi import APIRouter, Body, Depends, HTTPException, Request

# Pydantic models
from pydantic import BaseModel
from rate_limiter import RATE_LIMITS, limiter
from sqlmodel import Session, select


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str | None = None
    phone_number: str | None = None  # For WhatsApp notifications


class LoginRequest(BaseModel):
    email: str
    password: str


# Create router
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.post("/register")
@limiter.limit("5/minute")  # Strict limit for registration - prevent account enumeration
def register_user(request: Request, payload: RegisterRequest, session: Session = Depends(get_session)):

    """Register a new user account"""
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email.strip().lower(),
        full_name=payload.full_name,
        phone_number=payload.phone_number,
        hashed_password=get_password_hash(payload.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Send verification email
    try:
        from datetime import UTC, datetime, timedelta
        from email_service import generate_token, send_verification_email
        from db import RefreshToken
        token = generate_token()
        verify_token = RefreshToken(
            user_id=user.id,
            token=f"verify_{token}",
            expires_at=datetime.now(UTC) + timedelta(hours=24),
        )
        session.add(verify_token)
        session.commit()
        send_verification_email(user.email, token)
    except Exception:
        pass  # Don't block registration if email fails

    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token(user.id, session)

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/login")
@limiter.limit(RATE_LIMITS["auth"])  # 10/minute - prevent brute force
def login(request: Request, payload: LoginRequest, session: Session = Depends(get_session)):
    """Login with email and password"""
    user = session.exec(select(User).where(User.email == payload.email.strip().lower())).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token(user.id, session)

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/me")
@limiter.limit(RATE_LIMITS["default"])  # 60/minute - normal authenticated endpoint
def read_current_user(request: Request, current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "created_at": current_user.created_at,
    }


@router.post("/refresh")
@limiter.limit(RATE_LIMITS["auth"])  # 10/minute - prevent token abuse
def refresh_access_token(request: Request, refresh_token: str = Body(..., embed=True), session: Session = Depends(get_session)):
    """
    Refresh access token using a valid refresh token
    Implements token rotation for security
    """
    # Verify the refresh token
    user_id = verify_refresh_token(refresh_token, session)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Get user
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Revoke old refresh token (rotation)
    revoke_refresh_token(refresh_token, session)

    # Create new tokens
    new_access_token = create_access_token({"sub": user.email})
    new_refresh_token = create_refresh_token(user.id, session)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token from client


@router.post("/google")
@limiter.limit("10/minute")
def google_auth(request: Request, payload: GoogleAuthRequest, session: Session = Depends(get_session)):
    """
    Authenticate with Google OAuth.
    Receives a Google ID token, verifies it, and creates/logs in the user.
    """
    import os

    try:
        from google.auth.transport import requests as google_requests
        from google.oauth2 import id_token
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="Google auth libraries not installed. Run: pip install google-auth"
        )

    # Get client ID from environment or use the configured one
    google_client_id = os.getenv(
        "GOOGLE_CLIENT_ID",
        "643891790108-lcj3pd5fllo90ai6hord7j2q44sh1c65.apps.googleusercontent.com"
    )

    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            google_client_id
        )

        # Extract user info from the verified token
        google_email = idinfo.get("email", "").strip().lower()
        google_name = idinfo.get("name", "")

        if not google_email:
            raise HTTPException(status_code=400, detail="No email found in Google token")

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

    # Check if user already exists
    user = session.exec(select(User).where(User.email == google_email)).first()

    if not user:
        # Create new user (no password needed for Google auth)
        import secrets
        user = User(
            email=google_email,
            full_name=google_name,
            hashed_password=get_password_hash(secrets.token_urlsafe(32)),  # Random password
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    # Generate tokens
    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token(user.id, session)

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    phone_number: str | None = None


@router.put("/profile")
@limiter.limit(RATE_LIMITS["default"])
def update_profile(
    request: Request,
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update user profile information"""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.phone_number is not None:
        current_user.phone_number = payload.phone_number.strip() or None

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone_number": current_user.phone_number,
    }


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/change-password")
@limiter.limit("5/minute")
def change_password(
    request: Request,
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Change user password"""
    # Verify current password
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.hashed_password = get_password_hash(payload.new_password)
    session.add(current_user)
    session.commit()

    return {"message": "Password changed successfully"}


# ─── Forgot / Reset Password ───────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    session: Session = Depends(get_session),
):
    """Send password reset email"""
    from datetime import UTC, datetime, timedelta
    from email_service import generate_token, send_password_reset_email

    # Always return success to prevent email enumeration
    user = session.exec(select(User).where(User.email == payload.email.lower().strip())).first()
    if not user:
        return {"message": "If an account with that email exists, a reset link has been sent."}

    # Generate reset token
    token = generate_token()
    expires_at = datetime.now(UTC) + timedelta(hours=1)

    # Store token (reuse RefreshToken table with a prefix)
    from db import RefreshToken
    reset_token = RefreshToken(
        user_id=user.id,
        token=f"reset_{token}",
        expires_at=expires_at,
    )
    session.add(reset_token)
    session.commit()

    # Send email
    send_password_reset_email(user.email, token)

    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(
    request: Request,
    payload: ResetPasswordRequest,
    session: Session = Depends(get_session),
):
    """Reset password using token from email"""
    from datetime import UTC, datetime

    from db import RefreshToken

    # Find token
    db_token = session.exec(
        select(RefreshToken).where(
            RefreshToken.token == f"reset_{payload.token}",
            RefreshToken.revoked == False,
        )
    ).first()

    if not db_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    # Check expiry
    expires_at = db_token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if expires_at < datetime.now(UTC):
        raise HTTPException(status_code=400, detail="Reset token has expired")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Update password
    user = session.exec(select(User).where(User.id == db_token.user_id)).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    user.hashed_password = get_password_hash(payload.new_password)
    session.add(user)

    # Revoke the reset token
    db_token.revoked = True
    session.add(db_token)
    session.commit()

    return {"message": "Password reset successfully. You can now log in with your new password."}


# ─── Email Verification ────────────────────────────────────

class VerifyEmailRequest(BaseModel):
    token: str


@router.post("/verify-email")
@limiter.limit("10/minute")
def verify_email(
    request: Request,
    payload: VerifyEmailRequest,
    session: Session = Depends(get_session),
):
    """Verify user email via token from email link."""
    from datetime import UTC, datetime
    from db import RefreshToken

    db_token = session.exec(
        select(RefreshToken).where(
            RefreshToken.token == f"verify_{payload.token}",
            RefreshToken.revoked == False,
        )
    ).first()

    if not db_token:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")

    expires_at = db_token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if expires_at < datetime.now(UTC):
        raise HTTPException(status_code=400, detail="Verification link has expired")

    user = session.exec(select(User).where(User.id == db_token.user_id)).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    user.email_verified = True
    session.add(user)
    db_token.revoked = True
    session.add(db_token)
    session.commit()

    return {"message": "Email verified successfully!"}


@router.post("/resend-verification")
@limiter.limit("3/minute")
def resend_verification(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Resend verification email."""
    if current_user.email_verified:
        return {"message": "Email already verified"}

    from datetime import UTC, datetime, timedelta
    from email_service import generate_token, send_verification_email
    from db import RefreshToken

    token = generate_token()
    verify_token = RefreshToken(
        user_id=current_user.id,
        token=f"verify_{token}",
        expires_at=datetime.now(UTC) + timedelta(hours=24),
    )
    session.add(verify_token)
    session.commit()
    send_verification_email(current_user.email, token)

    return {"message": "Verification email sent"}


# ─── Account Deletion ──────────────────────────────────────

@router.delete("/account")
@limiter.limit("3/minute")
def delete_account(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Permanently delete user account and all associated data."""
    from db import RefreshToken, MeasurementRecord

    user_id = current_user.id

    # Delete all refresh tokens
    tokens = session.exec(select(RefreshToken).where(RefreshToken.user_id == user_id)).all()
    for t in tokens:
        session.delete(t)

    # Delete all measurement records
    records = session.exec(select(MeasurementRecord).where(MeasurementRecord.user_id == user_id)).all()
    for r in records:
        session.delete(r)

    # Delete the user
    session.delete(current_user)
    session.commit()

    return {"message": "Account deleted successfully. All data has been permanently removed."}
