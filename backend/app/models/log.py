"""Log model - placeholder for future use."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class Log(Base):
    """Log model for system events and audit trail."""
    
    __tablename__ = "logs"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    level: Mapped[str] = mapped_column(String(20), nullable=False)  # info, warning, error, critical
    message: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)  # module or component name
    user_id: Mapped[str] = mapped_column(String, nullable=True)  # optional user context
    metadata_json: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string for additional context
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
