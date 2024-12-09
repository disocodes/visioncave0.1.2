from typing import Dict, Any, List
import numpy as np
import cv2
from datetime import datetime
import asyncio
from .vision_service import vision_service

class ClassroomActivityProcessor:
    def __init__(self):
        self.classrooms = {}
        self.attention_history = {}
        self.activity_levels = {}
        self.last_processed = {}

    async def process_frame(self, camera_id: str, frame: np.ndarray):
        classroom_id = self.get_classroom_id(camera_id)
        if not classroom_id:
            return

        # Process frame with vision service
        people_result = await vision_service.count_people(frame, str(classroom_id))
        if not people_result:
            return

        # Get face detections for attention analysis
        face_detections = await self.detect_faces(frame)
        
        # Calculate attention metrics
        attention_score = await self.calculate_attention_score(face_detections)
        activity_level = await self.calculate_activity_level(frame)

        # Update classroom data
        self.classrooms[classroom_id] = {
            'occupancy': people_result['count'],
            'attentionScore': attention_score,
            'activityLevel': activity_level,
            'timestamp': datetime.now().isoformat()
        }

        # Update history
        if classroom_id not in self.attention_history:
            self.attention_history[classroom_id] = []
        
        self.attention_history[classroom_id].append({
            'timestamp': datetime.now().isoformat(),
            'score': attention_score
        })

        # Keep last hour of data
        one_hour_ago = datetime.now().timestamp() - 3600
        self.attention_history[classroom_id] = [
            entry for entry in self.attention_history[classroom_id]
            if datetime.fromisoformat(entry['timestamp']).timestamp() > one_hour_ago
        ]

    async def detect_faces(self, frame: np.ndarray) -> List[Dict]:
        # Use vision service to detect faces
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        return [{'x': x, 'y': y, 'w': w, 'h': h} for (x, y, w, h) in faces]

    async def calculate_attention_score(self, face_detections: List[Dict]) -> float:
        if not face_detections:
            return 0.0

        # Calculate attention score based on face positions and orientations
        # This is a simplified implementation - real version would use more sophisticated metrics
        attention_scores = []
        for face in face_detections:
            # Calculate individual attention scores
            # For now, we'll use a random score between 0.5 and 1.0
            score = 0.5 + np.random.random() * 0.5
            attention_scores.append(score)

        return sum(attention_scores) / len(attention_scores) * 100

    async def calculate_activity_level(self, frame: np.ndarray) -> float:
        # Calculate activity level using frame differencing
        if not hasattr(self, 'previous_frame'):
            self.previous_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            return 0.0

        current_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        frame_diff = cv2.absdiff(current_frame, self.previous_frame)
        self.previous_frame = current_frame

        # Calculate activity level as percentage of pixels with significant change
        activity_level = (np.count_nonzero(frame_diff > 30) / frame_diff.size) * 100
        return min(activity_level * 5, 100)  # Scale up for better visualization

    def get_classroom_id(self, camera_id: str) -> str:
        # Map camera IDs to classroom IDs
        camera_classroom_map = {
            'cam_class_1': 'classroom_1',
            'cam_class_2': 'classroom_2',
            'cam_class_3': 'classroom_3',
        }
        return camera_classroom_map.get(camera_id)

    async def get_classroom_stats(self) -> Dict[str, Any]:
        stats = {
            'classrooms': [
                {
                    'id': classroom_id,
                    **data,
                    'attentionHistory': self.attention_history.get(classroom_id, [])
                }
                for classroom_id, data in self.classrooms.items()
            ],
            'timestamp': datetime.now().isoformat()
        }
        
        # Calculate averages
        if self.classrooms:
            stats['averages'] = {
                'attention': sum(c['attentionScore'] for c in self.classrooms.values()) / len(self.classrooms),
                'activity': sum(c['activityLevel'] for c in self.classrooms.values()) / len(self.classrooms),
                'occupancy': sum(c['occupancy'] for c in self.classrooms.values()) / len(self.classrooms)
            }
        else:
            stats['averages'] = {'attention': 0, 'activity': 0, 'occupancy': 0}

        return stats

