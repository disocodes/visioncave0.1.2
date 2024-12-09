import cv2
import numpy as np
from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.sql_models import Camera, Stream
import asyncio
import json
from kafka import KafkaProducer
from kafka.errors import KafkaError
import logging
from concurrent.futures import ThreadPoolExecutor
import threading
from queue import Queue
import time

logger = logging.getLogger(__name__)

class CameraService:
    def __init__(self):
        self.active_streams = {}
        self.frame_processors = {}
        self.executor = ThreadPoolExecutor(max_workers=10)
        self.kafka_producer = KafkaProducer(
            bootstrap_servers=['localhost:9092'],
            value_serializer=lambda x: json.dumps(x).encode('utf-8')
        )

    async def create_camera(
        self, db: Session, camera_data: Dict[str, Any], user_id: int
    ) -> Camera:
        """Create a new camera entry."""
        try:
            camera = Camera(
                name=camera_data['name'],
                url=camera_data['url'],
                type=camera_data['type'],
                location=camera_data['location'],
                configuration=camera_data['configuration'],
                owner_id=user_id
            )
            
            db.add(camera)
            db.commit()
            db.refresh(camera)
            
            return camera
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    async def get_camera(self, db: Session, camera_id: int) -> Optional[Camera]:
        """Get camera by ID."""
        return db.query(Camera).filter(Camera.id == camera_id).first()

    async def update_camera(
        self, db: Session, camera_id: int, camera_data: Dict[str, Any]
    ) -> Optional[Camera]:
        """Update camera settings."""
        camera = await self.get_camera(db, camera_id)
        if not camera:
            return None

        for key, value in camera_data.items():
            setattr(camera, key, value)

        db.commit()
        db.refresh(camera)
        
        # Restart stream if active
        if camera_id in self.active_streams:
            await self.restart_stream(camera_id)
        
        return camera

    async def delete_camera(self, db: Session, camera_id: int) -> bool:
        """Delete camera."""
        camera = await self.get_camera(db, camera_id)
        if not camera:
            return False

        # Stop stream if active
        await self.stop_stream(camera_id)
        
        db.delete(camera)
        db.commit()
        return True

    async def test_connection(self, camera_id: int) -> Dict[str, Any]:
        """Test camera connection."""
        camera = await self.get_camera(db, camera_id)
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")

        try:
            cap = cv2.VideoCapture(camera.url)
            if not cap.isOpened():
                raise Exception("Failed to connect to camera")
            
            ret, frame = cap.read()
            if not ret:
                raise Exception("Failed to read frame from camera")
            
            cap.release()
            return {"status": "success", "message": "Camera connection successful"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def start_stream(self, camera_id: int):
        """Start camera stream processing."""
        camera = await self.get_camera(db, camera_id)
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")

        if camera_id in self.active_streams:
            return

        # Create frame queue and processing thread
        frame_queue = Queue(maxsize=30)
        stop_event = threading.Event()
        
        # Start frame capture thread
        self.executor.submit(
            self._capture_frames,
            camera.url,
            frame_queue,
            stop_event,
            camera.configuration
        )
        
        # Start frame processing thread
        self.executor.submit(
            self._process_frames,
            camera_id,
            frame_queue,
            stop_event,
            camera.configuration
        )
        
        self.active_streams[camera_id] = {
            'queue': frame_queue,
            'stop_event': stop_event,
            'configuration': camera.configuration
        }

    def _capture_frames(
        self, url: str, frame_queue: Queue, stop_event: threading.Event, config: Dict[str, Any]
    ):
        """Capture frames from camera in a separate thread."""
        cap = cv2.VideoCapture(url)
        
        # Set camera properties
        width, height = map(int, config['resolution'].split('x'))
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        cap.set(cv2.CAP_PROP_FPS, config['frameRate'])

        while not stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                logger.error(f"Failed to read frame from camera {url}")
                time.sleep(1)
                continue

            if not frame_queue.full():
                frame_queue.put(frame)
            else:
                # Skip frame if queue is full
                continue

        cap.release()

    def _process_frames(
        self, camera_id: int, frame_queue: Queue, stop_event: threading.Event, config: Dict[str, Any]
    ):
        """Process frames in a separate thread."""
        while not stop_event.is_set():
            if frame_queue.empty():
                time.sleep(0.01)
                continue

            frame = frame_queue.get()
            
            try:
                # Apply any preprocessing
                processed_frame = self._preprocess_frame(frame, config)
                
                # Run object detection if configured
                if config.get('enableObjectDetection'):
                    detections = self._detect_objects(processed_frame)
                    # Send detections to Kafka
                    self._send_to_kafka('detections', {
                        'camera_id': camera_id,
                        'timestamp': time.time(),
                        'detections': detections
                    })
                
                # Run analytics if configured
                if config.get('enableAnalytics'):
                    analytics = self._analyze_frame(processed_frame)
                    # Send analytics to Kafka
                    self._send_to_kafka('analytics', {
                        'camera_id': camera_id,
                        'timestamp': time.time(),
                        'analytics': analytics
                    })
                
            except Exception as e:
                logger.error(f"Error processing frame: {str(e)}")

    def _preprocess_frame(self, frame: np.ndarray, config: Dict[str, Any]) -> np.ndarray:
        """Apply preprocessing to frame."""
        try:
            # Resize if needed
            if config.get('resize'):
                width, height = map(int, config['resolution'].split('x'))
                frame = cv2.resize(frame, (width, height))
            
            # Apply additional preprocessing based on configuration
            if config.get('grayscale'):
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            if config.get('blur'):
                frame = cv2.GaussianBlur(frame, (5, 5), 0)
            
            return frame
        except Exception as e:
            logger.error(f"Error in preprocessing: {str(e)}")
            return frame

    def _detect_objects(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """Detect objects in frame."""
        # Implement object detection using your preferred model
        # This is a placeholder
        return []

    def _analyze_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """Generate analytics from frame."""
        # Implement frame analysis
        # This is a placeholder
        return {}

    def _send_to_kafka(self, topic: str, message: Dict[str, Any]):
        """Send message to Kafka topic."""
        try:
            future = self.kafka_producer.send(topic, message)
            future.get(timeout=10)
        except KafkaError as e:
            logger.error(f"Error sending to Kafka: {str(e)}")

    async def stop_stream(self, camera_id: int):
        """Stop camera stream processing."""
        if camera_id in self.active_streams:
            self.active_streams[camera_id]['stop_event'].set()
            del self.active_streams[camera_id]

    async def restart_stream(self, camera_id: int):
        """Restart camera stream processing."""
        await self.stop_stream(camera_id)
        await self.start_stream(camera_id)

    async def get_stream_status(self, camera_id: int) -> Dict[str, Any]:
        """Get current status of camera stream."""
        if camera_id not in self.active_streams:
            return {
                'status': 'inactive',
                'frame_count': 0,
                'fps': 0
            }
        
        stream_info = self.active_streams[camera_id]
        return {
            'status': 'active',
            'frame_count': stream_info['queue'].qsize(),
            'fps': stream_info['configuration']['frameRate']
        }

    def __del__(self):
        """Cleanup resources."""
        self.executor.shutdown(wait=True)
        self.kafka_producer.close()
