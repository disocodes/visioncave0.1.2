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
  Avatar,
} from '@mui/material';
import {
  Construction as ConstructionIcon,
  Speed as SpeedIcon,
  LocalGasStation as FuelIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Map as MapIcon,
  Timeline as TimelineIcon,
  DirectionsRun as OperatorIcon,
  Battery90 as BatteryIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Line, Scatter } from 'react-chartjs-2';

const HeavyMachineryTrackingWidget = () => {
  const dispatch = useDispatch();
  const [machineryData, setMachineryData] = useState({
    activeVehicles: 12,
    totalVehicles: 15,
    alerts: 2,
    fuelEfficiency: 85,
    vehicles: [
      {
        id: 'EX-001',
        type: 'Excavator',
        operator: 'John Smith',
        status: 'active',
        location: 'Zone A',
        fuel: 75,
        speed: 12,
        runtime: '5h 30m',
      },
      {
        id: 'DT-002',
        type: 'Dump Truck',
        operator: 'Alice Johnson',
        status: 'maintenance',
        location: 'Zone B',
        fuel: 45,
        speed: 0,
        runtime: '3h 15m',
      },
    ],
    recentEvents: [
      {
        id: 1,
        timestamp: '14:30:25',
        vehicle: 'EX-001',
        type: 'speed',
        severity: 'warning',
        details: 'Exceeding speed limit',
      },
      {
        id: 2,
        timestamp: '14:28:15',
        vehicle: 'DT-002',
        type: 'maintenance',
        severity: 'info',
        details: 'Scheduled maintenance due',
      },
    ],
  });

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState('all');

  useEffect(() => {
    // Fetch machinery tracking data from backend
    // dispatch(fetchMachineryData());
  }, []);

  const vehicleLocationData = {
    datasets: [
      {
        label: 'Vehicle Locations',
        data: [
          { x: 2, y: 3, r: 10 },
          { x: 4, y: 1, r: 8 },
          { x: 1, y: 4, r: 12 },
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const efficiencyTrendData = {
    labels: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50'],
    datasets: [
      {
        label: 'Fuel Efficiency',
        data: [82, 85, 83, 85, 84, 85],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      maintenance: 'warning',
      inactive: 'error',
      warning: 'warning',
      info: 'info',
    };
    return colors[status] || 'default';
  };

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Heavy Machinery Tracking</Typography>
          <Box>
            <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
              <InputLabel>Zone</InputLabel>
              <Select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                label="Zone"
              >
                <MenuItem value="all">All Zones</MenuItem>
                <MenuItem value="zoneA">Zone A</MenuItem>
                <MenuItem value="zoneB">Zone B</MenuItem>
                <MenuItem value="zoneC">Zone C</MenuItem>
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
                Active Vehicles
              </Typography>
              <Typography variant="h4">
                {machineryData.activeVehicles}/{machineryData.totalVehicles}
              </Typography>
              <ConstructionIcon
                sx={{ fontSize: 40, color: 'primary.main', mt: 1 }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Active Alerts
              </Typography>
              <Typography variant="h4" color="warning.main">
                {machineryData.alerts}
              </Typography>
              <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Fuel Efficiency
              </Typography>
              <Typography variant="h4">{machineryData.fuelEfficiency}%</Typography>
              <FuelIcon sx={{ fontSize: 40, color: 'success.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Average Speed
              </Typography>
              <Typography variant="h4">15 km/h</Typography>
              <SpeedIcon sx={{ fontSize: 40, color: 'info.main', mt: 1 }} />
            </Paper>
          </Grid>

          {/* Vehicle Locations */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Vehicle Locations
              </Typography>
              <Box sx={{ height: 400 }}>
                <Scatter
                  data={vehicleLocationData}
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

          {/* Efficiency Trend */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Efficiency Trend
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line
                  data={efficiencyTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Vehicle List */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Vehicle Status
              </Typography>
              <List>
                {machineryData.vehicles.map((vehicle) => (
                  <ListItem
                    key={vehicle.id}
                    button
                    onClick={() => handleVehicleClick(vehicle)}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {vehicle.type.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${vehicle.id} - ${vehicle.type}`}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {vehicle.operator}
                          </Typography>
                          {` - ${vehicle.location}`}
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Fuel Level">
                          <Box sx={{ mr: 1 }}>
                            <BatteryIcon
                              color={vehicle.fuel > 20 ? 'success' : 'error'}
                            />
                            {vehicle.fuel}%
                          </Box>
                        </Tooltip>
                        <Chip
                          label={vehicle.status}
                          color={getStatusColor(vehicle.status)}
                          size="small"
                        />
                      </Box>
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
                {machineryData.recentEvents.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemIcon>
                      <WarningIcon color={getStatusColor(event.severity)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.details}
                      secondary={`${event.timestamp} - ${event.vehicle}`}
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
          <DialogTitle>Tracking Settings</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Speed Limit (km/h)"
                  type="number"
                  value="25"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Minimum Fuel Level (%)"
                  type="number"
                  value="20"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Maintenance Interval (hours)"
                  type="number"
                  value="100"
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

export default HeavyMachineryTrackingWidget;
