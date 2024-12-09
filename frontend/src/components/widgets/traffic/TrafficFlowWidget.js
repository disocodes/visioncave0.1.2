import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Traffic as TrafficIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
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
import BaseWidget from './BaseWidget';
import { wsService } from '../../services/websocket';
import { updateTrafficFlowData } from '../../store/slices/widgetDataSlice';

const StatCard = ({ title, value, change, unit = '' }) => {
  const theme = useTheme();
  const isPositive = change >= 0;

  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="body2" color="textSecondary">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
        <Typography variant="h4">
          {value}
          <Typography component="span" variant="body2" color="textSecondary">
            {unit}
          </Typography>
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mt: 1,
          color: isPositive ? theme.palette.success.main : theme.palette.error.main,
        }}
      >
        {isPositive ? (
          <ArrowUpwardIcon fontSize="small" />
        ) : (
          <ArrowDownwardIcon fontSize="small" />
        )}
        <Typography variant="body2">
          {Math.abs(change)}% vs last hour
        </Typography>
      </Box>
    </Paper>
  );
};

const TrafficFlowWidget = ({
  title = 'Traffic Flow Analysis',
  onClose,
  onSettings,
  ...baseWidgetProps
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const trafficData = useSelector((state) => state.widgetData.trafficFlow);

  useEffect(() => {
    // Subscribe to real-time traffic updates
    const unsubscribe = wsService.subscribe('traffic_update', (data) => {
      dispatch(updateTrafficFlowData(data));
    });

    // Request initial data
    wsService.send('get_traffic_data', {});

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <BaseWidget
      title={title}
      icon={TrafficIcon}
      onClose={onClose}
      onSettings={onSettings}
      {...baseWidgetProps}
    >
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Current Flow"
              value={trafficData.currentFlow}
              change={trafficData.flowChange}
              unit=" vehicles/min"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Average Speed"
              value={trafficData.avgSpeed}
              change={trafficData.speedChange}
              unit=" km/h"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Congestion Level"
              value={trafficData.congestionLevel}
              change={trafficData.congestionChange}
              unit="%"
            />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Hourly Traffic Flow
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficData.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} vehicles/min`,
                      'Traffic Flow',
                    ]}
                  />
                  <Bar
                    dataKey="flow"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {trafficData.lastUpdated && (
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ display: 'block', textAlign: 'right', mt: 2 }}
          >
            Last updated: {new Date(trafficData.lastUpdated).toLocaleTimeString()}
          </Typography>
        )}
      </Box>
    </BaseWidget>
  );
};

export default TrafficFlowWidget;
