"""
Refresh Token Request Model
"""
from pydantic import BaseModel


class RefreshTokenRequest(BaseModel):
    refresh_token: str

