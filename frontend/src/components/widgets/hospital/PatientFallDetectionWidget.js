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
  Avatar,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Warning as WarningIcon,
  LocalHospital as HospitalIcon,
  PersonOff as FallIcon,
  Timer as TimerIcon,
  Videocam as CameraIcon,
  NotificationsActive as AlertIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
  Room as RoomIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Line, Pie } from 'react-chartjs-2';

const PatientFallDetectionWidget = () => {
  const dispatch = useDispatch();
  const [fallData, setFallData] = useState({
    totalPatients: 45,
    activeAlerts: 2,
    averageResponseTime: '45s',
    detectedFalls: 3,
    rooms: [
      { id: '101', name: 'Room 101', status: 'normal', patient: 'John Doe' },
      { id: '102', name: 'Room 102', status: 'alert', patient: 'Jane Smith' },
      { id: '103', name: 'Room 103', status: 'normal', patient: 'Bob Johnson' },
    ],
    recentEvents: [
      {
        id: 1,
        timestamp: '14:30:25',
        room: '102',
        patient: 'Jane Smith',
        type: 'fall',
        status: 'active',
        responseTime: '30s',
      },
      {
        id: 2,
        timestamp: '14:15:10',
        room: '105',
        patient: 'Mike Brown',
        type: 'fall',
        status: 'resolved',
        responseTime: '45s',
      },
    ],
  });

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('all');

  useEffect(() => {
    // Fetch fall detection data from backend
    // dispatch(fetchFallData());
  }, []);

  const fallDistributionData = {
    labels: ['Normal Activity', 'Near Falls', 'Detected Falls'],
    datasets: [
      {
        data: [85, 12, 3],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 206, 86)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const responseTimeTrendData = {
    labels: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50'],
    datasets: [
      {
        label: 'Response Time (seconds)',
        data: [55, 48, 42, 45, 40, 45],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      normal: 'success',
      alert: 'error',
      warning: 'warning',
      active: 'error',
      resolved: 'success',
    };
    return colors[status] || 'default';
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Patient Fall Detection</Typography>
          <Box>
            <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
              <InputLabel>Camera</InputLabel>
              <Select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                label="Camera"
              >
                <MenuItem value="all">All Cameras</MenuItem>
                <MenuItem value="floor1">Floor 1</MenuItem>
                <MenuItem value="floor2">Floor 2</MenuItem>
                <MenuItem value="floor3">Floor 3</MenuItem>
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
                Monitored Patients
              </Typography>
              <Typography variant="h4">{fallData.totalPatients}</Typography>
              <HospitalIcon sx={{ fontSize: 40, color: 'primary.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Active Alerts
              </Typography>
              <Typography variant="h4" color="error.main">
                {fallData.activeAlerts}
              </Typography>
              <WarningIcon sx={{ fontSize: 40, color: 'error.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Avg Response Time
              </Typography>
              <Typography variant="h4">{fallData.averageResponseTime}</Typography>
              <TimerIcon sx={{ fontSize: 40, color: 'info.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Detected Falls
              </Typography>
              <Typography variant="h4">{fallData.detectedFalls}</Typography>
              <FallIcon sx={{ fontSize: 40, color: 'warning.main', mt: 1 }} />
            </Paper>
          </Grid>

          {/* Fall Distribution */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Activity Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie
                  data={fallDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Response Time Trend */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Response Time Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={responseTimeTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Room Status */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Room Status
              </Typography>
              <List>
                {fallData.rooms.map((room) => (
                  <ListItem
                    key={room.id}
                    button
                    onClick={() => handleRoomClick(room)}
                  >
                    <ListItemIcon>
                      <RoomIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={room.name}
                      secondary={`Patient: ${room.patient}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={room.status}
                        color={getStatusColor(room.status)}
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
                {fallData.recentEvents.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemIcon>
                      <AlertIcon color={getStatusColor(event.status)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${event.type.toUpperCase()} - ${event.patient}`}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {event.room}
                          </Typography>
                          {` - ${event.timestamp}`}
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Response Time">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mr: 1 }}
                          >
                            {event.responseTime}
                          </Typography>
                        </Tooltip>
                        <Chip
                          label={event.status}
                          color={getStatusColor(event.status)}
                          size="small"
                        />
                      </Box>
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
          <DialogTitle>Fall Detection Settings</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Alert Threshold"
                  type="number"
                  value="75"
                  helperText="Confidence threshold for fall detection (%)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Response Time Threshold"
                  type="number"
                  value="60"
                  helperText="Maximum response time in seconds"
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
                  label="Night Mode Detection"
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

export default PatientFallDetectionWidget;
