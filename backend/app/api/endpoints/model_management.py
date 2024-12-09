from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from ..dependencies import get_db, get_current_user
from ..services.model_manager import ModelManager
from ..models.sql_models import Model, User
from ..schemas.model import ModelCreate, ModelResponse, ModelUpdate

router = APIRouter()
model_manager = ModelManager()

@router.post("/models/upload", response_model=ModelResponse)
async def upload_model(
    file: UploadFile = File(...),
    metadata: ModelCreate = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a new model file with metadata."""
    return await model_manager.upload_model(db, file, metadata.dict(), current_user.id)

@router.post("/models/download", response_model=ModelResponse)
async def download_pretrained_model(
    model_info: ModelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download and register a pre-trained model."""
    return await model_manager.download_pretrained_model(db, model_info.dict(), current_user.id)

@router.get("/models", response_model=List[ModelResponse])
async def list_models(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available models."""
    models = db.query(Model).offset(skip).limit(limit).all()
    return models

@router.get("/models/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get model details by ID."""
    model = db.query(Model).filter(Model.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model

@router.delete("/models/{model_id}")
async def delete_model(
    model_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a model by ID."""
    model = db.query(Model).filter(Model.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Check if user has permission to delete
    if model.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this model")
    
    success = await model_manager.delete_model(db, model_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete model")
    
    return {"message": "Model deleted successfully"}

@router.post("/models/{model_id}/optimize")
async def optimize_model(
    model_id: str,
    optimization_config: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Optimize a model for inference."""
    model = db.query(Model).filter(Model.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    success = await model_manager.optimize_model(model_id, optimization_config)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to optimize model")
    
    return {"message": "Model optimized successfully"}

@router.post("/models/{model_id}/load")
async def load_model(
    model_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Load a model into memory."""
    model = db.query(Model).filter(Model.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        await model_manager.load_model(model_id)
        return {"message": "Model loaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models/{model_id}/unload")
async def unload_model(
    model_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unload a model from memory."""
    model = db.query(Model).filter(Model.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    await model_manager.unload_model(model_id)
    return {"message": "Model unloaded successfully"}
