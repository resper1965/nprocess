"""
Configuration management for ComplianceEngine API.
"""
import os
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # Application
    app_name: str = "ComplianceEngine"
    app_version: str = "1.0.0"
    app_env: str = "development"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8080

    # Google Cloud Platform
    gcp_project_id: Optional[str] = None
    google_cloud_project: Optional[str] = None

    # Vertex AI
    vertex_ai_location: str = "us-central1"
    vertex_ai_model: str = "gemini-1.5-pro"

    # Firestore
    firestore_project_id: Optional[str] = None

    # Logging
    log_level: str = "INFO"

    # CORS
    cors_origins: list = ["*"]
    cors_credentials: bool = True
    cors_methods: list = ["*"]
    cors_headers: list = ["*"]

    # API
    api_v1_prefix: str = "/v1"
    max_request_size: int = 10_000_000  # 10 MB

    # AI Service
    ai_temperature: float = 0.2
    ai_top_p: float = 0.95
    ai_top_k: int = 40
    ai_max_output_tokens: int = 8192

    # Timeouts
    ai_timeout_seconds: int = 120
    db_timeout_seconds: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    def get_project_id(self) -> str:
        """Get the GCP project ID from various sources."""
        return (
            self.gcp_project_id
            or self.google_cloud_project
            or os.getenv("GCP_PROJECT_ID")
            or os.getenv("GOOGLE_CLOUD_PROJECT")
            or ""
        )


# Singleton instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get application settings (singleton)."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
