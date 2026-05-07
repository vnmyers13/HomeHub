"""User model."""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class User(Base):
    """User model for family members."""
    
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    family_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # admin, co_admin, teen, child, guest
    pin_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    color_hex: Mapped[str] = mapped_column(String(7), nullable=False, default="#4F46E5")
    avatar_type: Mapped[str] = mapped_column(String(20), nullable=False, default="emoji")  # emoji, photo, initials
    avatar_value: Mapped[str] = mapped_column(String(255), nullable=False, default="👤")
    ui_mode: Mapped[str] = mapped_column(String(20), nullable=False, default="standard")  # standard, child, kiosk
    settings_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string for user preferences
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
