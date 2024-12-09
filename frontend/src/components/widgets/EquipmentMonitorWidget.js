import React from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from '@mui/material';
import {
  Build,
  Warning,
  Error,
  CheckCircle,
  Speed,
  DeviceThermostat,
  Vibration,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const EquipmentMonitorWidget = () => {
  const equipmentData = useSelector((state) => state.widgetData.equipment);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'critical':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'warning':
        return <Warning sx={{ color: '#ff9800' }} />;
      case 'critical':
        return <Error sx={{ color: '#f44336' }} />;
      default:
        return <Build sx={{ color: '#757575' }} />;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Equipment Monitor
        </Typography>

        {/* Summary Statistics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Build sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="body2" color="textSecondary">
                Total
              </Typography>
              <Typography variant="h6">{equipmentData.summary.total}</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              <Typography variant="body2" color="textSecondary">
                Active
              </Typography>
              <Typography variant="h6">{equipmentData.summary.active}</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
              <Typography variant="body2" color="textSecondary">
                Warning
              </Typography>
              <Typography variant="h6">{equipmentData.summary.warning}</Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Error sx={{ fontSize: 40, color: 'error.main' }} />
              <Typography variant="body2" color="textSecondary">
                Critical
              </Typography>
              <Typography variant="h6">
                {equipmentData.summary.critical}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Equipment List */}
        <List>
          {equipmentData.equipment.map((item, index) => (
            <ListItem key={item.id || index}>
              <ListItemIcon>{getStatusIcon(item.status)}</ListItemIcon>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1">{item.name}</Typography>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(item.status),
                        color: 'white',
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Speed sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">
                          {item.performance}% Performance
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DeviceThermostat sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">
                          {item.temperature}°C
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Vibration sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2">
                          {item.vibration} Hz
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                }
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Recent Alerts */}
        <Typography variant="subtitle1" gutterBottom>
          Recent Alerts
        </Typography>
        <Box sx={{ mb: 2 }}>
          {equipmentData.alerts.slice(0, 3).map((alert, index) => (
            <Alert
              key={index}
              severity={alert.severity}
              sx={{ mb: 1 }}
              icon={getStatusIcon(alert.severity)}
            >
              <Typography variant="body2">
                {alert.message}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 1, color: 'text.secondary' }}
                >
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
              </Typography>
            </Alert>
          ))}
        </Box>

        {/* Performance Chart */}
        <Typography variant="subtitle1" gutterBottom>
          Equipment Performance
        </Typography>
        <Box sx={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={equipmentData.equipment}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="performance" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EquipmentMonitorWidget;
