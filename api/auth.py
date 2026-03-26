import os
from datetime import UTC, datetime, timedelta

from db import User, get_session
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

# Load environment variables
load_dotenv()

# JWT Configuration from environment
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY must be set in environment variables")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))  # 30 days

# Use argon2 instead of bcrypt (no 72-byte limit)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(user_id: int, session: Session) -> str:
    """
    Create a refresh token for a user and store it in the database
    
    Args:
        user_id: User ID to create token for
        session: Database session
        
    Returns:
        Refresh token string
    """
    import secrets

    from db import RefreshToken

    # Generate a secure random token
    token = secrets.token_urlsafe(32)

    # Set expiration
    expires_at = datetime.now(UTC) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    # Store in database
    refresh_token = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    session.add(refresh_token)
    session.commit()

    return token


def verify_refresh_token(token: str, session: Session) -> int | None:
    """
    Verify a refresh token and return the user ID if valid
    
    Args:
        token: Refresh token to verify
        session: Database session
        
    Returns:
        User ID if token is valid, None otherwise
    """
    from db import RefreshToken

    # Find token in database
    db_token = session.exec(
        select(RefreshToken).where(
            RefreshToken.token == token,
            RefreshToken.revoked == False
        )
    ).first()

    if not db_token:
        return None

    # Check if expired
    if db_token.expires_at < datetime.now(UTC):
        return None

    return db_token.user_id


def revoke_refresh_token(token: str, session: Session) -> bool:
    """
    Revoke a refresh token
    
    Args:
        token: Refresh token to revoke
        session: Database session
        
    Returns:
        True if token was revoked, False otherwise
    """
    from db import RefreshToken

    db_token = session.exec(
        select(RefreshToken).where(RefreshToken.token == token)
    ).first()

    if not db_token:
        return False

    db_token.revoked = True
    session.add(db_token)
    session.commit()
    return True


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_user_optional(
    request: Request,
    session: Session = Depends(get_session),
) -> User | None:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user = session.exec(select(User).where(User.email == email)).first()
        return user
    except JWTError:
        return None


