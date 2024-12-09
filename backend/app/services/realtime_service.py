from fastapi import WebSocket
from typing import Dict, Set, Any
import asyncio
import json
from datetime import datetime
import cv2
import numpy as np
from .vision_service import vision_service

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.data_processors = {
            'occupancy': OccupancyProcessor(),
            'traffic': TrafficProcessor(),
            'safety': SafetyProcessor(),
            'analytics': AnalyticsProcessor(),
        }
        self.camera_frames = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = set()
        self.active_connections[client_id].add(websocket)

    async def disconnect(self, websocket: WebSocket, client_id: str):
        self.active_connections[client_id].remove(websocket)
        if not self.active_connections[client_id]:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, client_id: str, message: Dict):
        if client_id in self.active_connections:
            for connection in self.active_connections[client_id]:
                await connection.send_json(message)

    async def process_message(self, message: Dict, client_id: str):
        msg_type = message.get('type')
        if msg_type in self.data_processors:
            processor = self.data_processors[msg_type]
            response = await processor.process(message.get('payload', {}))
            await self.broadcast(client_id, {
                'type': f'{msg_type}_update',
                'payload': response
            })

    async def update_camera_frame(self, camera_id: str, frame: np.ndarray):
        self.camera_frames[camera_id] = frame
        # Process frame with all relevant processors
        for processor in self.data_processors.values():
            if hasattr(processor, 'process_frame'):
                await processor.process_frame(camera_id, frame)

class OccupancyProcessor:
    def __init__(self):
        self.zones = {
            1: {'id': 1, 'name': 'Main Hall', 'capacity': 100, 'current': 0},
            2: {'id': 2, 'name': 'Cafeteria', 'capacity': 50, 'current': 0},
            3: {'id': 3, 'name': 'Library', 'capacity': 30, 'current': 0},
        }
        self.last_processed = {}

    async def process_frame(self, camera_id: str, frame: np.ndarray):
        zone_id = self.get_zone_for_camera(camera_id)
        if not zone_id:
            return

        # Process frame with vision service
        result = await vision_service.count_people(frame, str(zone_id))
        if result:
            self.zones[zone_id]['current'] = result['count']
            self.last_processed[zone_id] = result['timestamp']

    def get_zone_for_camera(self, camera_id: str) -> int:
        # Map camera IDs to zones
        camera_zone_map = {
            'cam_main_hall': 1,
            'cam_cafeteria': 2,
            'cam_library': 3,
        }
        return camera_zone_map.get(camera_id)

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        total_current = sum(zone['current'] for zone in self.zones.values())
        total_capacity = sum(zone['capacity'] for zone in self.zones.values())

        return {
            'zones': list(self.zones.values()),
            'total': {
                'current': total_current,
                'capacity': total_capacity
            }
        }

class TrafficProcessor:
    def __init__(self):
        self.current_flow = 0
        self.avg_speed = 0
        self.congestion_level = 0
        self.hourly_data = []
        self.last_update = None

    async def process_frame(self, camera_id: str, frame: np.ndarray):
        # Process frame with vision service
        result = await vision_service.analyze_traffic(frame)
        if result:
            self.current_flow = result['currentFlow']
            self.avg_speed = result['avgSpeed']
            self.congestion_level = result['congestionLevel']
            self.last_update = datetime.now()

            # Update hourly data
            current_hour = self.last_update.hour
            if not self.hourly_data or self.hourly_data[-1]['hour'] != current_hour:
                self.hourly_data.append({
                    'hour': current_hour,
                    'flow': self.current_flow
                })
                if len(self.hourly_data) > 24:
                    self.hourly_data.pop(0)

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # Calculate changes
        flow_change = 0
        speed_change = 0
        congestion_change = 0
        
        if len(self.hourly_data) > 1:
            prev_flow = self.hourly_data[-2]['flow']
            flow_change = ((self.current_flow - prev_flow) / prev_flow) * 100 if prev_flow > 0 else 0

        return {
            'currentFlow': self.current_flow,
            'avgSpeed': self.avg_speed,
            'congestionLevel': self.congestion_level,
            'flowChange': flow_change,
            'speedChange': speed_change,
            'congestionChange': congestion_change,
            'hourlyData': self.hourly_data
        }

class SafetyProcessor:
    def __init__(self):
        self.violations = 0
        self.warnings = 0
        self.compliant = 0
        self.recent_events = []
        self.last_update = None

    async def process_frame(self, camera_id: str, frame: np.ndarray):
        # Process frame with vision service
        result = await vision_service.detect_safety_violations(frame)
        if result:
            violations = result['violations']
            self.violations = len(violations)
            
            # Update recent events
            for violation in violations:
                event = {
                    'type': 'violation',
                    'description': violation['description'],
                    'time': result['timestamp'],
                    'location': camera_id
                }
                self.recent_events.insert(0, event)
                if len(self.recent_events) > 10:
                    self.recent_events.pop()

            self.last_update = datetime.now()

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        status = 'normal'
        if self.violations > 5:
            status = 'critical'
        elif self.violations > 2:
            status = 'warning'

        return {
            'status': status,
            'stats': {
                'violations': self.violations,
                'warnings': self.warnings,
                'compliant': self.compliant
            },
            'recentEvents': self.recent_events
        }

class AnalyticsProcessor:
    def __init__(self):
        self.detection_rate = 0
        self.accuracy = 0
        self.processing_time = 0
        self.objects_detected = 0
        self.last_update = None

    async def process_frame(self, camera_id: str, frame: np.ndarray):
        # Process frame with vision service
        result = await vision_service.process_frame(frame)
        if result:
            self.processing_time = result['processing_time']
            self.objects_detected = len(result['detections'])
            self.detection_rate = self.objects_detected / (self.processing_time / 1000)
            self.accuracy = 95.0  # Placeholder - real implementation would calculate this
            self.last_update = datetime.now()

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'detectionRate': self.detection_rate,
            'accuracy': self.accuracy,
            'processingTime': self.processing_time,
            'objectsDetected': self.objects_detected
        }

manager = ConnectionManager()
