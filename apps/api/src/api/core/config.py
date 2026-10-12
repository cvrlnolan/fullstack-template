from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-driven settings. Field names are the env var names (UPPER_CASE)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=True)

    APP_VERSION: str = "0.0.0"
    ANTHROPIC_API_KEY: str | None = None
    ANTHROPIC_MODEL: str = "claude-sonnet-5-5"
    DATABASE_URL: str = "postgresql+asyncpg://app:app@localhost:5432/app"


@lru_cache
def get_settings() -> Settings:
    return Settings()
