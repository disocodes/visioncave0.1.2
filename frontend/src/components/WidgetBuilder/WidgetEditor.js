import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  VideoCamera,
  Analytics,
  Person,
  LocalParking,
  Warning,
} from '@mui/icons-material';
import NodeLibrary from './NodeLibrary';
import CustomNode from './CustomNode';
import { useSnackbar } from 'notistack';

const nodeTypes = {
  customNode: CustomNode,
};

const WidgetEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [widgetName, setWidgetName] = useState('');
  const { enqueueSnackbar } = useSnackbar();

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
      const name = event.dataTransfer.getData('nodeName');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - event.target.getBoundingClientRect().left,
        y: event.clientY - event.target.getBoundingClientRect().top,
      };

      const newNode = {
        id: `${type}-${nodes.length + 1}`,
        type: 'customNode',
        position,
        data: { label: name, type },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes, setNodes]
  );

  const handleSave = async () => {
    if (!widgetName.trim()) {
      enqueueSnackbar('Please enter a widget name', { variant: 'warning' });
      return;
    }

    try {
      const widgetConfig = {
        name: widgetName,
        nodes,
        edges,
        createdAt: new Date().toISOString(),
      };

      // Save widget configuration
      await fetch('/api/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(widgetConfig),
      });

      enqueueSnackbar('Widget saved successfully', { variant: 'success' });
      setSaveDialogOpen(false);
    } catch (error) {
      enqueueSnackbar('Error saving widget', { variant: 'error' });
    }
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <Drawer
        variant="persistent"
        anchor="left"
        open={libraryOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            position: 'relative',
          },
        }}
      >
        <NodeLibrary />
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Paper
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Widget Editor</Typography>
            <Box sx={{ mt: 1 }}>
              <Button
                variant="contained"
                onClick={() => setSaveDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Save Widget
              </Button>
              <Button
                variant="outlined"
                onClick={handleClear}
              >
                Clear
              </Button>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      >
        <DialogTitle>Save Widget</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Widget Name"
            fullWidth
            value={widgetName}
            onChange={(e) => setWidgetName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WidgetEditor;
