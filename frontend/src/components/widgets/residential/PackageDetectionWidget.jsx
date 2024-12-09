import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Badge,
  IconButton,
  Alert
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

const PackageDetectionWidget = ({ socketUrl }) => {
  const [packages, setPackages] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(socketUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'package_detection') {
        handlePackageUpdate(data);
      }
    };

    return () => {
      ws.close();
    };
  }, [socketUrl]);

  const handlePackageUpdate = (data) => {
    if (data.event === 'new_package') {
      setPackages(prev => [...prev, {
        id: data.package_id,
        timestamp: new Date().toLocaleString(),
        status: 'new',
        location: data.location
      }]);
      setAlerts(prev => [...prev, {
        id: Date.now(),
        message: 'New package detected',
        type: 'info'
      }]);
    } else if (data.event === 'package_removed') {
      setPackages(prev => 
        prev.map(pkg => 
          pkg.id === data.package_id 
            ? { ...pkg, status: 'removed' }
            : pkg
        )
      );
    }
  };

  const handleDismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleDismissPackage = (packageId) => {
    setPackages(prev => prev.filter(pkg => pkg.id !== packageId));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LocalShippingIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Package Detection</Typography>
        <Badge 
          badgeContent={packages.filter(pkg => pkg.status === 'new').length} 
          color="primary" 
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Alerts Section */}
      <Box sx={{ mb: 2 }}>
        {alerts.map(alert => (
          <Alert 
            key={alert.id} 
            severity={alert.type}
            onClose={() => handleDismissAlert(alert.id)}
            sx={{ mb: 1 }}
          >
            {alert.message}
          </Alert>
        ))}
      </Box>

      {/* Packages List */}
      <List>
        {packages.map((pkg) => (
          <ListItem
            key={pkg.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDismissPackage(pkg.id)}>
                <DeleteIcon />
              </IconButton>
            }
            sx={{
              bgcolor: 'background.paper',
              mb: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <ListItemIcon>
              {pkg.status === 'new' ? (
                <WarningIcon color="warning" />
              ) : (
                <CheckCircleIcon color="success" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={`Package #${pkg.id}`}
              secondary={`Detected at ${pkg.timestamp} - ${pkg.location}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PackageDetectionWidget;
