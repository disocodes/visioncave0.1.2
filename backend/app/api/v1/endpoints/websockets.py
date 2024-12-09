from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ....services.websocket_service import manager
from ....services.video_analytics_service import video_analytics_service
import logging
import json
import cv2
import numpy as np
import base64

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/{module}")
async def websocket_endpoint(websocket: WebSocket, module: str):
    await manager.connect(websocket, module)
    try:
        while True:
            # Receive frame data
            data = await websocket.receive_text()
            try:
                frame_data = json.loads(data)
                if frame_data['type'] == 'video_frame':
                    # Decode base64 frame
                    frame_bytes = base64.b64decode(frame_data['frame'])
                    nparr = np.frombuffer(frame_bytes, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    # Process frame
                    results = await video_analytics_service.process_frame(frame, module)
                    
                    # Send results back to client
                    await manager.send_personal_message({
                        'type': 'analysis_results',
                        'results': results
                    }, websocket)
                    
            except json.JSONDecodeError:
                logger.error("Invalid JSON data received")
            except Exception as e:
                logger.error(f"Error processing frame: {str(e)}")
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, module)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket, module)

@router.websocket("/ws/stream/{camera_id}")
async def camera_stream(websocket: WebSocket, camera_id: str):
    await manager.connect(websocket, f"camera_{camera_id}")
    try:
        while True:
            data = await websocket.receive_text()
            # Handle camera stream data
            # Implementation depends on your camera setup
            pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"camera_{camera_id}")
