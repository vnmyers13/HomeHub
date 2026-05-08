"""Authentication router for setup, login, and session management."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.security import (
    check_pin_rate_limit,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from ..models.auth import Family, User
from ..schemas.auth import (
    LoginRequest,
    PinLoginRequest,
    SetupRequest,
    SetupStatusResponse,
    UserResponse,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/setup/status", response_model=SetupStatusResponse)
async def get_setup_status(db: AsyncSession = Depends(get_db)) -> SetupStatusResponse:
    """
    Check if initial setup has been completed.
    
    Returns:
        SetupStatusResponse: Whether setup is complete
    """
    try:
        result = await db.execute(select(func.count(Family.id)))
        family_count = result.scalar_one()
        return SetupStatusResponse(setup_complete=family_count > 0)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check setup status: {str(e)}",
        ) from e


@router.post("/setup", response_model=UserResponse)
async def setup_family(
    request: SetupRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Initialize the family and create the first admin user.
    
    Args:
        request: Setup request with family and admin details
        response: FastAPI response object for setting cookies
        db: Database session
        
    Returns:
        UserResponse: Created admin user
        
    Raises:
        HTTPException: If family already exists or setup fails
    """
    try:
        # Check if family already exists
        result = await db.execute(select(func.count(Family.id)))
        family_count = result.scalar_one()
        
        if family_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Setup already completed. Family already exists.",
            )
        
        # Create family
        family = Family(
            name=request.family_name,
            timezone=request.timezone,
        )
        db.add(family)
        await db.flush()
        
        # Create admin user
        admin_user = User(
            family_id=family.id,
            display_name=request.admin_display_name,
            role="admin",
            password_hash=hash_password(request.admin_password),
        )
        db.add(admin_user)
        await db.flush()
        
        # Create access token
        access_token = create_access_token(admin_user.id)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="strict",
            secure=True,
            max_age=2592000,  # 30 days
        )
        
        await db.commit()
        await db.refresh(admin_user)
        
        return UserResponse.model_validate(admin_user)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Setup failed: {str(e)}",
        ) from e


@router.post("/login", response_model=UserResponse)
async def login(
    request: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Authenticate user with display name and password.
    
    Args:
        request: Login credentials
        response: FastAPI response object for setting cookies
        db: Database session
        
    Returns:
        UserResponse: Authenticated user
        
    Raises:
        HTTPException: If credentials are invalid
    """
    try:
        # Find user by display name (case-insensitive)
        result = await db.execute(
            select(User).where(
                func.lower(User.display_name) == request.display_name.lower(),
                User.is_deleted == False,
            )
        )
        user = result.scalar_one_or_none()
        
        if not user or not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        
        # Verify password
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        
        # Update last login time
        user.last_login_at = datetime.utcnow()
        
        # Create access token
        access_token = create_access_token(user.id)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="strict",
            secure=True,
            max_age=2592000,  # 30 days
        )
        
        await db.commit()
        await db.refresh(user)
        
        return UserResponse.model_validate(user)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        ) from e


@router.post("/login/pin", response_model=UserResponse)
async def login_with_pin(
    request: PinLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Authenticate user with PIN.
    
    Args:
        request: PIN login credentials
        response: FastAPI response object for setting cookies
        db: Database session
        
    Returns:
        UserResponse: Authenticated user
        
    Raises:
        HTTPException: If PIN is invalid or rate limit exceeded
    """
    try:
        # Check rate limit
        check_pin_rate_limit(request.user_id)
        
        # Find user
        result = await db.execute(
            select(User).where(
                User.id == request.user_id,
                User.is_deleted == False,
            )
        )
        user = result.scalar_one_or_none()
        
        if not user or not user.pin_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid PIN",
            )
        
        # Verify PIN
        if not verify_password(request.pin, user.pin_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid PIN",
            )
        
        # Update last login time
        user.last_login_at = datetime.utcnow()
        
        # Create access token
        access_token = create_access_token(user.id)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="strict",
            secure=True,
            max_age=2592000,  # 30 days
        )
        
        await db.commit()
        await db.refresh(user)
        
        return UserResponse.model_validate(user)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PIN login failed: {str(e)}",
        ) from e


@router.post("/logout")
async def logout(response: Response) -> dict:
    """
    Log out the current user by clearing the session cookie.
    
    Args:
        response: FastAPI response object for clearing cookies
        
    Returns:
        Success message
    """
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        samesite="strict",
        secure=True,
        max_age=0,  # Expire immediately
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Get the current authenticated user's information.
    
    Args:
        current_user: Current authenticated user from dependency
        
    Returns:
        UserResponse: Current user data
    """
    return UserResponse.model_validate(current_user)
