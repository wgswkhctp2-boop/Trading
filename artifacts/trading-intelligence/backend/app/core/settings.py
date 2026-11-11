from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: Literal["development", "production"] = Field(
        default="development",
        validation_alias="APP_ENV",
    )
    demo_mode: Literal[True] = Field(default=True, validation_alias="DEMO_MODE")
    trading_execution_enabled: Literal[False] = Field(
        default=False,
        validation_alias="TRADING_EXECUTION_ENABLED",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
