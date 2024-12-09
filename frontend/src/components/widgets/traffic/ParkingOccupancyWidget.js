import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Paper,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Map as MapIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Bar, Line } from 'react-chartjs-2';

const ParkingOccupancyWidget = () => {
  const dispatch = useDispatch();
  const [parkingData, setParkingData] = useState({
    totalSpaces: 500,
    occupiedSpaces: 325,
    occupancyRate: 65,
    sectors: [
      { id: 'A', occupied: 85, total: 100 },
      { id: 'B', occupied: 95, total: 100 },
      { id: 'C', occupied: 65, total: 100 },
      { id: 'D', occupied: 45, total: 100 },
      { id: 'E', occupied: 35, total: 100 },
    ],
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    // Fetch parking data from backend
    // dispatch(fetchParkingData());
  }, []);

  const occupancyTrendData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Occupancy Rate',
        data: [30, 25, 45, 75, 85, 65],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const sectorOccupancyData = {
    labels: parkingData.sectors.map((sector) => `Sector ${sector.id}`),
    datasets: [
      {
        label: 'Occupied Spaces',
        data: parkingData.sectors.map((sector) => sector.occupied),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
      {
        label: 'Available Spaces',
        data: parkingData.sectors.map(
          (sector) => sector.total - sector.occupied
        ),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
    ],
  };

  const getOccupancyColor = (rate) => {
    if (rate < 50) return 'success';
    if (rate < 80) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Parking Occupancy</Typography>
          <Box>
            <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="24h">24 Hours</MenuItem>
                <MenuItem value="7d">7 Days</MenuItem>
                <MenuItem value="30d">30 Days</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>View</InputLabel>
              <Select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                label="View"
              >
                <MenuItem value="overview">Overview</MenuItem>
                <MenuItem value="sectors">Sectors</MenuItem>
                <MenuItem value="trends">Trends</MenuItem>
                <MenuItem value="map">Map View</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {selectedView === 'overview' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Occupancy
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="h4">
                    {parkingData.occupancyRate}%
                  </Typography>
                  <CarIcon
                    sx={{
                      fontSize: 40,
                      color: `${getOccupancyColor(
                        parkingData.occupancyRate
                      )}.main`,
                    }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parkingData.occupancyRate}
                  color={getOccupancyColor(parkingData.occupancyRate)}
                />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {parkingData.occupiedSpaces} occupied
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {parkingData.totalSpaces - parkingData.occupiedSpaces}{' '}
                    available
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Quick Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">15 min</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Avg. Search Time
                      </Typography>
                      <TimeIcon color="primary" />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">+12%</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        vs Last Week
                      </Typography>
                      <TrendingUpIcon color="success" />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Occupancy Trend
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={occupancyTrendData} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {selectedView === 'sectors' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sector Distribution
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Bar data={sectorOccupancyData} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sector Details
                </Typography>
                <Grid container spacing={2}>
                  {parkingData.sectors.map((sector) => (
                    <Grid item xs={12} sm={6} md={4} key={sector.id}>
                      <Box
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="h6">Sector {sector.id}</Typography>
                        <Box sx={{ my: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(sector.occupied / sector.total) * 100}
                            color={getOccupancyColor(
                              (sector.occupied / sector.total) * 100
                            )}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {sector.occupied} / {sector.total} spaces occupied
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {selectedView === 'trends' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Historical Trends
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Line data={occupancyTrendData} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {selectedView === 'map' && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  height: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Interactive parking map view will be displayed here
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

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

export default ParkingOccupancyWidget;
