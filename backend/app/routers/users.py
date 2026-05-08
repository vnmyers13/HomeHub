"""Users router for user management and avatar uploads."""

import os
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..core.security import get_current_user, hash_password, require_role
from ..models.auth import User
from ..schemas.auth import UserResponse
from ..schemas.users import CreateUserRequest, PatchUserRequest, PublicUserResponse
from ..services.users import generate_thumbnail

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/public", response_model=List[PublicUserResponse])
async def get_public_users(db: AsyncSession = Depends(get_db)) -> List[PublicUserResponse]:
    """
    Get public user information for login screen (no authentication required).
    
    Returns only non-sensitive fields: id, display_name, avatar_type, avatar_value, color_hex.
    Never returns pin_hash or password_hash.
    
    Args:
        db: Database session
        
    Returns:
        List of public user information
    """
    try:
        result = await db.execute(
            select(User).where(User.is_deleted == False).order_by(User.created_at)
        )
        users = result.scalars().all()
        return [PublicUserResponse.model_validate(user) for user in users]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}",
        ) from e


@router.get("/", response_model=List[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[UserResponse]:
    """
    Get all users in the family (requires authentication).
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        List of all non-deleted users
    """
    try:
        result = await db.execute(
            select(User).where(
                User.family_id == current_user.family_id,
                User.is_deleted == False,
            ).order_by(User.created_at)
        )
        users = result.scalars().all()
        return [UserResponse.model_validate(user) for user in users]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}",
        ) from e


@router.post("/", response_model=UserResponse)
async def create_user(
    request: CreateUserRequest,
    current_user: User = Depends(require_role("admin", "co_admin")),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Create a new user (requires admin or co_admin role).
    
    Args:
        request: User creation request
        current_user: Current authenticated user (must be admin or co_admin)
        db: Database session
        
    Returns:
        Created user
    """
    try:
        # Create user
        new_user = User(
            family_id=current_user.family_id,
            display_name=request.display_name,
            role=request.role,
            color_hex=request.color_hex,
            ui_mode=request.ui_mode,
            avatar_type=request.avatar_type,
            avatar_value=request.avatar_value,
            pin_hash=hash_password(request.pin) if request.pin else None,
            password_hash=hash_password(request.password) if request.password else None,
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        return UserResponse.model_validate(new_user)
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}",
        ) from e


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    request: PatchUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Update a user (own profile or admin).
    
    Users can update their own profile.
    Admins and co_admins can update any user.
    
    Args:
        user_id: User ID to update
        request: Update request with optional fields
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated user
        
    Raises:
        HTTPException: If user not found or insufficient permissions
    """
    try:
        # Fetch user to update
        result = await db.execute(
            select(User).where(User.id == user_id, User.is_deleted == False)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Check permissions: own profile or admin/co_admin
        if user.id != current_user.id and current_user.role not in ("admin", "co_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to update this user",
            )
        
        # Update fields
        if request.display_name is not None:
            user.display_name = request.display_name
        if request.role is not None:
            user.role = request.role
        if request.color_hex is not None:
            user.color_hex = request.color_hex
        if request.ui_mode is not None:
            user.ui_mode = request.ui_mode
        if request.avatar_type is not None:
            user.avatar_type = request.avatar_type
        if request.avatar_value is not None:
            user.avatar_value = request.avatar_value
        if request.pin is not None:
            user.pin_hash = hash_password(request.pin)
        if request.password is not None:
            user.password_hash = hash_password(request.password)
        
        await db.commit()
        await db.refresh(user)
        
        return UserResponse.model_validate(user)
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}",
        ) from e


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_role("admin", "co_admin")),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Soft delete a user (requires admin or co_admin role).
    
    Cannot delete own account.
    
    Args:
        user_id: User ID to delete
        current_user: Current authenticated user (must be admin or co_admin)
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If user not found or trying to delete self
    """
    try:
        # Cannot delete self
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account",
            )
        
        # Fetch user to delete
        result = await db.execute(
            select(User).where(User.id == user_id, User.is_deleted == False)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Soft delete
        user.is_deleted = True
        
        await db.commit()
        
        return {"message": "User deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}",
        ) from e


@router.post("/{user_id}/avatar")
async def upload_avatar(
    user_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Upload and process user avatar image.
    
    Saves original to /data/photos/avatars/{user_id}.jpg
    Generates thumbnail to /data/photos/avatars/{user_id}_thumb.jpg at 96x96
    
    Args:
        user_id: User ID to upload avatar for
        file: Uploaded image file
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Avatar URL
        
    Raises:
        HTTPException: If user not found or insufficient permissions
    """
    try:
        # Fetch user
        result = await db.execute(
            select(User).where(User.id == user_id, User.is_deleted == False)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Check permissions: own profile or admin/co_admin
        if user.id != current_user.id and current_user.role not in ("admin", "co_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to upload avatar for this user",
            )
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image",
            )
        
        # Create avatars directory
        avatars_dir = "/data/photos/avatars"
        os.makedirs(avatars_dir, exist_ok=True)
        
        # Save original
        original_path = f"{avatars_dir}/{user_id}.jpg"
        with open(original_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Generate thumbnail
        thumb_path = f"{avatars_dir}/{user_id}_thumb.jpg"
        await generate_thumbnail(original_path, thumb_path, size=(96, 96))
        
        # Update user avatar settings
        user.avatar_type = "photo"
        user.avatar_value = f"/photos/avatars/{user_id}_thumb.jpg"
        
        await db.commit()
        
        return {"url": f"/photos/avatars/{user_id}_thumb.jpg"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}",
        ) from e
