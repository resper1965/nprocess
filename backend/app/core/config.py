"""Application configuration using Pydantic Settings."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # GCP Configuration
    gcp_project_id: str = ""
    gcp_region: str = "us-central1"
    cloud_tasks_queue: str = ""
    cloud_tasks_location: str | None = None
    cloud_tasks_service_url: str = ""
    cloud_tasks_task_secret: str = ""

    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False

    # CORS Configuration
    cors_origins: str = "http://localhost:3000,https://nprocess-web-1040576944774.us-central1.run.app"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.replace(";", ",").split(",")]

    @property
    def cloud_tasks_location_resolved(self) -> str:
        """Resolve Cloud Tasks location, defaulting to gcp_region."""
        return self.cloud_tasks_location or self.gcp_region


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
