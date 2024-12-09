import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { PeopleAlt as PeopleAltIcon } from '@mui/icons-material';
import BaseWidget from './BaseWidget';
import { wsService } from '../../services/websocket';
import { updateOccupancyData } from '../../store/slices/widgetDataSlice';

const OccupancyBar = ({ current, capacity, label }) => {
  const theme = useTheme();
  const percentage = Math.min((current / capacity) * 100, 100);
  const getColor = () => {
    if (percentage > 90) return theme.palette.error.main;
    if (percentage > 75) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2">
          {current}/{capacity}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            backgroundColor: getColor(),
          },
        }}
      />
    </Box>
  );
};

const OccupancyWidget = ({
  title = 'Occupancy Tracking',
  onClose,
  onSettings,
  ...baseWidgetProps
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const occupancyData = useSelector((state) => state.widgetData.occupancy);

  useEffect(() => {
    // Subscribe to real-time occupancy updates
    const unsubscribe = wsService.subscribe('occupancy_update', (data) => {
      dispatch(updateOccupancyData(data));
    });

    // Request initial data
    wsService.send('get_occupancy_data', {});

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <BaseWidget
      title={title}
      icon={PeopleAltIcon}
      onClose={onClose}
      onSettings={onSettings}
      {...baseWidgetProps}
    >
      <Box sx={{ p: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Total Occupancy
          </Typography>
          <OccupancyBar
            current={occupancyData.total.current}
            capacity={occupancyData.total.capacity}
            label="Overall"
          />
        </Paper>

        <Typography variant="h6" gutterBottom>
          Zone Occupancy
        </Typography>
        <Grid container spacing={2}>
          {occupancyData.zones.map((zone) => (
            <Grid item xs={12} key={zone.id}>
              <OccupancyBar
                current={zone.current}
                capacity={zone.capacity}
                label={zone.name}
              />
            </Grid>
          ))}
        </Grid>

        {occupancyData.lastUpdated && (
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ display: 'block', textAlign: 'right', mt: 2 }}
          >
            Last updated: {new Date(occupancyData.lastUpdated).toLocaleTimeString()}
          </Typography>
        )}
      </Box>
    </BaseWidget>
  );
};

export default OccupancyWidget;
