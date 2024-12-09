import cv2
import numpy as np
import torch
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import asyncio
from collections import deque
import tensorflow as tf
from ..models.detection import YOLODetector
from ..config import settings

class VisionService:
    def __init__(self):
        # Initialize core models
        self.yolo_detector = YOLODetector(
            model_path=settings.YOLO_MODEL_PATH,
            classes=['person', 'car', 'truck', 'bicycle', 'motorcycle']
        )
        
        # Initialize specialized models
        self.face_detector = cv2.dnn.readNetFromCaffe(
            settings.FACE_PROTO_PATH,
            settings.FACE_MODEL_PATH
        )
        
        # Load emotion recognition model
        self.emotion_model = tf.keras.models.load_model(settings.EMOTION_MODEL_PATH)
        
        # Initialize tracking
        self.object_tracker = cv2.TrackerCSRT_create()
        self.tracked_objects = {}
        
        # Initialize analytics storage
        self.analytics_buffer = {
            'detections': deque(maxlen=1000),
            'occupancy': deque(maxlen=1000),
            'violations': deque(maxlen=1000),
            'emotions': deque(maxlen=1000)
        }
        
        # Performance metrics
        self.fps_buffer = deque(maxlen=100)
        self.processing_times = deque(maxlen=100)
        self.detection_counts = deque(maxlen=100)
        
    async def process_frame(self, frame: np.ndarray) -> Dict:
        """Process a single frame with all available analytics"""
        start_time = datetime.now()
        
        # Basic object detection
        detections = await self._detect_objects(frame)
        
        # Face and emotion analysis
        faces = await self._detect_faces(frame)
        emotions = await self._analyze_emotions(frame, faces)
        
        # Motion and activity analysis
        motion = await self._analyze_motion(frame)
        
        # Track objects across frames
        tracked = await self._track_objects(frame, detections)
        
        # Safety analysis
        safety_violations = await self._analyze_safety(frame, detections, tracked)
        
        # Calculate processing metrics
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        self.processing_times.append(processing_time)
        
        # Update analytics buffer
        self._update_analytics(detections, emotions, safety_violations)
        
        return {
            'detections': detections,
            'faces': faces,
            'emotions': emotions,
            'motion': motion,
            'tracked': tracked,
            'safety_violations': safety_violations,
            'processing_time': processing_time,
            'analytics': self._get_analytics_summary()
        }
        
    async def _detect_objects(self, frame: np.ndarray) -> List[Dict]:
        """Detect objects in frame using YOLO"""
        detections = self.yolo_detector.detect(frame)
        self.detection_counts.append(len(detections))
        return detections
        
    async def _detect_faces(self, frame: np.ndarray) -> List[Dict]:
        """Detect faces in frame"""
        blob = cv2.dnn.blobFromImage(
            cv2.resize(frame, (300, 300)), 1.0,
            (300, 300), (104.0, 177.0, 123.0)
        )
        self.face_detector.setInput(blob)
        detections = self.face_detector.forward()
        
        faces = []
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > 0.5:
                box = detections[0, 0, i, 3:7] * np.array([frame.shape[1],
                    frame.shape[0], frame.shape[1], frame.shape[0]])
                faces.append({
                    'bbox': box.astype(int),
                    'confidence': float(confidence)
                })
        
        return faces
        
    async def _analyze_emotions(self, frame: np.ndarray, faces: List[Dict]) -> List[Dict]:
        """Analyze emotions in detected faces"""
        emotions = []
        for face in faces:
            x1, y1, x2, y2 = face['bbox']
            face_img = frame[y1:y2, x1:x2]
            if face_img.size == 0:
                continue
                
            # Preprocess for emotion detection
            face_img = cv2.resize(face_img, (48, 48))
            face_img = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
            face_img = np.expand_dims(face_img, axis=0)
            face_img = np.expand_dims(face_img, axis=-1)
            
            # Predict emotion
            emotion_pred = self.emotion_model.predict(face_img)
            emotion_label = ['angry', 'disgust', 'fear', 'happy',
                           'sad', 'surprise', 'neutral'][np.argmax(emotion_pred)]
            
            emotions.append({
                'bbox': face['bbox'],
                'emotion': emotion_label,
                'confidence': float(np.max(emotion_pred))
            })
            
        return emotions
        
    async def _analyze_motion(self, frame: np.ndarray) -> Dict:
        """Analyze motion and activity levels"""
        # Convert frame to grayscale for motion detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)
        
        # Compare with previous frame if available
        if not hasattr(self, 'prev_frame'):
            self.prev_frame = gray
            return {'activity_level': 0.0}
            
        # Calculate frame difference
        frame_diff = cv2.absdiff(self.prev_frame, gray)
        thresh = cv2.threshold(frame_diff, 25, 255, cv2.THRESH_BINARY)[1]
        
        # Calculate activity level
        activity_level = np.sum(thresh > 0) / thresh.size
        self.prev_frame = gray
        
        return {
            'activity_level': float(activity_level),
            'frame_diff': frame_diff,
            'threshold': thresh
        }
        
    async def _track_objects(self, frame: np.ndarray, 
                           detections: List[Dict]) -> Dict[str, Dict]:
        """Track detected objects across frames"""
        current_objects = {}
        
        # Update existing trackers
        for obj_id, tracker_info in self.tracked_objects.items():
            success, bbox = tracker_info['tracker'].update(frame)
            if success:
                current_objects[obj_id] = {
                    'bbox': bbox,
                    'class': tracker_info['class'],
                    'trajectory': tracker_info['trajectory'] + [bbox]
                }
                
        # Initialize new trackers for unmatched detections
        for detection in detections:
            if not self._is_object_tracked(detection['bbox'], current_objects):
                tracker = cv2.TrackerCSRT_create()
                tracker.init(frame, tuple(detection['bbox']))
                obj_id = f"{detection['class']}_{len(self.tracked_objects)}"
                current_objects[obj_id] = {
                    'bbox': detection['bbox'],
                    'class': detection['class'],
                    'trajectory': [detection['bbox']],
                    'tracker': tracker
                }
                
        self.tracked_objects = current_objects
        return current_objects
        
    async def _analyze_safety(self, frame: np.ndarray,
                            detections: List[Dict],
                            tracked_objects: Dict[str, Dict]) -> List[Dict]:
        """Analyze safety violations"""
        violations = []
        
        # Analyze proximity between objects
        for id1, obj1 in tracked_objects.items():
            for id2, obj2 in tracked_objects.items():
                if id1 != id2 and obj1['class'] == 'person' and obj2['class'] == 'person':
                    distance = self._calculate_distance(obj1['bbox'], obj2['bbox'])
                    if distance < settings.MIN_SAFE_DISTANCE:
                        violations.append({
                            'type': 'proximity',
                            'objects': [id1, id2],
                            'distance': distance,
                            'timestamp': datetime.now().isoformat()
                        })
                        
        return violations
        
    def _update_analytics(self, detections: List[Dict],
                         emotions: List[Dict],
                         violations: List[Dict]):
        """Update analytics buffer with new data"""
        timestamp = datetime.now().isoformat()
        
        self.analytics_buffer['detections'].append({
            'timestamp': timestamp,
            'count': len(detections),
            'classes': {cls: sum(1 for d in detections if d['class'] == cls)
                       for cls in set(d['class'] for d in detections)}
        })
        
        self.analytics_buffer['emotions'].append({
            'timestamp': timestamp,
            'emotions': {e['emotion']: e['confidence'] for e in emotions}
        })
        
        self.analytics_buffer['violations'].append({
            'timestamp': timestamp,
            'count': len(violations),
            'types': {v['type']: 1 for v in violations}
        })
        
    def _get_analytics_summary(self) -> Dict:
        """Generate summary of recent analytics"""
        now = datetime.now()
        last_minute = now - timedelta(minutes=1)
        
        return {
            'performance': {
                'fps': len(self.fps_buffer) / sum(self.fps_buffer) if self.fps_buffer else 0,
                'avg_processing_time': sum(self.processing_times) / len(self.processing_times) if self.processing_times else 0,
                'detection_rate': sum(self.detection_counts) / len(self.detection_counts) if self.detection_counts else 0
            },
            'detections': {
                'total': sum(d['count'] for d in self.analytics_buffer['detections']),
                'by_class': self._aggregate_detections_by_class(),
                'trend': self._get_detection_trend()
            },
            'emotions': self._aggregate_emotions(),
            'violations': {
                'total': sum(v['count'] for v in self.analytics_buffer['violations']),
                'by_type': self._aggregate_violations_by_type(),
                'trend': self._get_violation_trend()
            }
        }
        
    def _aggregate_detections_by_class(self) -> Dict[str, int]:
        """Aggregate detection counts by class"""
        class_counts = {}
        for detection in self.analytics_buffer['detections']:
            for cls, count in detection['classes'].items():
                class_counts[cls] = class_counts.get(cls, 0) + count
        return class_counts
        
    def _aggregate_emotions(self) -> Dict[str, float]:
        """Aggregate emotion analysis results"""
        emotion_counts = {}
        total_samples = 0
        
        for entry in self.analytics_buffer['emotions']:
            for emotion, confidence in entry['emotions'].items():
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + confidence
                total_samples += 1
                
        return {emotion: count/total_samples for emotion, count in emotion_counts.items()} if total_samples > 0 else {}
        
    def _aggregate_violations_by_type(self) -> Dict[str, int]:
        """Aggregate safety violations by type"""
        violation_counts = {}
        for violation in self.analytics_buffer['violations']:
            for type_ in violation['types']:
                violation_counts[type_] = violation_counts.get(type_, 0) + 1
        return violation_counts
        
    def _get_detection_trend(self) -> List[Dict]:
        """Get detection count trend over time"""
        return [{'timestamp': d['timestamp'], 'count': d['count']}
                for d in self.analytics_buffer['detections']]
                
    def _get_violation_trend(self) -> List[Dict]:
        """Get violation count trend over time"""
        return [{'timestamp': v['timestamp'], 'count': v['count']}
                for v in self.analytics_buffer['violations']]
                
    @staticmethod
    def _calculate_distance(bbox1: Tuple[float, float, float, float],
                          bbox2: Tuple[float, float, float, float]) -> float:
        """Calculate distance between two bounding boxes"""
        x1, y1 = (bbox1[0] + bbox1[2])/2, (bbox1[1] + bbox1[3])/2
        x2, y2 = (bbox2[0] + bbox2[2])/2, (bbox2[1] + bbox2[3])/2
        return np.sqrt((x2-x1)**2 + (y2-y1)**2)
        
    @staticmethod
    def _is_object_tracked(bbox: Tuple[float, float, float, float],
                          tracked_objects: Dict[str, Dict]) -> bool:
        """Check if an object is already being tracked"""
        for tracked in tracked_objects.values():
            if VisionService._calculate_distance(bbox, tracked['bbox']) < 50:
                return True
        return False
