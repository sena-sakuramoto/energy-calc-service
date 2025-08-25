import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Energy Calculation API"
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    default_tariff_per_kwh: float = 25.0
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(",")]
        return self.cors_origins


settings = Settings()