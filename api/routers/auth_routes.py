"""
Authentication Router
Handles user registration, login, token refresh, and user info endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlmodel import Session, select
from typing import Optional

from db import User, get_session
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    revoke_refresh_token,
    get_current_user
)

# Pydantic models
from pydantic import BaseModel


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


# Create router
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.post("/register")
def register_user(payload: RegisterRequest, session: Session = Depends(get_session)):
    """Register a new user account"""
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email.strip().lower(),
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

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
def login(payload: LoginRequest, session: Session = Depends(get_session)):
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
def read_current_user(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "created_at": current_user.created_at,
    }


@router.post("/refresh")
def refresh_access_token(refresh_token: str = Body(..., embed=True), session: Session = Depends(get_session)):
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
