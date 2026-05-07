"""Application Settings Configuration."""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "HomeHub"
    app_version: str = "0.1.0"
    app_description: str = "Smart Home Management System"
    app_env: str = "development"
    app_debug: bool = True

    # Database
    database_url: str = "sqlite+aiosqlite:///data/db/homehub.db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = "your-jwt-secret-key-here-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # CORS
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
    ]

    # File Upload
    max_upload_size_mb: int = 10
    allowed_file_types: list[str] = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
    ]

    # Email (Optional)
    smtp_server: str | None = None
    smtp_port: int | None = None
    smtp_user: str | None = None
    smtp_password: str | None = None
    email_from: str | None = None


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
