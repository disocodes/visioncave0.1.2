import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import BaseWidget from './BaseWidget';

const MetricCard = ({ title, value, unit, color }) => (
  <Paper
    sx={{
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Typography variant="body2" color="textSecondary">
      {title}
    </Typography>
    <Typography variant="h4" color={color} sx={{ mt: 1 }}>
      {value}
      <Typography component="span" variant="body2" color="textSecondary">
        {unit}
      </Typography>
    </Typography>
  </Paper>
);

const AnalyticsWidget = ({
  title = 'Analytics',
  data = [],
  metrics = {},
  isLoading = false,
  onClose,
  onSettings,
  ...baseWidgetProps
}) => {
  const theme = useTheme();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Update chart data when new data arrives
    setChartData(data.slice(-20)); // Keep last 20 data points
  }, [data]);

  return (
    <BaseWidget
      title={title}
      icon={AssessmentIcon}
      onClose={onClose}
      onSettings={onSettings}
      {...baseWidgetProps}
    >
      <Box sx={{ height: '100%', p: 1 }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* Metrics Cards */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <MetricCard
                    title="Detection Rate"
                    value={metrics.detectionRate || 0}
                    unit="/s"
                    color={theme.palette.primary.main}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <MetricCard
                    title="Accuracy"
                    value={metrics.accuracy || 0}
                    unit="%"
                    color={theme.palette.success.main}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <MetricCard
                    title="Processing Time"
                    value={metrics.processingTime || 0}
                    unit="ms"
                    color={theme.palette.warning.main}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <MetricCard
                    title="Objects Detected"
                    value={metrics.objectsDetected || 0}
                    unit=""
                    color={theme.palette.info.main}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Chart */}
            <Grid item xs={12} sx={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="detectionRate"
                    stroke={theme.palette.primary.main}
                    name="Detection Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke={theme.palette.success.main}
                    name="Accuracy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        )}
      </Box>
    </BaseWidget>
  );
};

export default AnalyticsWidget;