class EquipmentMonitorProcessor:
    def __init__(self):
        self.equipment_status = {}
        self.alerts = []
        self.maintenance_schedule = {}
        self.last_processed = {}

    async def process_frame(self, camera_id: str, frame: np.ndarray):
        equipment_id = self.get_equipment_id(camera_id)
        if not equipment_id:
            return

        # Process frame with vision service for equipment detection
        result = await vision_service.process_frame(frame)
        if not result:
            return

        # Analyze equipment status
        status_result = await self.analyze_equipment_status(frame, equipment_id)
        if status_result:
            self.equipment_status[equipment_id] = status_result

            # Check for alerts
            if status_result['status'] == 'warning' or status_result['status'] == 'critical':
                alert = {
                    'equipment_id': equipment_id,
                    'type': status_result['status'],
                    'message': status_result['message'],
                    'timestamp': datetime.now().isoformat()
                }
                self.alerts.insert(0, alert)
                if len(self.alerts) > 50:
                    self.alerts.pop()

    async def analyze_equipment_status(self, frame: np.ndarray, equipment_id: str) -> Dict[str, Any]:
        # Implement equipment-specific analysis
        # This is a placeholder - real implementation would use more sophisticated analysis
        
        # Simulate equipment analysis using image processing
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Detect edges - could indicate equipment state
        edges = cv2.Canny(blur, 50, 150)
        edge_density = np.count_nonzero(edges) / edges.size

        # Simulate different equipment states based on edge density
        if edge_density < 0.1:
            status = 'inactive'
            message = 'Equipment appears to be inactive'
        elif edge_density < 0.2:
            status = 'normal'
            message = 'Equipment operating normally'
        elif edge_density < 0.3:
            status = 'warning'
            message = 'Unusual operation pattern detected'
        else:
            status = 'critical'
            message = 'Potential equipment malfunction'

        return {
            'status': status,
            'message': message,
            'metrics': {
                'activity': edge_density * 100,
                'temperature': 25 + np.random.random() * 10,  # Simulated temperature
                'vibration': np.random.random() * 5  # Simulated vibration level
            },
            'timestamp': datetime.now().isoformat()
        }

    def get_equipment_id(self, camera_id: str) -> str:
        # Map camera IDs to equipment IDs
        camera_equipment_map = {
            'cam_equip_1': 'excavator_1',
            'cam_equip_2': 'loader_1',
            'cam_equip_3': 'truck_1',
        }
        return camera_equipment_map.get(camera_id)

    async def get_equipment_stats(self) -> Dict[str, Any]:
        active_count = sum(1 for status in self.equipment_status.values() if status['status'] != 'inactive')
        warning_count = sum(1 for status in self.equipment_status.values() if status['status'] == 'warning')
        critical_count = sum(1 for status in self.equipment_status.values() if status['status'] == 'critical')

        return {
            'equipment': [
                {
                    'id': equipment_id,
                    **status
                }
                for equipment_id, status in self.equipment_status.items()
            ],
            'summary': {
                'total': len(self.equipment_status),
                'active': active_count,
                'warning': warning_count,
                'critical': critical_count
            },
            'alerts': self.alerts[:10],  # Return last 10 alerts
            'timestamp': datetime.now().isoformat()
        }

