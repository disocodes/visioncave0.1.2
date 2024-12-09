import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Videocam,
  Analytics,
  Person,
  LocalParking,
  Warning,
  Timeline,
  Security,
  School,
  LocalHospital,
  Construction,
  TrafficOutlined,
  Settings,
} from '@mui/icons-material';

const nodeCategories = [
  {
    title: 'Input Nodes',
    nodes: [
      { type: 'camera', name: 'Camera Input', icon: Videocam, description: 'Capture video feed from camera' },
      { type: 'file', name: 'File Input', icon: Timeline, description: 'Load video or image files' },
    ],
  },
  {
    title: 'Processing Nodes',
    nodes: [
      { type: 'detection', name: 'Object Detection', icon: Security, description: 'Detect objects in video stream' },
      { type: 'tracking', name: 'Object Tracking', icon: Timeline, description: 'Track objects across frames' },
      { type: 'analytics', name: 'Analytics', icon: Analytics, description: 'Analyze video data' },
    ],
  },
  {
    title: 'Domain-Specific Nodes',
    nodes: [
      { type: 'residential', name: 'Residential', icon: Person, description: 'Residential monitoring features' },
      { type: 'school', name: 'School', icon: School, description: 'School monitoring features' },
      { type: 'hospital', name: 'Hospital', icon: LocalHospital, description: 'Hospital monitoring features' },
      { type: 'mine', name: 'Mine Site', icon: Construction, description: 'Mine site monitoring features' },
      { type: 'traffic', name: 'Traffic', icon: TrafficOutlined, description: 'Traffic monitoring features' },
    ],
  },
  {
    title: 'Output Nodes',
    nodes: [
      { type: 'alert', name: 'Alert', icon: Warning, description: 'Generate alerts based on conditions' },
      { type: 'dashboard', name: 'Dashboard', icon: Analytics, description: 'Display data on dashboard' },
      { type: 'database', name: 'Database', icon: Settings, description: 'Store data in database' },
    ],
  },
];

const NodeLibrary = () => {
  const onDragStart = (event, nodeType, nodeName) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeName', nodeName);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Node Library
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Drag and drop nodes to create your widget
      </Typography>

      {nodeCategories.map((category, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            {category.title}
          </Typography>
          <List dense>
            {category.nodes.map((node, nodeIndex) => (
              <Tooltip
                key={nodeIndex}
                title={node.description}
                placement="right"
              >
                <ListItem
                  button
                  draggable
                  onDragStart={(event) => onDragStart(event, node.type, node.name)}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <node.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={node.name}
                    primaryTypographyProps={{
                      variant: 'body2',
                    }}
                  />
                </ListItem>
              </Tooltip>
            ))}
          </List>
          {index < nodeCategories.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}
    </Box>
  );
};

export default NodeLibrary;
