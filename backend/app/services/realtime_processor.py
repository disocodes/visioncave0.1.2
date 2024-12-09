from kafka import KafkaConsumer
from kafka.errors import KafkaError
import json
import logging
import threading
from typing import Dict, Any, List, Optional
import numpy as np
from datetime import datetime
import asyncio
import socketio
from motor.motor_asyncio import AsyncIOMotorClient
from ..core.config import settings

logger = logging.getLogger(__name__)

class RealtimeProcessor:
    def __init__(self):
        # Initialize Kafka consumer
        self.consumer = KafkaConsumer(
            'detections',
            'analytics',
            bootstrap_servers=['localhost:9092'],
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            auto_offset_reset='latest',
            enable_auto_commit=True
        )
        
        # Initialize MongoDB client
        self.mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.db = self.mongo_client['visioncave']
        
        # Initialize Socket.IO server
        self.sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
        
        # Initialize processing threads
        self.processing_threads = {}
        self.stop_event = threading.Event()
        
        # Initialize data buffers
        self.detection_buffer = {}
        self.analytics_buffer = {}
        
        # Start processing
        self.start_processing()

    def start_processing(self):
        """Start the real-time data processing threads."""
        # Start Kafka consumer thread
        self.processing_threads['kafka'] = threading.Thread(
            target=self._process_kafka_messages
        )
        self.processing_threads['kafka'].start()
        
        # Start analytics aggregation thread
        self.processing_threads['analytics'] = threading.Thread(
            target=self._aggregate_analytics
        )
        self.processing_threads['analytics'].start()

    async def stop_processing(self):
        """Stop all processing threads."""
        self.stop_event.set()
        for thread in self.processing_threads.values():
            thread.join()
        await self.cleanup()

    def _process_kafka_messages(self):
        """Process incoming Kafka messages."""
        try:
            for message in self.consumer:
                if self.stop_event.is_set():
                    break

                topic = message.topic
                data = message.value

                if topic == 'detections':
                    self._handle_detection(data)
                elif topic == 'analytics':
                    self._handle_analytics(data)

        except KafkaError as e:
            logger.error(f"Kafka error: {str(e)}")
        finally:
            self.consumer.close()

    def _handle_detection(self, detection_data: Dict[str, Any]):
        """Handle object detection data."""
        try:
            camera_id = detection_data['camera_id']
            timestamp = detection_data['timestamp']
            detections = detection_data['detections']

            # Buffer the detection data
            if camera_id not in self.detection_buffer:
                self.detection_buffer[camera_id] = []
            self.detection_buffer[camera_id].append({
                'timestamp': timestamp,
                'detections': detections
            })

            # Keep only last 100 detections
            if len(self.detection_buffer[camera_id]) > 100:
                self.detection_buffer[camera_id].pop(0)

            # Emit real-time update via Socket.IO
            asyncio.create_task(self._emit_detection_update(camera_id, detection_data))

            # Store detection in MongoDB
            asyncio.create_task(self._store_detection(detection_data))

        except Exception as e:
            logger.error(f"Error handling detection: {str(e)}")

    def _handle_analytics(self, analytics_data: Dict[str, Any]):
        """Handle analytics data."""
        try:
            camera_id = analytics_data['camera_id']
            timestamp = analytics_data['timestamp']
            analytics = analytics_data['analytics']

            # Buffer the analytics data
            if camera_id not in self.analytics_buffer:
                self.analytics_buffer[camera_id] = []
            self.analytics_buffer[camera_id].append({
                'timestamp': timestamp,
                'analytics': analytics
            })

            # Keep only last 1000 analytics points
            if len(self.analytics_buffer[camera_id]) > 1000:
                self.analytics_buffer[camera_id].pop(0)

            # Emit real-time update via Socket.IO
            asyncio.create_task(self._emit_analytics_update(camera_id, analytics_data))

            # Store analytics in MongoDB
            asyncio.create_task(self._store_analytics(analytics_data))

        except Exception as e:
            logger.error(f"Error handling analytics: {str(e)}")

    def _aggregate_analytics(self):
        """Aggregate analytics data periodically."""
        while not self.stop_event.is_set():
            try:
                for camera_id, buffer in self.analytics_buffer.items():
                    if not buffer:
                        continue

                    # Calculate aggregated metrics
                    aggregated = self._calculate_aggregated_metrics(buffer)
                    
                    # Emit aggregated update
                    asyncio.create_task(
                        self._emit_aggregated_update(camera_id, aggregated)
                    )

                    # Store aggregated data
                    asyncio.create_task(
                        self._store_aggregated_analytics(camera_id, aggregated)
                    )

            except Exception as e:
                logger.error(f"Error in analytics aggregation: {str(e)}")

            # Wait for next aggregation cycle
            threading.Event().wait(60)  # Aggregate every minute

    def _calculate_aggregated_metrics(
        self, buffer: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate aggregated metrics from analytics buffer."""
        try:
            timestamps = [entry['timestamp'] for entry in buffer]
            analytics = [entry['analytics'] for entry in buffer]

            # Calculate various metrics
            metrics = {
                'start_time': min(timestamps),
                'end_time': max(timestamps),
                'total_objects': sum(a.get('object_count', 0) for a in analytics),
                'average_speed': np.mean([a.get('average_speed', 0) for a in analytics]),
                'direction_histogram': self._merge_histograms(
                    [a.get('direction_histogram', {}) for a in analytics]
                ),
            }

            return metrics
        except Exception as e:
            logger.error(f"Error calculating metrics: {str(e)}")
            return {}

    def _merge_histograms(self, histograms: List[Dict[str, float]]) -> Dict[str, float]:
        """Merge multiple direction histograms."""
        merged = {}
        for hist in histograms:
            for direction, value in hist.items():
                merged[direction] = merged.get(direction, 0) + value
        return merged

    async def _emit_detection_update(self, camera_id: int, data: Dict[str, Any]):
        """Emit detection update via Socket.IO."""
        await self.sio.emit(
            'detection_update',
            {'camera_id': camera_id, 'data': data},
            room=f'camera_{camera_id}'
        )

    async def _emit_analytics_update(self, camera_id: int, data: Dict[str, Any]):
        """Emit analytics update via Socket.IO."""
        await self.sio.emit(
            'analytics_update',
            {'camera_id': camera_id, 'data': data},
            room=f'camera_{camera_id}'
        )

    async def _emit_aggregated_update(self, camera_id: int, data: Dict[str, Any]):
        """Emit aggregated analytics update via Socket.IO."""
        await self.sio.emit(
            'aggregated_update',
            {'camera_id': camera_id, 'data': data},
            room=f'camera_{camera_id}'
        )

    async def _store_detection(self, detection_data: Dict[str, Any]):
        """Store detection data in MongoDB."""
        await self.db.detections.insert_one({
            **detection_data,
            'created_at': datetime.utcnow()
        })

    async def _store_analytics(self, analytics_data: Dict[str, Any]):
        """Store analytics data in MongoDB."""
        await self.db.analytics.insert_one({
            **analytics_data,
            'created_at': datetime.utcnow()
        })

    async def _store_aggregated_analytics(
        self, camera_id: int, aggregated_data: Dict[str, Any]
    ):
        """Store aggregated analytics in MongoDB."""
        await self.db.aggregated_analytics.insert_one({
            'camera_id': camera_id,
            'data': aggregated_data,
            'created_at': datetime.utcnow()
        })

    async def cleanup(self):
        """Cleanup resources."""
        self.consumer.close()
        await self.mongo_client.close()

    @staticmethod
    def get_instance():
        """Get or create singleton instance."""
        if not hasattr(RealtimeProcessor, '_instance'):
            RealtimeProcessor._instance = RealtimeProcessor()
        return RealtimeProcessor._instance
