from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    app_host: str = "127.0.0.1"
    app_port: int = 8000
    database_url: str = "sqlite:///./data/doctranslate.db"
    storage_root: str = "./storage"
    owner_key: str = "local_owner"
    max_file_size_bytes: int = 26_214_400
    max_jobs_per_day: int = 10
    preview_ttl_seconds: int = 300

    # Oracle AI settings
    ai_provider: str = "fake"  # "fake" or "oracle"
    oracle_config_path: str = "~/.oci/config"
    oracle_config_profile: str = "ADMIN"
    oracle_endpoint: str = "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com"
    oracle_model_id: str = "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyapnibwg42qjhwaxrlqfpreueirtwghiwvv2whsnwmnlva"
    oracle_compartment_id: str | None = None
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
