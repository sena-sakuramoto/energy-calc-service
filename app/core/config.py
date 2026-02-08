"""Application configuration settings."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralised application settings compatible with legacy and backend code."""

    # Core application metadata
    PROJECT_NAME: str = "Energy Calculation Service"
    APP_NAME: str = "Energy Calculation API"
    ENV: str = "development"

    # API behaviour
    API_PREFIX: str = "/api/v1"

    # Security / auth
    SECRET_KEY: str = "dev-only-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite:///./energy_calc.db"

    # Feature defaults
    DEFAULT_TARIFF_PER_KWH: float = 25.0

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3003",
        "http://localhost:8000",
        "https://rakuraku-energy.archi-prisma.co.jp",
        "https://sena-sakuramoto.github.io",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Backwards-compatible helpers (legacy code expects lower-case attrs)
    # ------------------------------------------------------------------
    @property
    def app_name(self) -> str:
        return self.APP_NAME

    @property
    def env(self) -> str:
        return self.ENV

    @property
    def default_tariff_per_kwh(self) -> float:
        return self.DEFAULT_TARIFF_PER_KWH

    @property
    def cors_origins(self) -> List[str]:
        return self.CORS_ORIGINS

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS


settings = Settings()
