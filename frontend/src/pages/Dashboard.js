import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Paper, Typography, Grid, Alert } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import CameraWidget from '../components/widgets/CameraWidget';
import AnalyticsWidget from '../components/widgets/AnalyticsWidget';
import AlertWidget from '../components/widgets/AlertWidget';

// Module-specific widget configurations
const moduleWidgets = {
  residential: [
    { id: 'camera-main', type: 'camera', title: 'Live Camera Feed', isPermanent: true },
    { id: 'occupancy', type: 'analytics', title: 'Occupancy Tracking' },
    { id: 'package', type: 'analytics', title: 'Package Detection' },
    { id: 'suspicious', type: 'alert', title: 'Suspicious Activity Alerts' }
  ],
  school: [
    { id: 'camera-main', type: 'camera', title: 'Live Camera Feed', isPermanent: true },
    { id: 'attendance', type: 'analytics', title: 'Student Attendance' },
    { id: 'playground', type: 'analytics', title: 'Playground Safety' },
    { id: 'classroom', type: 'analytics', title: 'Classroom Attention Analysis' }
  ],
  hospital: [
    { id: 'camera-main', type: 'camera', title: 'Live Camera Feed', isPermanent: true },
    { id: 'fall', type: 'alert', title: 'Patient Fall Detection' },
    { id: 'hygiene', type: 'analytics', title: 'Hygiene Compliance' },
    { id: 'equipment', type: 'analytics', title: 'Equipment Tracking' }
  ],
  mine: [
    { id: 'camera-main', type: 'camera', title: 'Live Camera Feed', isPermanent: true },
    { id: 'machinery', type: 'analytics', title: 'Heavy Machinery Tracking' },
    { id: 'safety', type: 'alert', title: 'Safety Gear Compliance' },
    { id: 'hazard', type: 'alert', title: 'Hazardous Area Monitoring' }
  ],
  traffic: [
    { id: 'camera-main', type: 'camera', title: 'Live Camera Feed', isPermanent: true },
    { id: 'flow', type: 'analytics', title: 'Traffic Flow Analysis' },
    { id: 'parking', type: 'analytics', title: 'Parking Occupancy' },
    { id: 'incidents', type: 'alert', title: 'Public Safety Incidents' }
  ]
};

// Module titles for the dashboard header
const moduleTitles = {
  residential: 'Residential Vision Dashboard',
  school: 'School Vision Dashboard',
  hospital: 'Hospital Vision Dashboard',
  mine: 'Mine Site Vision Dashboard',
  traffic: 'Traffic Vision Dashboard'
};

const Dashboard = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [activeWidgets, setActiveWidgets] = useState([]);
  const [availableWidgets, setAvailableWidgets] = useState([]);

  useEffect(() => {
    if (!moduleId || !moduleWidgets[moduleId]) {
      navigate('/');
      return;
    }

    // Initialize widgets based on module configuration
    const moduleConfig = moduleWidgets[moduleId];
    setActiveWidgets(moduleConfig.filter(widget => widget.isPermanent));
    setAvailableWidgets(moduleConfig.filter(widget => !widget.isPermanent));
  }, [moduleId, navigate]);

  const handleAddWidget = (widget) => {
    setActiveWidgets([...activeWidgets, widget]);
    setAvailableWidgets(availableWidgets.filter(w => w.id !== widget.id));
  };

  const handleRemoveWidget = (widgetId) => {
    const widget = activeWidgets.find(w => w.id === widgetId);
    if (widget && !widget.isPermanent) {
      setActiveWidgets(activeWidgets.filter(w => w.id !== widgetId));
      setAvailableWidgets([...availableWidgets, widget]);
    }
  };

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'camera':
        return <CameraWidget key={widget.id} title={widget.title} />;
      case 'analytics':
        return <AnalyticsWidget key={widget.id} title={widget.title} />;
      case 'alert':
        return <AlertWidget key={widget.id} title={widget.title} />;
      default:
        return null;
    }
  };

  if (!moduleId || !moduleWidgets[moduleId]) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Invalid module selected</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {moduleTitles[moduleId]}
        </Typography>
        
        {availableWidgets.length > 0 && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add Widgets
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {availableWidgets.map((widget) => (
                <Button
                  key={widget.id}
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddWidget(widget)}
                  sx={{ borderColor: 'rgba(255, 255, 255, 0.23)', color: 'white' }}
                >
                  {widget.title}
                </Button>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {activeWidgets.map((widget) => (
          <Grid item xs={12} md={6} lg={4} key={widget.id}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: '#2a2a2a',
                color: 'white',
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{widget.title}</Typography>
                {!widget.isPermanent && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveWidget(widget.id)}
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              {renderWidget(widget)}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
