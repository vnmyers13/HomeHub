"""Application configuration using pydantic-settings."""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    family_name: str = "HomeHub"
    timezone: str = "UTC"
    app_version: str = "0.1.0"

    # Security
    secret_key: str

    # Database
    database_url: str = "sqlite+aiosqlite:///../data/db/homehub.db"

    # CORS
    allowed_origins: str = "https://homehub.local"

    # Backup
    backup_retention_days: int = 30
    backup_time: str = "03:00"

    # Wall display
    wall_idle_timeout_seconds: int = 300

    @property
    def origins_list(self) -> List[str]:
        """Convert comma-separated origins to list."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
