from fastapi import APIRouter, Depends, HTTPException, status, WebSocket
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from ....models.sql_models import Camera
from ....schemas.camera import CameraCreate, CameraUpdate, CameraResponse
from ....core.deps import get_db, get_current_user
from ....services.camera_manager import CameraManager
import cv2
import asyncio
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=CameraResponse)
async def create_camera(
    camera: CameraCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    camera_manager = CameraManager(db)
    try:
        return await camera_manager.add_camera({
            **camera.dict(),
            "owner_id": current_user.id
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[CameraResponse])
async def list_cameras(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cameras = db.query(Camera).filter(
        Camera.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return cameras

@router.get("/webcams", response_model=List[Dict])
async def list_available_webcams(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all available webcam devices"""
    camera_manager = CameraManager(db)
    return await camera_manager.get_available_webcams()

@router.post("/test-connection")
async def test_camera_connection(
    connection_data: Dict,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test connection to an IP camera"""
    camera_manager = CameraManager(db)
    success = await camera_manager.test_ip_camera(connection_data)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Failed to connect to camera"
        )
    return {"message": "Connection successful"}

@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(
    camera_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    camera = db.query(Camera).filter(
        Camera.id == camera_id,
        Camera.owner_id == current_user.id
    ).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera

@router.put("/{camera_id}", response_model=CameraResponse)
async def update_camera(
    camera_id: int,
    camera_data: CameraUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    camera_manager = CameraManager(db)
    try:
        return await camera_manager.update_camera(camera_id, camera_data.dict())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{camera_id}")
async def delete_camera(
    camera_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    camera_manager = CameraManager(db)
    try:
        await camera_manager.delete_camera(camera_id)
        return {"message": "Camera deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{camera_id}/stream/start")
async def start_camera_stream(
    camera_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start streaming from a camera"""
    camera_manager = CameraManager(db)
    success = await camera_manager.start_stream(camera_id)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Failed to start camera stream"
        )
    return {"message": "Stream started successfully"}

@router.post("/{camera_id}/stream/stop")
async def stop_camera_stream(
    camera_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stop streaming from a camera"""
    camera_manager = CameraManager(db)
    await camera_manager.stop_stream(camera_id)
    return {"message": "Stream stopped successfully"}

@router.get("/{camera_id}/status")
async def get_camera_status(
    camera_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current status of a camera"""
    camera_manager = CameraManager(db)
    try:
        return await camera_manager.get_camera_status(camera_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.websocket("/{camera_id}/ws")
async def camera_websocket(
    websocket: WebSocket,
    camera_id: int,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time camera feed"""
    await websocket.accept()
    camera_manager = CameraManager(db)
    
    try:
        # Start the stream if not already started
        if not await camera_manager.start_stream(camera_id):
            await websocket.close(code=1008, reason="Failed to start camera stream")
            return

        while True:
            try:
                # Get the latest frame
                frame = camera_manager.active_streams[camera_id]['last_frame']
                if frame is not None:
                    # Encode frame to JPEG
                    _, buffer = cv2.imencode('.jpg', frame)
                    # Send frame
                    await websocket.send_bytes(buffer.tobytes())
                await asyncio.sleep(0.033)  # ~30 FPS
            except Exception as e:
                logger.error(f"Error sending frame: {str(e)}")
                break
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        await websocket.close()
