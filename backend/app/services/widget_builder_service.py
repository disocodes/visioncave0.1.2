from typing import Dict, Any, List
from fastapi import HTTPException
import json
from ..models.sql_models import Widget
from sqlalchemy.orm import Session
import networkx as nx

class WidgetBuilderService:
    def __init__(self):
        self.node_processors = {
            'cameraInput': self.process_camera_input,
            'imageProcessing': self.process_image_processing,
            'objectDetection': self.process_object_detection,
            'personTracking': self.process_person_tracking,
            'vehicleTracking': self.process_vehicle_tracking,
            'analytics': self.process_analytics,
            'timeSeriesAnalysis': self.process_time_series,
            'alert': self.process_alert,
            'incidentDetection': self.process_incident_detection,
        }

    async def create_custom_widget(
        self, db: Session, name: str, configuration: Dict[str, Any], user_id: int
    ) -> Widget:
        """Create a new custom widget from the visual builder configuration."""
        try:
            # Validate the widget configuration
            self.validate_widget_configuration(configuration)
            
            # Create widget record
            widget = Widget(
                name=name,
                type='custom',
                configuration=configuration,
                owner_id=user_id
            )
            
            db.add(widget)
            db.commit()
            db.refresh(widget)
            
            return widget
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    async def preview_widget(self, configuration: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a preview of the widget's output based on its configuration."""
        try:
            # Create a directed graph from the configuration
            graph = self.create_processing_graph(configuration)
            
            # Validate the processing flow
            self.validate_processing_flow(graph)
            
            # Execute a test run of the processing pipeline
            result = await self.execute_processing_pipeline(graph)
            
            return result
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    def validate_widget_configuration(self, configuration: Dict[str, Any]):
        """Validate the widget configuration structure and node connections."""
        nodes = configuration.get('nodes', [])
        edges = configuration.get('edges', [])
        
        if not nodes:
            raise ValueError("Widget must contain at least one node")
        
        # Create a graph to validate connections
        graph = nx.DiGraph()
        
        # Add nodes
        for node in nodes:
            graph.add_node(node['id'], type=node['type'])
        
        # Add edges
        for edge in edges:
            graph.add_edge(edge['source'], edge['target'])
        
        # Validate that there are no cycles
        if not nx.is_directed_acyclic_graph(graph):
            raise ValueError("Widget configuration contains cycles")
        
        # Validate that there is at least one input and one output
        input_nodes = [n for n in nodes if n['type'] == 'cameraInput']
        output_nodes = [n for n in nodes if n['type'] in ['analytics', 'alert']]
        
        if not input_nodes:
            raise ValueError("Widget must contain at least one camera input node")
        if not output_nodes:
            raise ValueError("Widget must contain at least one output node (analytics or alert)")

    def create_processing_graph(self, configuration: Dict[str, Any]) -> nx.DiGraph:
        """Create a directed graph representing the processing pipeline."""
        graph = nx.DiGraph()
        
        for node in configuration['nodes']:
            graph.add_node(
                node['id'],
                type=node['type'],
                data=node.get('data', {})
            )
        
        for edge in configuration['edges']:
            graph.add_edge(edge['source'], edge['target'])
        
        return graph

    def validate_processing_flow(self, graph: nx.DiGraph):
        """Validate the processing flow for logical consistency."""
        # Ensure proper node order (e.g., processing nodes should come after input nodes)
        for node in nx.topological_sort(graph):
            node_type = graph.nodes[node]['type']
            predecessors = list(graph.predecessors(node))
            
            if node_type != 'cameraInput' and not predecessors:
                raise ValueError(f"Node {node} of type {node_type} has no input connections")
            
            if node_type == 'cameraInput' and predecessors:
                raise ValueError("Camera input nodes cannot have incoming connections")

    async def execute_processing_pipeline(self, graph: nx.DiGraph) -> Dict[str, Any]:
        """Execute the processing pipeline for preview purposes."""
        results = {}
        
        # Process nodes in topological order
        for node in nx.topological_sort(graph):
            node_data = graph.nodes[node]
            node_type = node_data['type']
            
            # Get processor for node type
            processor = self.node_processors.get(node_type)
            if not processor:
                raise ValueError(f"Unknown node type: {node_type}")
            
            # Get input data from predecessor nodes
            input_data = {}
            for pred in graph.predecessors(node):
                input_data[pred] = results[pred]
            
            # Process node
            results[node] = await processor(node_data['data'], input_data)
        
        return results

    # Node Processors
    async def process_camera_input(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process camera input node."""
        # In preview mode, return sample frame data
        return {
            'type': 'frame',
            'width': 1280,
            'height': 720,
            'format': 'RGB',
        }

    async def process_image_processing(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process image processing node."""
        return {
            'type': 'processed_frame',
            'operations': config.get('preprocessing', []),
        }

    async def process_object_detection(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process object detection node."""
        return {
            'type': 'detection_result',
            'objects': [
                {'class': 'person', 'confidence': 0.95, 'bbox': [100, 100, 200, 200]},
                {'class': 'car', 'confidence': 0.87, 'bbox': [300, 300, 500, 400]},
            ],
        }

    async def process_person_tracking(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process person tracking node."""
        return {
            'type': 'tracking_result',
            'tracks': [
                {'id': 1, 'position': [150, 150], 'velocity': [1, 0]},
            ],
        }

    async def process_vehicle_tracking(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process vehicle tracking node."""
        return {
            'type': 'tracking_result',
            'tracks': [
                {'id': 1, 'type': 'car', 'position': [400, 350], 'velocity': [-1, 0]},
            ],
        }

    async def process_analytics(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process analytics node."""
        return {
            'type': 'analytics_result',
            'metrics': {
                'object_count': 2,
                'average_speed': 5.2,
                'direction_histogram': {'north': 0.3, 'south': 0.7},
            },
        }

    async def process_time_series(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process time series analysis node."""
        return {
            'type': 'time_series_result',
            'trend': 'increasing',
            'forecast': [10, 12, 15, 18],
        }

    async def process_alert(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process alert node."""
        return {
            'type': 'alert',
            'severity': 'medium',
            'message': 'Unusual activity detected',
            'timestamp': '2024-01-01T00:00:00Z',
        }

    async def process_incident_detection(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process incident detection node."""
        return {
            'type': 'incident',
            'detected': True,
            'category': 'suspicious_behavior',
            'confidence': 0.85,
        }
