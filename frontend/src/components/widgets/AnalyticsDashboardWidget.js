import React from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material';
import {
  Timeline,
  Assessment,
  TrendingUp,
  Speed,
  Memory,
  People,
  Warning,
  Mood,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsDashboardWidget = () => {
  const analyticsData = useSelector((state) => state.widgetData.analytics);

  const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'];

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatNumber = (num) => {
    return Number(num).toFixed(2);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Analytics Dashboard
        </Typography>

        {/* Performance Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Speed sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="body2" color="textSecondary">
                FPS
              </Typography>
              <Typography variant="h6">
                {formatNumber(analyticsData.performance.fps)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Memory sx={{ fontSize: 40, color: 'secondary.main' }} />
              <Typography variant="body2" color="textSecondary">
                Avg Processing Time
              </Typography>
              <Typography variant="h6">
                {formatNumber(analyticsData.performance.avg_processing_time)} ms
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 40, color: 'success.main' }} />
              <Typography variant="body2" color="textSecondary">
                Detection Rate
              </Typography>
              <Typography variant="h6">
                {formatNumber(analyticsData.performance.detection_rate)}/frame
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          {/* Detection Trends */}
          <Grid item xs={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Detection Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.detections.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTime}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatTime}
                      formatter={(value) => [value, 'Detections']}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Detection Distribution */}
          <Grid item xs={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Detection Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(analyticsData.detections.by_class).map(
                        ([name, value]) => ({ name, value })
                      )}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(analyticsData.detections.by_class).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Emotion Analysis */}
          <Grid item xs={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Emotion Analysis
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(analyticsData.emotions).map(
                      ([emotion, value]) => ({
                        emotion,
                        value: value * 100,
                      })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="emotion" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${formatNumber(value)}%`, 'Confidence']}
                    />
                    <Bar dataKey="value" fill="#8884d8">
                      {Object.entries(analyticsData.emotions).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Safety Violations */}
          <Grid item xs={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Safety Violations
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.violations.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTime}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={formatTime}
                      formatter={(value) => [value, 'Violations']}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#f44336"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Violation Summary */}
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Violation Summary
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(analyticsData.violations.by_type).map(
              ([type, count], index) => (
                <Grid item xs={4} key={type}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Warning
                      sx={{
                        fontSize: 40,
                        color: COLORS[index % COLORS.length],
                      }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {type}
                    </Typography>
                    <Typography variant="h6">{count}</Typography>
                  </Box>
                </Grid>
              )
            )}
          </Grid>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboardWidget;
