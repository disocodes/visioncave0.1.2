from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from ....models.sql_models import Widget
from ....schemas.widget import WidgetCreate, WidgetUpdate, WidgetResponse
from ....core.deps import get_db, get_current_user
from ....services.widget_service import WidgetService

router = APIRouter()
widget_service = WidgetService()

@router.post("/", response_model=WidgetResponse)
async def create_widget(
    widget: WidgetCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await widget_service.create_widget(db, widget, current_user)

@router.get("/", response_model=List[WidgetResponse])
async def list_widgets(
    module: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await widget_service.get_widgets(db, current_user, module, skip, limit)

@router.get("/{widget_id}", response_model=WidgetResponse)
async def get_widget(
    widget_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    widget = await widget_service.get_widget(db, widget_id)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    return widget

@router.put("/{widget_id}", response_model=WidgetResponse)
async def update_widget(
    widget_id: int,
    widget: WidgetUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_widget = await widget_service.update_widget(db, widget_id, widget)
    if not updated_widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    return updated_widget

@router.delete("/{widget_id}")
async def delete_widget(
    widget_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = await widget_service.delete_widget(db, widget_id)
    if not success:
        raise HTTPException(status_code=404, detail="Widget not found")
    return {"message": "Widget deleted successfully"}
