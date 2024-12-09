import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Bar } from 'react-chartjs-2';

const PackageDetectionWidget = () => {
  const dispatch = useDispatch();
  const [packageData, setPackageData] = useState({
    totalToday: 25,
    delivered: 18,
    pending: 5,
    suspicious: 2,
    deliveryHistory: [
      {
        id: 1,
        timestamp: '2024-12-09 14:30',
        carrier: 'FedEx',
        status: 'delivered',
        duration: '2h 15m',
        image: 'package1.jpg',
      },
      {
        id: 2,
        timestamp: '2024-12-09 15:45',
        carrier: 'UPS',
        status: 'pending',
        duration: '45m',
        image: 'package2.jpg',
      },
    ],
    hourlyStats: {
      labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      delivered: [2, 4, 5, 3, 4, 0],
      pending: [1, 0, 2, 1, 1, 0],
    },
  });

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch package detection data from backend
    // dispatch(fetchPackageData());
  }, []);

  const hourlyStatsData = {
    labels: packageData.hourlyStats.labels,
    datasets: [
      {
        label: 'Delivered',
        data: packageData.hourlyStats.delivered,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
      {
        label: 'Pending',
        data: packageData.hourlyStats.pending,
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgb(255, 206, 86)',
        borderWidth: 1,
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'success',
      pending: 'warning',
      suspicious: 'error',
    };
    return colors[status] || 'default';
  };

  const handleViewImage = (pkg) => {
    setSelectedPackage(pkg);
    setImageDialogOpen(true);
  };

  const formatDuration = (duration) => {
    return duration;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Package Detection</Typography>
          <Box>
            <TextField
              size="small"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mr: 1 }}
              InputProps={{
                endAdornment: <SearchIcon />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Total Today
              </Typography>
              <Typography variant="h4">{packageData.totalToday}</Typography>
              <ShippingIcon sx={{ fontSize: 40, color: 'primary.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Delivered
              </Typography>
              <Typography variant="h4" color="success.main">
                {packageData.delivered}
              </Typography>
              <CheckCircleIcon
                sx={{ fontSize: 40, color: 'success.main', mt: 1 }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {packageData.pending}
              </Typography>
              <InventoryIcon sx={{ fontSize: 40, color: 'warning.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Suspicious
              </Typography>
              <Typography variant="h4" color="error.main">
                {packageData.suspicious}
              </Typography>
              <WarningIcon sx={{ fontSize: 40, color: 'error.main', mt: 1 }} />
            </Paper>
          </Grid>

          {/* Hourly Statistics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Hourly Statistics
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={hourlyStatsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Delivery History */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Delivery History
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Carrier</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Image</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {packageData.deliveryHistory.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell>{pkg.timestamp}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={`/carrier-logos/${pkg.carrier.toLowerCase()}.png`}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            >
                              {pkg.carrier.charAt(0)}
                            </Avatar>
                            {pkg.carrier}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={pkg.status}
                            color={getStatusColor(pkg.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDuration(pkg.duration)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleViewImage(pkg)}
                          >
                            <ImageIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Delete Record">
                            <IconButton size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Image Preview Dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Package Image</DialogTitle>
          <DialogContent>
            {selectedPackage && (
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'grey.100',
                }}
              >
                <img
                  src={`/package-images/${selectedPackage.image}`}
                  alt="Package"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
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

export default PackageDetectionWidget;
