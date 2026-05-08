"""Authentication schemas for request/response models."""

from pydantic import BaseModel, ConfigDict, Field


class SetupRequest(BaseModel):
    """Request model for initial family setup."""
    
    family_name: str = Field(min_length=1, max_length=200)
    timezone: str
    admin_display_name: str = Field(min_length=1, max_length=100)
    admin_password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    """Request model for password-based login."""
    
    display_name: str
    password: str


class PinLoginRequest(BaseModel):
    """Request model for PIN-based login."""
    
    user_id: str
    pin: str = Field(min_length=4, max_length=8)


class UserResponse(BaseModel):
    """Response model for user data."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    display_name: str
    role: str
    color_hex: str
    ui_mode: str
    avatar_type: str
    avatar_value: str
    family_id: str


class SetupStatusResponse(BaseModel):
    """Response model for setup status check."""
    
    setup_complete: bool
