import cv2
import numpy as np
from typing import Dict, Optional, List
import asyncio
import logging
import subprocess
import platform
from datetime import datetime
import requests
from sqlalchemy.orm import Session
from ..models.sql_models import Camera, Stream
from .websocket_service import manager

logger = logging.getLogger(__name__)

class CameraManager:
    def __init__(self, db: Session):
        self.db = db
        self.active_streams = {}
        self.frame_processors = {}

    async def add_camera(self, camera_data: Dict) -> Camera:
        """Add a new camera to the system"""
        try:
            camera = Camera(
                name=camera_data['name'],
                type=camera_data['type'],
                url=camera_data.get('url'),
                configuration=camera_data.get('configuration', {}),
                status='inactive'
            )
            self.db.add(camera)
            self.db.commit()
            self.db.refresh(camera)
            return camera
        except Exception as e:
            logger.error(f"Error adding camera: {str(e)}")
            self.db.rollback()
            raise

    async def update_camera(self, camera_id: int, camera_data: Dict) -> Camera:
        """Update camera configuration"""
        try:
            camera = self.db.query(Camera).filter(Camera.id == camera_id).first()
            if not camera:
                raise ValueError(f"Camera {camera_id} not found")

            # Update camera fields
            camera.name = camera_data.get('name', camera.name)
            camera.url = camera_data.get('url', camera.url)
            camera.configuration = camera_data.get('configuration', camera.configuration)

            self.db.commit()
            self.db.refresh(camera)
            return camera
        except Exception as e:
            logger.error(f"Error updating camera: {str(e)}")
            self.db.rollback()
            raise

    async def delete_camera(self, camera_id: int):
        """Delete a camera from the system"""
        try:
            camera = self.db.query(Camera).filter(Camera.id == camera_id).first()
            if not camera:
                raise ValueError(f"Camera {camera_id} not found")

            # Stop stream if active
            await self.stop_stream(camera_id)

            self.db.delete(camera)
            self.db.commit()
        except Exception as e:
            logger.error(f"Error deleting camera: {str(e)}")
            self.db.rollback()
            raise

    async def get_available_webcams(self) -> List[Dict]:
        """Get list of available webcam devices"""
        webcams = []
        try:
            if platform.system() == "Windows":
                # Windows: Try multiple indices
                for i in range(10):
                    cap = cv2.VideoCapture(i, cv2.CAP_DSHOW)
                    if cap.isOpened():
                        ret, _ = cap.read()
                        if ret:
                            webcams.append({
                                "id": i,
                                "name": f"Camera {i}",
                                "type": "webcam"
                            })
                        cap.release()
            else:
                # Linux: Check /dev/video* devices
                import glob
                devices = glob.glob("/dev/video*")
                for device in devices:
                    cap = cv2.VideoCapture(device)
                    if cap.isOpened():
                        ret, _ = cap.read()
                        if ret:
                            webcams.append({
                                "id": device,
                                "name": f"Camera {devices.index(device)}",
                                "type": "webcam"
                            })
                        cap.release()
        except Exception as e:
            logger.error(f"Error getting webcams: {str(e)}")
        return webcams

    async def test_ip_camera(self, camera_data: Dict) -> bool:
        """Test connection to IP camera"""
        try:
            url = camera_data['url']
            username = camera_data.get('username')
            password = camera_data.get('password')
            protocol = camera_data.get('protocol', 'rtsp')

            if protocol in ['http', 'https']:
                # Test HTTP(S) camera
                auth = None
                if username and password:
                    auth = (username, password)
                response = requests.get(url, auth=auth, timeout=5)
                return response.status_code == 200
            else:
                # Test RTSP camera
                stream_url = url
                if username and password:
                    stream_url = f"{protocol}://{username}:{password}@{url.split('://')[-1]}"
                
                cap = cv2.VideoCapture(stream_url)
                if cap.isOpened():
                    ret, _ = cap.read()
                    cap.release()
                    return ret
                return False
        except Exception as e:
            logger.error(f"Error testing camera connection: {str(e)}")
            return False

    async def start_stream(self, camera_id: int) -> bool:
        """Start camera stream"""
        try:
            camera = self.db.query(Camera).filter(Camera.id == camera_id).first()
            if not camera:
                raise ValueError(f"Camera {camera_id} not found")

            if camera.id in self.active_streams:
                return True

            if camera.type == 'webcam':
                cap = cv2.VideoCapture(camera.configuration.get('deviceId', 0))
            else:
                stream_url = camera.url
                if camera.configuration.get('username') and camera.configuration.get('password'):
                    stream_url = f"{camera.configuration['protocol']}://{camera.configuration['username']}:{camera.configuration['password']}@{camera.url.split('://')[-1]}"
                cap = cv2.VideoCapture(stream_url)

            if not cap.isOpened():
                raise ValueError("Failed to open camera stream")

            self.active_streams[camera.id] = {
                'capture': cap,
                'last_frame': None,
                'last_update': datetime.now()
            }

            # Start frame reading loop
            asyncio.create_task(self._read_frames(camera.id))
            
            camera.status = 'active'
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error starting stream: {str(e)}")
            camera.status = 'error'
            self.db.commit()
            return False

    async def stop_stream(self, camera_id: int):
        """Stop camera stream"""
        try:
            if camera_id in self.active_streams:
                stream = self.active_streams[camera_id]
                stream['capture'].release()
                del self.active_streams[camera_id]

                camera = self.db.query(Camera).filter(Camera.id == camera_id).first()
                if camera:
                    camera.status = 'inactive'
                    self.db.commit()
        except Exception as e:
            logger.error(f"Error stopping stream: {str(e)}")

    async def _read_frames(self, camera_id: int):
        """Read frames from camera stream"""
        try:
            while camera_id in self.active_streams:
                stream = self.active_streams[camera_id]
                ret, frame = stream['capture'].read()
                
                if not ret:
                    logger.error(f"Failed to read frame from camera {camera_id}")
                    await self.stop_stream(camera_id)
                    break

                # Update last frame
                stream['last_frame'] = frame
                stream['last_update'] = datetime.now()

                # Process frame if processor exists
                if camera_id in self.frame_processors:
                    try:
                        await self.frame_processors[camera_id](frame)
                    except Exception as e:
                        logger.error(f"Error processing frame: {str(e)}")

                await asyncio.sleep(0.033)  # ~30 FPS
        except Exception as e:
            logger.error(f"Error in frame reading loop: {str(e)}")
            await self.stop_stream(camera_id)

    def add_frame_processor(self, camera_id: int, processor):
        """Add a frame processor for a camera"""
        self.frame_processors[camera_id] = processor

    def remove_frame_processor(self, camera_id: int):
        """Remove frame processor for a camera"""
        if camera_id in self.frame_processors:
            del self.frame_processors[camera_id]

    async def get_camera_status(self, camera_id: int) -> Dict:
        """Get current status of a camera"""
        camera = self.db.query(Camera).filter(Camera.id == camera_id).first()
        if not camera:
            raise ValueError(f"Camera {camera_id} not found")

        return {
            'id': camera.id,
            'name': camera.name,
            'type': camera.type,
            'status': camera.status,
            'is_streaming': camera.id in self.active_streams,
            'last_update': self.active_streams[camera.id]['last_update'].isoformat() 
                if camera.id in self.active_streams else None
        }
