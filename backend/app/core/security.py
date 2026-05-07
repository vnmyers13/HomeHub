"""Security utilities for authentication and authorization."""

import time
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import settings
from .database import get_db

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# PIN rate limiting storage: user_id -> list of attempt timestamps
_pin_attempts: Dict[str, List[float]] = defaultdict(list)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password
        hashed_password: Hashed password
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, expires_days: int = 30) -> str:
    """
    Create a JWT access token.
    
    Args:
        user_id: User ID to encode in token
        expires_days: Number of days until token expires
        
    Returns:
        JWT token string
    """
    expire = datetime.utcnow() + timedelta(days=expires_days)
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


def check_pin_rate_limit(user_id: str) -> None:
    """
    Check if user has exceeded PIN attempt rate limit.
    
    Args:
        user_id: User ID to check
        
    Raises:
        HTTPException: If rate limit exceeded (5 attempts in 60 seconds)
    """
    now = time.time()
    cutoff = now - 60  # 60 seconds ago
    
    # Remove old attempts
    _pin_attempts[user_id] = [ts for ts in _pin_attempts[user_id] if ts > cutoff]
    
    # Check if limit exceeded
    if len(_pin_attempts[user_id]) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many PIN attempts. Please try again later.",
        )
    
    # Record this attempt
    _pin_attempts[user_id].append(now)


async def get_current_user(
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the current authenticated user from JWT token in cookie.
    
    Args:
        access_token: JWT token from cookie
        db: Database session
        
    Returns:
        User object
        
    Raises:
        HTTPException: If token is missing, invalid, or user not found
    """
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    payload = decode_token(access_token)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    # Import here to avoid circular dependency
    from ..models.user import User
    
    result = await db.execute(select(User).where(User.id == user_id, User.is_deleted == False))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user


def require_role(*roles: str):
    """
    Factory function to create a dependency that requires specific roles.
    
    Args:
        *roles: Required role names (admin, co_admin, teen, child, guest)
        
    Returns:
        Dependency function
    """
    async def role_checker(current_user = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {', '.join(roles)}",
            )
        return current_user
    
    return role_checker
