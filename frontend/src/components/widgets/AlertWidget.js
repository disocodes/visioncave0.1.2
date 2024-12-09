import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

const mockAlerts = [
  {
    id: 1,
    type: 'warning',
    message: 'Motion detected in Zone A',
    timestamp: '2 minutes ago',
  },
  {
    id: 2,
    type: 'error',
    message: 'Camera 2 connection lost',
    timestamp: '15 minutes ago',
  },
  {
    id: 3,
    type: 'info',
    message: 'Object detection completed',
    timestamp: '1 hour ago',
  },
  {
    id: 4,
    type: 'warning',
    message: 'Unusual activity detected',
    timestamp: '2 hours ago',
  },
];

const getAlertIcon = (type) => {
  switch (type) {
    case 'warning':
      return <WarningIcon sx={{ color: 'warning.main' }} />;
    case 'error':
      return <ErrorIcon sx={{ color: 'error.main' }} />;
    case 'info':
      return <InfoIcon sx={{ color: 'info.main' }} />;
    default:
      return <NotificationsIcon />;
  }
};

const AlertWidget = ({ title }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary">
            Recent Alerts
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Mark All as Read</MenuItem>
        <MenuItem onClick={handleMenuClose}>Clear All</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
      </Menu>

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {mockAlerts.map((alert) => (
          <ListItem
            key={alert.id}
            sx={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <ListItemIcon>
              {getAlertIcon(alert.type)}
            </ListItemIcon>
            <ListItemText
              primary={alert.message}
              secondary={alert.timestamp}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ 
                variant: 'caption',
                sx: { color: 'text.secondary' }
              }}
            />
            <Chip
              label={alert.type}
              size="small"
              color={
                alert.type === 'error' ? 'error' :
                alert.type === 'warning' ? 'warning' :
                'info'
              }
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AlertWidget;
