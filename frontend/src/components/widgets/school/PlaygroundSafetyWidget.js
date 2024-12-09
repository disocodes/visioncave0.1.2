import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Paper,
  IconButton,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Warning as WarningIcon,
  PersonOff as PersonOffIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Map as MapIcon,
  Videocam as VideocamIcon,
  NotificationsActive as AlertIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  PlayCircle as PlayIcon,
  PauseCircle as PauseIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Line, Scatter } from 'react-chartjs-2';

const PlaygroundSafetyWidget = () => {
  const dispatch = useDispatch();
  const [safetyData, setSafetyData] = useState({
    currentOccupancy: 45,
    maxCapacity: 60,
    activeAlerts: 2,
    averageSpeed: 3.2,
    zones: [
      { id: 'A', name: 'Swing Area', occupancy: 12, status: 'normal' },
      { id: 'B', name: 'Slide Zone', occupancy: 8, status: 'warning' },
      { id: 'C', name: 'Climbing Frame', occupancy: 15, status: 'normal' },
      { id: 'D', name: 'Sand Pit', occupancy: 10, status: 'normal' },
    ],
    recentEvents: [
      {
        id: 1,
        timestamp: '14:30:25',
        type: 'overcrowding',
        zone: 'Slide Zone',
        severity: 'warning',
        details: 'High density of children detected',
      },
      {
        id: 2,
        timestamp: '14:28:15',
        type: 'running',
        zone: 'Swing Area',
        severity: 'caution',
        details: 'Fast movement detected near swings',
      },
    ],
  });

  const [selectedZone, setSelectedZone] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState('all');

  useEffect(() => {
    // Fetch safety monitoring data from backend
    // dispatch(fetchSafetyData());
  }, []);

  const occupancyTrendData = {
    labels: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50'],
    datasets: [
      {
        label: 'Occupancy',
        data: [35, 42, 38, 45, 43, 45],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Max Capacity',
        data: [60, 60, 60, 60, 60, 60],
        fill: false,
        borderColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const zoneActivityData = {
    datasets: [
      {
        label: 'Activity Hotspots',
        data: [
          { x: 2, y: 3, r: 15 },
          { x: 4, y: 1, r: 10 },
          { x: 3, y: 4, r: 8 },
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      normal: 'success',
      warning: 'warning',
      danger: 'error',
      caution: 'info',
    };
    return colors[status] || 'default';
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Playground Safety Monitor</Typography>
          <Box>
            <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
              <InputLabel>Camera</InputLabel>
              <Select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                label="Camera"
              >
                <MenuItem value="all">All Cameras</MenuItem>
                <MenuItem value="cam1">Camera 1</MenuItem>
                <MenuItem value="cam2">Camera 2</MenuItem>
                <MenuItem value="cam3">Camera 3</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Occupancy
              </Typography>
              <Typography variant="h4">
                {safetyData.currentOccupancy}/{safetyData.maxCapacity}
              </Typography>
              <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Active Alerts
              </Typography>
              <Typography variant="h4" color="warning.main">
                {safetyData.activeAlerts}
              </Typography>
              <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Average Speed
              </Typography>
              <Typography variant="h4">
                {safetyData.averageSpeed} m/s
              </Typography>
              <SpeedIcon sx={{ fontSize: 40, color: 'info.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Monitoring Status
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={monitoringActive}
                    onChange={(e) => setMonitoringActive(e.target.checked)}
                    color="success"
                  />
                }
                label={monitoringActive ? 'Active' : 'Paused'}
              />
              {monitoringActive ? (
                <PlayIcon sx={{ fontSize: 40, color: 'success.main', mt: 1 }} />
              ) : (
                <PauseIcon sx={{ fontSize: 40, color: 'error.main', mt: 1 }} />
              )}
            </Paper>
          </Grid>

          {/* Occupancy Trend */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Occupancy Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={occupancyTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: safetyData.maxCapacity + 10,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Activity Heatmap */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Activity Heatmap
              </Typography>
              <Box sx={{ height: 300 }}>
                <Scatter
                  data={zoneActivityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { min: 0, max: 5 },
                      y: { min: 0, max: 5 },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Zone Status */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Zone Status
              </Typography>
              <List>
                {safetyData.zones.map((zone) => (
                  <ListItem
                    key={zone.id}
                    button
                    onClick={() => handleZoneClick(zone)}
                  >
                    <ListItemIcon>
                      <MapIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={zone.name}
                      secondary={`Occupancy: ${zone.occupancy}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={zone.status}
                        color={getStatusColor(zone.status)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Recent Events */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Recent Events
              </Typography>
              <List>
                {safetyData.recentEvents.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemIcon>
                      <AlertIcon color={getStatusColor(event.severity)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.details}
                      secondary={`${event.timestamp} - ${event.zone}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={event.severity}
                        color={getStatusColor(event.severity)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Settings Dialog */}
        <Dialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Safety Monitoring Settings</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Maximum Capacity"
                  type="number"
                  value={safetyData.maxCapacity}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Speed Threshold (m/s)"
                  type="number"
                  value="5"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Automatic Alerts"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Motion Detection"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setSettingsOpen(false)}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Last updated: 2 minutes ago
          </Typography>
          <Button startIcon={<RefreshIcon />} size="small">
            Refresh
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlaygroundSafetyWidget;
