import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Paper,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TimelineIcon from '@mui/icons-material/Timeline';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';

const drawerWidth = 240;

// Node types for different computer vision tasks
const nodeTypes = {
  videoInput: {
    label: 'Video Input',
    icon: VideocamIcon,
    color: '#4caf50',
  },
  objectDetection: {
    label: 'Object Detection',
    icon: SecurityIcon,
    color: '#2196f3',
  },
  peopleTracking: {
    label: 'People Tracking',
    icon: PeopleIcon,
    color: '#f44336',
  },
  analytics: {
    label: 'Analytics',
    icon: BarChartIcon,
    color: '#ff9800',
  },
  alerts: {
    label: 'Alerts',
    icon: NotificationsIcon,
    color: '#9c27b0',
  },
  visualization: {
    label: 'Visualization',
    icon: TimelineIcon,
    color: '#00bcd4',
  },
};

const WidgetBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const position = { x: event.clientX - drawerWidth, y: event.clientY };

      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: { label: nodeTypes[type].label },
        style: {
          background: nodeTypes[type].color,
          color: '#fff',
          padding: 10,
          borderRadius: 5,
          width: 150,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Box sx={{ overflow: 'auto', mt: 8 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Node Types
          </Typography>
          <Divider />
          <List>
            {Object.entries(nodeTypes).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <ListItem
                  key={type}
                  button
                  draggable
                  onDragStart={(event) => onDragStart(event, type)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Icon sx={{ color: config.color }} />
                  </ListItemIcon>
                  <ListItemText primary={config.label} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100%',
          backgroundColor: 'background.default',
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </Box>

      {selectedNode && (
        <Paper
          sx={{
            position: 'absolute',
            right: 20,
            top: 20,
            width: 300,
            p: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Node Properties
          </Typography>
          <Typography>ID: {selectedNode.id}</Typography>
          <Typography>Type: {selectedNode.type}</Typography>
          <IconButton
            size="small"
            onClick={() => setSelectedNode(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            ×
          </IconButton>
        </Paper>
      )}
    </Box>
  );
};

export default WidgetBuilder;
