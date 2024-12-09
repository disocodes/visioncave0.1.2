from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Visioncave"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Database URLs
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    POSTGRES_URL: str = os.getenv("POSTGRES_URL", "postgresql://postgres:postgres@localhost:5432/visioncave")
    
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # File Storage
    UPLOAD_DIR: Path = Path("uploads")
    MODEL_DIR: Path = Path("models")
    
    # Camera Settings
    DEFAULT_FRAME_RATE: int = 30
    DEFAULT_RESOLUTION: tuple = (1280, 720)
    
    class Config:
        case_sensitive = True

settings = Settings()
