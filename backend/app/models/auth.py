"""Authentication models for families, users, and sessions."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


def utcnow() -> datetime:
    """Get current UTC datetime."""
    return datetime.utcnow()


def new_uuid() -> str:
    """Generate new UUID string."""
    return str(uuid.uuid4())


class Family(Base):
    """Family model representing a household."""
    
    __tablename__ = "families"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), nullable=False, default="UTC")
    settings_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    
    # Relationships
    users: Mapped[list["User"]] = relationship("User", back_populates="family")


class User(Base):
    """User model for family members."""
    
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    family_id: Mapped[str] = mapped_column(String, ForeignKey("families.id"), nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # admin, co_admin, teen, child, guest
    avatar_type: Mapped[str] = mapped_column(String(20), nullable=False, default="emoji")  # emoji, photo, initials
    avatar_value: Mapped[str] = mapped_column(String(255), nullable=False, default="👤")
    color_hex: Mapped[str] = mapped_column(String(7), nullable=False, default="#4F46E5")
    ui_mode: Mapped[str] = mapped_column(String(20), nullable=False, default="standard")  # standard, child, kiosk
    pin_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    settings_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    family: Mapped["Family"] = relationship("Family", back_populates="users")
    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="user")


class Session(Base):
    """Session model for tracking user authentication tokens."""
    
    __tablename__ = "sessions"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    device_hint: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="sessions")
