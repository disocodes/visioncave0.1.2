import numpy as np
from typing import Dict, Any, List, Optional
import cv2
import torch
import tensorflow as tf
from sklearn.cluster import DBSCAN
from scipy.spatial.distance import cdist
import pandas as pd
from datetime import datetime, timedelta
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class AdvancedAnalytics:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.tracking_history = {}
        self.heat_maps = {}
        self.behavior_patterns = {}
        
    async def analyze_movement_patterns(
        self, detections: List[Dict[str, Any]], camera_id: int
    ) -> Dict[str, Any]:
        """Analyze movement patterns from object detections."""
        try:
            # Extract trajectories
            trajectories = self._extract_trajectories(detections)
            
            # Cluster trajectories to identify common paths
            clusters = self._cluster_trajectories(trajectories)
            
            # Calculate movement statistics
            stats = self._calculate_movement_stats(trajectories)
            
            # Update heat map
            self._update_heat_map(camera_id, trajectories)
            
            return {
                'common_paths': clusters,
                'statistics': stats,
                'heat_map': self.heat_maps.get(camera_id, {})
            }
        except Exception as e:
            logger.error(f"Error analyzing movement patterns: {str(e)}")
            return {}

    async def detect_anomalies(
        self, current_data: Dict[str, Any], historical_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Detect anomalies in behavior patterns."""
        try:
            # Convert data to time series
            ts_data = pd.DataFrame(historical_data)
            
            # Calculate statistical measures
            mean = ts_data.mean()
            std = ts_data.std()
            
            # Detect anomalies using Z-score
            z_scores = np.abs((current_data - mean) / std)
            anomalies = z_scores > 3  # 3 standard deviations
            
            # Analyze temporal patterns
            temporal_anomalies = self._detect_temporal_anomalies(
                current_data, historical_data
            )
            
            return {
                'statistical_anomalies': anomalies.tolist(),
                'temporal_anomalies': temporal_anomalies,
                'confidence_scores': (1 - (z_scores / 10)).clip(0, 1).tolist()
            }
        except Exception as e:
            logger.error(f"Error detecting anomalies: {str(e)}")
            return {}

    async def analyze_behavior(
        self, detections: List[Dict[str, Any]], camera_id: int
    ) -> Dict[str, Any]:
        """Analyze behavior patterns of detected objects."""
        try:
            # Extract object interactions
            interactions = self._analyze_object_interactions(detections)
            
            # Analyze dwell time
            dwell_analysis = self._analyze_dwell_time(detections)
            
            # Detect suspicious patterns
            suspicious_patterns = self._detect_suspicious_patterns(
                detections, interactions
            )
            
            # Update behavior patterns history
            self._update_behavior_patterns(camera_id, {
                'interactions': interactions,
                'dwell_time': dwell_analysis,
                'suspicious': suspicious_patterns
            })
            
            return {
                'interactions': interactions,
                'dwell_analysis': dwell_analysis,
                'suspicious_patterns': suspicious_patterns
            }
        except Exception as e:
            logger.error(f"Error analyzing behavior: {str(e)}")
            return {}

    async def generate_occupancy_analytics(
        self, detections: List[Dict[str, Any]], zones: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate occupancy analytics for defined zones."""
        try:
            zone_occupancy = {}
            for zone in zones:
                # Count objects in each zone
                objects_in_zone = self._count_objects_in_zone(
                    detections, zone['coordinates']
                )
                
                # Calculate occupancy percentage
                occupancy = (objects_in_zone / zone['capacity']) * 100
                
                zone_occupancy[zone['id']] = {
                    'count': objects_in_zone,
                    'occupancy_percentage': occupancy,
                    'status': self._get_occupancy_status(occupancy)
                }
            
            return {
                'zone_occupancy': zone_occupancy,
                'total_occupancy': sum(z['count'] for z in zone_occupancy.values()),
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error generating occupancy analytics: {str(e)}")
            return {}

    def _extract_trajectories(
        self, detections: List[Dict[str, Any]]
    ) -> List[np.ndarray]:
        """Extract object trajectories from detections."""
        trajectories = {}
        
        for detection in detections:
            obj_id = detection['object_id']
            position = np.array([detection['x'], detection['y']])
            
            if obj_id not in trajectories:
                trajectories[obj_id] = []
            trajectories[obj_id].append(position)
        
        return [np.array(traj) for traj in trajectories.values()]

    def _cluster_trajectories(
        self, trajectories: List[np.ndarray]
    ) -> List[Dict[str, Any]]:
        """Cluster similar trajectories to identify common paths."""
        if not trajectories:
            return []
        
        # Normalize trajectories to same length
        max_length = max(len(traj) for traj in trajectories)
        normalized_trajectories = []
        
        for traj in trajectories:
            if len(traj) < max_length:
                # Interpolate trajectory
                indices = np.linspace(0, len(traj)-1, max_length)
                normalized_traj = np.array([
                    np.interp(indices, range(len(traj)), traj[:, i])
                    for i in range(traj.shape[1])
                ]).T
                normalized_trajectories.append(normalized_traj)
            else:
                normalized_trajectories.append(traj)
        
        # Flatten trajectories for clustering
        flattened = np.array([traj.flatten() for traj in normalized_trajectories])
        
        # Perform DBSCAN clustering
        clustering = DBSCAN(eps=50, min_samples=2).fit(flattened)
        
        clusters = []
        for label in set(clustering.labels_):
            if label == -1:  # Skip noise
                continue
            
            cluster_trajectories = [
                normalized_trajectories[i]
                for i, l in enumerate(clustering.labels_)
                if l == label
            ]
            
            # Calculate mean trajectory for cluster
            mean_trajectory = np.mean(cluster_trajectories, axis=0)
            
            clusters.append({
                'id': label,
                'trajectory': mean_trajectory.tolist(),
                'count': len(cluster_trajectories)
            })
        
        return clusters

    def _calculate_movement_stats(
        self, trajectories: List[np.ndarray]
    ) -> Dict[str, Any]:
        """Calculate movement statistics from trajectories."""
        stats = {
            'average_speed': [],
            'direction_changes': [],
            'path_length': []
        }
        
        for traj in trajectories:
            if len(traj) < 2:
                continue
            
            # Calculate speeds
            distances = np.sqrt(np.sum(np.diff(traj, axis=0)**2, axis=1))
            speeds = distances / 1.0  # Assuming 1 second between detections
            stats['average_speed'].append(np.mean(speeds))
            
            # Calculate direction changes
            vectors = np.diff(traj, axis=0)
            angles = np.arctan2(vectors[:, 1], vectors[:, 0])
            direction_changes = np.abs(np.diff(angles))
            stats['direction_changes'].append(np.sum(direction_changes))
            
            # Calculate path length
            stats['path_length'].append(np.sum(distances))
        
        return {
            'average_speed': np.mean(stats['average_speed']),
            'average_direction_changes': np.mean(stats['direction_changes']),
            'average_path_length': np.mean(stats['path_length'])
        }

    def _update_heat_map(self, camera_id: int, trajectories: List[np.ndarray]):
        """Update heat map for camera view."""
        if camera_id not in self.heat_maps:
            self.heat_maps[camera_id] = np.zeros((1080, 1920))  # Full HD resolution
        
        for traj in trajectories:
            for point in traj:
                x, y = point.astype(int)
                self.heat_maps[camera_id][
                    max(0, y-5):min(1080, y+6),
                    max(0, x-5):min(1920, x+6)
                ] += 1
        
        # Normalize heat map
        self.heat_maps[camera_id] = cv2.normalize(
            self.heat_maps[camera_id], None, 0, 255, cv2.NORM_MINMAX
        )

    def _detect_temporal_anomalies(
        self, current_data: Dict[str, Any], historical_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Detect temporal anomalies in behavior patterns."""
        anomalies = []
        
        # Group historical data by time of day
        df = pd.DataFrame(historical_data)
        df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
        
        # Calculate normal patterns for each hour
        hourly_patterns = df.groupby('hour').agg({
            'object_count': ['mean', 'std'],
            'average_speed': ['mean', 'std']
        })
        
        # Check current data against normal patterns
        current_hour = datetime.fromisoformat(current_data['timestamp']).hour
        normal_pattern = hourly_patterns.loc[current_hour]
        
        # Check for anomalies in different metrics
        metrics = ['object_count', 'average_speed']
        for metric in metrics:
            current_value = current_data[metric]
            mean = normal_pattern[metric]['mean']
            std = normal_pattern[metric]['std']
            
            if abs(current_value - mean) > 3 * std:
                anomalies.append({
                    'metric': metric,
                    'value': current_value,
                    'expected_range': [mean - 2*std, mean + 2*std],
                    'confidence': float(abs(current_value - mean) / (3 * std))
                })
        
        return anomalies

    def _analyze_object_interactions(
        self, detections: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze interactions between detected objects."""
        interactions = []
        
        # Group detections by timestamp
        detections_by_time = {}
        for detection in detections:
            timestamp = detection['timestamp']
            if timestamp not in detections_by_time:
                detections_by_time[timestamp] = []
            detections_by_time[timestamp].append(detection)
        
        # Analyze interactions at each timestamp
        for timestamp, frame_detections in detections_by_time.items():
            positions = np.array([[d['x'], d['y']] for d in frame_detections])
            
            if len(positions) < 2:
                continue
            
            # Calculate pairwise distances
            distances = cdist(positions, positions)
            
            # Find close interactions
            close_pairs = np.where(distances < 100)  # 100 pixels threshold
            
            for i, j in zip(*close_pairs):
                if i >= j:  # Avoid duplicate pairs
                    continue
                
                interactions.append({
                    'timestamp': timestamp,
                    'object1_id': frame_detections[i]['object_id'],
                    'object2_id': frame_detections[j]['object_id'],
                    'distance': float(distances[i, j]),
                    'duration': 1  # Will be updated in post-processing
                })
        
        return self._post_process_interactions(interactions)

    def _post_process_interactions(
        self, interactions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Post-process interactions to calculate durations and patterns."""
        # Group interactions by object pairs
        interaction_groups = {}
        for interaction in interactions:
            pair_key = tuple(sorted([
                interaction['object1_id'],
                interaction['object2_id']
            ]))
            
            if pair_key not in interaction_groups:
                interaction_groups[pair_key] = []
            interaction_groups[pair_key].append(interaction)
        
        # Calculate interaction durations and patterns
        processed_interactions = []
        for pair_key, group in interaction_groups.items():
            # Sort by timestamp
            group.sort(key=lambda x: x['timestamp'])
            
            # Merge continuous interactions
            current_interaction = group[0]
            for next_interaction in group[1:]:
                time_diff = (
                    datetime.fromisoformat(next_interaction['timestamp']) -
                    datetime.fromisoformat(current_interaction['timestamp'])
                ).total_seconds()
                
                if time_diff <= 1.0:  # Continuous if less than 1 second gap
                    current_interaction['duration'] += 1
                else:
                    processed_interactions.append(current_interaction)
                    current_interaction = next_interaction
            
            processed_interactions.append(current_interaction)
        
        return processed_interactions

    def _count_objects_in_zone(
        self, detections: List[Dict[str, Any]], zone_coords: List[List[int]]
    ) -> int:
        """Count objects within a defined zone."""
        count = 0
        zone_polygon = np.array(zone_coords)
        
        for detection in detections:
            point = np.array([detection['x'], detection['y']])
            if cv2.pointPolygonTest(zone_polygon, tuple(point), False) >= 0:
                count += 1
        
        return count

    @staticmethod
    def _get_occupancy_status(percentage: float) -> str:
        """Get occupancy status based on percentage."""
        if percentage >= 90:
            return 'critical'
        elif percentage >= 75:
            return 'high'
        elif percentage >= 50:
            return 'moderate'
        else:
            return 'low'
