import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Slider,
  Button,
} from '@mui/material';

const nodeConfigs = {
  cameraInput: {
    fields: [
      { name: 'cameraId', type: 'select', label: 'Camera', options: [] },
      { name: 'frameRate', type: 'slider', label: 'Frame Rate', min: 1, max: 60 },
      { name: 'resolution', type: 'select', label: 'Resolution', 
        options: ['640x480', '1280x720', '1920x1080'] },
    ],
  },
  imageProcessing: {
    fields: [
      { name: 'preprocessing', type: 'select', label: 'Preprocessing',
        options: ['none', 'grayscale', 'blur', 'sharpen'] },
      { name: 'contrast', type: 'slider', label: 'Contrast', min: -100, max: 100 },
      { name: 'brightness', type: 'slider', label: 'Brightness', min: -100, max: 100 },
    ],
  },
  objectDetection: {
    fields: [
      { name: 'model', type: 'select', label: 'Detection Model',
        options: ['yolov5', 'faster_rcnn', 'ssd'] },
      { name: 'confidence', type: 'slider', label: 'Confidence Threshold', min: 0, max: 1, step: 0.01 },
      { name: 'classes', type: 'multiselect', label: 'Object Classes',
        options: ['person', 'car', 'truck', 'bicycle', 'motorcycle'] },
    ],
  },
  analytics: {
    fields: [
      { name: 'metricType', type: 'select', label: 'Metric Type',
        options: ['count', 'speed', 'direction', 'dwell_time'] },
      { name: 'interval', type: 'select', label: 'Update Interval',
        options: ['1s', '5s', '10s', '30s', '1m'] },
      { name: 'aggregation', type: 'select', label: 'Aggregation',
        options: ['sum', 'average', 'max', 'min'] },
    ],
  },
  alert: {
    fields: [
      { name: 'condition', type: 'select', label: 'Trigger Condition',
        options: ['threshold', 'anomaly', 'pattern'] },
      { name: 'severity', type: 'select', label: 'Severity',
        options: ['low', 'medium', 'high'] },
      { name: 'notification', type: 'multiselect', label: 'Notification Methods',
        options: ['email', 'sms', 'webhook', 'dashboard'] },
    ],
  },
};

export default function NodeProperties({ node, onUpdate }) {
  const [properties, setProperties] = useState({});
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    setProperties(node.data);
    if (node.type === 'cameraInput') {
      fetchCameras();
    }
  }, [node]);

  const fetchCameras = async () => {
    try {
      const response = await fetch('/api/v1/cameras');
      const data = await response.json();
      setCameras(data);
      nodeConfigs.cameraInput.fields[0].options = data.map(camera => ({
        value: camera.id,
        label: camera.name,
      }));
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  const handleChange = (field, value) => {
    const updatedProperties = {
      ...properties,
      [field]: value,
    };
    setProperties(updatedProperties);
    onUpdate(updatedProperties);
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={properties[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            margin="normal"
          />
        );

      case 'select':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={properties[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              {field.options.map((option) => (
                <MenuItem 
                  key={typeof option === 'string' ? option : option.value} 
                  value={typeof option === 'string' ? option : option.value}
                >
                  {typeof option === 'string' ? option : option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>{field.label}</InputLabel>
            <Select
              multiple
              value={properties[field.name] || []}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              {field.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'slider':
        return (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography gutterBottom>{field.label}</Typography>
            <Slider
              value={properties[field.name] || field.min}
              min={field.min}
              max={field.max}
              step={field.step || 1}
              onChange={(_, value) => handleChange(field.name, value)}
              valueLabelDisplay="auto"
            />
          </Box>
        );

      case 'switch':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={properties[field.name] || false}
                onChange={(e) => handleChange(field.name, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      default:
        return null;
    }
  };

  const config = nodeConfigs[node.type];
  if (!config) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        right: 0,
        top: 64,
        width: 300,
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {node.type} Properties
      </Typography>
      
      <TextField
        fullWidth
        label="Node Name"
        value={properties.label || ''}
        onChange={(e) => handleChange('label', e.target.value)}
        margin="normal"
      />

      {config.fields.map((field) => (
        <Box key={field.name}>
          {renderField(field)}
        </Box>
      ))}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => onUpdate(properties)}
      >
        Apply Changes
      </Button>
    </Paper>
  );
}
