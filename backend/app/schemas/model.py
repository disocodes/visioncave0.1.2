from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class ModelBase(BaseModel):
    name: str = Field(..., description="Name of the model")
    version: str = Field(..., description="Version of the model")
    type: str = Field(..., description="Type of the model (e.g., object_detection, classification)")
    framework: str = Field(..., description="Framework used (pytorch, tensorflow, onnx)")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Model-specific configuration")

class ModelCreate(ModelBase):
    url: Optional[str] = Field(None, description="URL to download pre-trained model")

class ModelUpdate(BaseModel):
    name: Optional[str] = None
    version: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None

class ModelResponse(ModelBase):
    id: str
    file_path: str
    owner_id: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