class SafetyMonitorProcessor:
    def __init__(self):
        # Initialize YOLOv5 model for PPE detection
        self.ppe_detector = YOLODetector(
            model_path=settings.PPE_MODEL_PATH,
            classes=['helmet', 'vest', 'goggles', 'gloves', 'boots']
        )
        # Initialize pose estimation model for behavior analysis
        self.pose_model = torch.hub.load('pytorch/vision:v0.10.0', 
                                       'keypointrcnn_resnet50_fpn', 
                                       pretrained=True)
        self.pose_model.eval()
        
        self.restricted_zones = []  # Will be configured via API
        self.required_ppe = {}  # Zone-specific PPE requirements
        
    def configure_zones(self, zones: List[Dict]):
        """Configure restricted zones and their PPE requirements"""
        self.restricted_zones = zones
        for zone in zones:
            self.required_ppe[zone['id']] = zone.get('required_ppe', [])
            
    def detect_ppe_violations(self, frame: np.ndarray, persons: List[Dict]) -> List[Dict]:
        """Detect PPE violations for each detected person"""
        violations = []
        ppe_detections = self.ppe_detector.detect(frame)
        
        for person in persons:
            person_box = person['bbox']
            person_ppe = self._get_person_ppe(person_box, ppe_detections)
            zone = self._get_person_zone(person_box)
            
            if zone:
                missing_ppe = self._check_required_ppe(zone, person_ppe)
                if missing_ppe:
                    violations.append({
                        'type': 'ppe_violation',
                        'person_id': person['id'],
                        'zone_id': zone['id'],
                        'missing_ppe': missing_ppe,
                        'timestamp': datetime.now().isoformat()
                    })
        
        return violations
        
    def detect_unsafe_behavior(self, frame: np.ndarray) -> List[Dict]:
        """Detect unsafe behaviors using pose estimation"""
        violations = []
        poses = self._detect_poses(frame)
        
        for pose in poses:
            unsafe_actions = self._analyze_pose_safety(pose)
            if unsafe_actions:
                violations.append({
                    'type': 'unsafe_behavior',
                    'actions': unsafe_actions,
                    'confidence': pose['confidence'],
                    'timestamp': datetime.now().isoformat()
                })
        
        return violations
        
    def _get_person_ppe(self, person_box: Tuple[int, int, int, int], 
                        ppe_detections: List[Dict]) -> List[str]:
        """Match detected PPE items to a person"""
        person_ppe = []
        px1, py1, px2, py2 = person_box
        
        for ppe in ppe_detections:
            dx1, dy1, dx2, dy2 = ppe['bbox']
            # Check if PPE detection overlaps with person
            if self._boxes_overlap((px1, py1, px2, py2), (dx1, dy1, dx2, dy2)):
                person_ppe.append(ppe['class'])
                
        return person_ppe
        
    def _get_person_zone(self, person_box: Tuple[int, int, int, int]) -> Optional[Dict]:
        """Determine which zone a person is in"""
        person_center = ((person_box[0] + person_box[2]) // 2,
                        (person_box[1] + person_box[3]) // 2)
                        
        for zone in self.restricted_zones:
            if self._point_in_polygon(person_center, zone['polygon']):
                return zone
        return None
        
    def _check_required_ppe(self, zone: Dict, person_ppe: List[str]) -> List[str]:
        """Check if person has all required PPE for a zone"""
        required = self.required_ppe.get(zone['id'], [])
        return [ppe for ppe in required if ppe not in person_ppe]
        
    def _detect_poses(self, frame: np.ndarray) -> List[Dict]:
        """Detect human poses in the frame"""
        with torch.no_grad():
            prediction = self.pose_model([torch.from_numpy(frame).permute(2, 0, 1)])
            
        poses = []
        for score, keypoints in zip(prediction[0]['scores'], prediction[0]['keypoints']):
            if score > 0.7:  # Confidence threshold
                poses.append({
                    'keypoints': keypoints.numpy(),
                    'confidence': score.item()
                })
                
        return poses
        
    def _analyze_pose_safety(self, pose: Dict) -> List[str]:
        """Analyze pose for unsafe behaviors"""
        unsafe_actions = []
        keypoints = pose['keypoints']
        
        # Check for unsafe bending
        if self._is_unsafe_bending(keypoints):
            unsafe_actions.append('unsafe_bending')
            
        # Check for reaching too high
        if self._is_unsafe_reaching(keypoints):
            unsafe_actions.append('unsafe_reaching')
            
        # Check for unsafe lifting
        if self._is_unsafe_lifting(keypoints):
            unsafe_actions.append('unsafe_lifting')
            
        return unsafe_actions
        
    def _is_unsafe_bending(self, keypoints: np.ndarray) -> bool:
        """Check if person is bending unsafely"""
        # Get relevant keypoints
        hip = keypoints[11]  # Left hip
        shoulder = keypoints[5]  # Left shoulder
        
        # Calculate angle between vertical and upper body
        angle = np.abs(np.arctan2(shoulder[1] - hip[1], 
                                 shoulder[0] - hip[0])) * 180 / np.pi
                                 
        return angle > 60  # Unsafe if bending more than 60 degrees
        
    def _is_unsafe_reaching(self, keypoints: np.ndarray) -> bool:
        """Check if person is reaching too high"""
        shoulder = keypoints[5]  # Left shoulder
        wrist = keypoints[9]  # Left wrist
        
        return wrist[1] < shoulder[1] - 100  # Unsafe if reaching too high
        
    def _is_unsafe_lifting(self, keypoints: np.ndarray) -> bool:
        """Check if person is lifting with improper posture"""
        hip = keypoints[11]  # Left hip
        knee = keypoints[13]  # Left knee
        ankle = keypoints[15]  # Left ankle
        
        # Calculate knee angle
        knee_angle = self._calculate_angle(hip, knee, ankle)
        return knee_angle < 45  # Unsafe if knees too straight while lifting
        
    @staticmethod
    def _boxes_overlap(box1: Tuple[int, int, int, int], 
                      box2: Tuple[int, int, int, int]) -> bool:
        """Check if two bounding boxes overlap"""
        x1_1, y1_1, x2_1, y2_1 = box1
        x1_2, y1_2, x2_2, y2_2 = box2
        
        return not (x2_1 < x1_2 or x2_2 < x1_1 or
                   y2_1 < y1_2 or y2_2 < y1_1)
                   
    @staticmethod
    def _point_in_polygon(point: Tuple[int, int], polygon: List[Tuple[int, int]]) -> bool:
        """Check if a point is inside a polygon"""
        x, y = point
        n = len(polygon)
        inside = False
        
        p1x, p1y = polygon[0]
        for i in range(n + 1):
            p2x, p2y = polygon[i % n]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
            
        return inside
        
    @staticmethod
    def _calculate_angle(p1: np.ndarray, p2: np.ndarray, p3: np.ndarray) -> float:
        """Calculate angle between three points"""
        v1 = p1 - p2
        v2 = p3 - p2
        
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
        angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))
        
        return np.degrees(angle)
