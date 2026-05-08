"""User schemas for request/response models."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PublicUserResponse(BaseModel):
    """Public user information for login screen (no sensitive data)."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    display_name: str
    avatar_type: str
    avatar_value: str
    color_hex: str


class CreateUserRequest(BaseModel):
    """Request model for creating a new user."""
    
    display_name: str = Field(min_length=1, max_length=100)
    role: str  # admin, co_admin, teen, child, guest
    color_hex: str = "#4F46E5"
    ui_mode: str = "standard"
    avatar_type: str = "emoji"
    avatar_value: str = "👤"
    pin: Optional[str] = None
    password: Optional[str] = None


class PatchUserRequest(BaseModel):
    """Request model for updating a user (all fields optional)."""
    
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[str] = None
    color_hex: Optional[str] = None
    ui_mode: Optional[str] = None
    avatar_type: Optional[str] = None
    avatar_value: Optional[str] = None
    pin: Optional[str] = None
    password: Optional[str] = None
