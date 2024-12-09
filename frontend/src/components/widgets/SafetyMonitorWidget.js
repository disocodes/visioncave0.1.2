import React from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Warning,
  Error,
  CheckCircle,
  PersonOff,
  Construction,
  HealthAndSafety,
  LocalHospital,
  Speed,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const SafetyMonitorWidget = () => {
  const safetyData = useSelector((state) => state.widgetData.safetyMonitor);

  const getViolationSeverity = (violation) => {
    if (violation.type === 'ppe_violation') return 'warning';
    if (violation.type === 'unsafe_behavior') return 'error';
    return 'info';
  };

  const getViolationIcon = (violation) => {
    switch (violation.type) {
      case 'ppe_violation':
        return <PersonOff color="warning" />;
      case 'unsafe_behavior':
        return <Construction color="error" />;
      case 'restricted_area':
        return <Warning color="error" />;
      default:
        return <HealthAndSafety color="info" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'safe':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'danger':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const COLORS = ['#4caf50', '#ff9800', '#f44336'];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Safety Monitor
        </Typography>

        {/* Overall Status */}
        <Box sx={{ mb: 3 }}>
          <Alert
            severity={safetyData.status === 'safe' ? 'success' : 'warning'}
            icon={
              safetyData.status === 'safe' ? (
                <CheckCircle fontSize="inherit" />
              ) : (
                <Warning fontSize="inherit" />
              )
            }
          >
            <Typography variant="subtitle1">
              Current Safety Status: {safetyData.status.toUpperCase()}
            </Typography>
          </Alert>
        </Box>

        {/* Statistics Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              <Typography variant="body2" color="textSecondary">
                Compliant
              </Typography>
              <Typography variant="h6">{safetyData.stats.compliant}</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
              <Typography variant="body2" color="textSecondary">
                Warnings
              </Typography>
              <Typography variant="h6">{safetyData.stats.warnings}</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Error sx={{ fontSize: 40, color: 'error.main' }} />
              <Typography variant="body2" color="textSecondary">
                Violations
              </Typography>
              <Typography variant="h6">{safetyData.stats.violations}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Safety Score */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Overall Safety Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flex: 1, mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={safetyData.safetyScore}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStatusColor(safetyData.status),
                  },
                }}
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              {Math.round(safetyData.safetyScore)}%
            </Typography>
          </Box>
        </Box>

        {/* Recent Events */}
        <Typography variant="subtitle1" gutterBottom>
          Recent Safety Events
        </Typography>
        <List>
          {safetyData.recentEvents.map((event, index) => (
            <ListItem key={index}>
              <ListItemIcon>{getViolationIcon(event)}</ListItemIcon>
              <ListItemText
                primary={event.description}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Speed sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" color="textSecondary">
                      {new Date(event.timestamp).toLocaleString()}
                    </Typography>
                    <Chip
                      label={event.zone || 'General'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Charts */}
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Typography variant="subtitle1" gutterBottom>
              Safety Trend
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={safetyData.trendData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="safetyScore"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle1" gutterBottom>
              Violation Types
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: 'PPE',
                        value: safetyData.stats.ppeViolations,
                      },
                      {
                        name: 'Behavior',
                        value: safetyData.stats.behaviorViolations,
                      },
                      {
                        name: 'Zone',
                        value: safetyData.stats.zoneViolations,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {safetyData.stats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SafetyMonitorWidget;
