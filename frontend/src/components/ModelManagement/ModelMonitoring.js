import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import Plot from 'react-plotly.js';

const ModelMonitoring = ({ modelId }) => {
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    metric_name: '',
    min: '',
    max: '',
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchMetrics();
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Check alerts every minute
    return () => clearInterval(interval);
  }, [modelId]);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`/api/models/${modelId}/metrics`);
      setMetrics(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching model metrics', { variant: 'error' });
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`/api/models/${modelId}/alerts`);
      setAlerts(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching alerts', { variant: 'error' });
    }
  };

  const handleSetAlert = async () => {
    try {
      await axios.post(`/api/models/${modelId}/alerts`, alertConfig);
      enqueueSnackbar('Alert configuration saved', { variant: 'success' });
      setAlertDialogOpen(false);
      fetchAlerts();
    } catch (error) {
      enqueueSnackbar('Error setting alert', { variant: 'error' });
    }
  };

  const MetricsOverview = () => (
    <Grid container spacing={2}>
      {metrics && Object.entries(metrics).map(([metricName, values]) => (
        <Grid item xs={12} md={6} key={metricName}>
          <Card>
            <CardContent>
              <Typography variant="h6">{metricName}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>
                  Average: {values.average.toFixed(4)}
                </Typography>
                <Typography>
                  Min: {values.min.toFixed(4)}
                </Typography>
                <Typography>
                  Max: {values.max.toFixed(4)}
                </Typography>
                <Typography>
                  Count: {values.count}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const PerformanceGraph = () => {
    if (!metrics) return null;

    const data = {
      labels: Object.keys(metrics),
      datasets: [
        {
          label: 'Average Value',
          data: Object.values(metrics).map(m => m.average),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Model Performance Metrics',
        },
      },
    };

    return (
      <Box sx={{ mt: 3 }}>
        <Line data={data} options={options} />
      </Box>
    );
  };

  const AlertsSection = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Alerts</Typography>
        <Button
          variant="contained"
          onClick={() => setAlertDialogOpen(true)}
        >
          Configure Alert
        </Button>
      </Box>

      {alerts.map((alert, index) => (
        <Alert
          key={index}
          severity={alert.type === 'above_maximum' ? 'error' : 'warning'}
          sx={{ mb: 1 }}
        >
          {alert.metric_name}: Current value {alert.current_value.toFixed(4)} is
          {alert.type === 'above_maximum' ? ' above ' : ' below '}
          threshold {alert.threshold.toFixed(4)}
        </Alert>
      ))}
    </Box>
  );

  const AlertDialog = () => (
    <Dialog
      open={alertDialogOpen}
      onClose={() => setAlertDialogOpen(false)}
    >
      <DialogTitle>Configure Alert</DialogTitle>
      <DialogContent>
        <TextField
          label="Metric Name"
          value={alertConfig.metric_name}
          onChange={(e) => setAlertConfig({ ...alertConfig, metric_name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Minimum Threshold"
          type="number"
          value={alertConfig.min}
          onChange={(e) => setAlertConfig({ ...alertConfig, min: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Maximum Threshold"
          type="number"
          value={alertConfig.max}
          onChange={(e) => setAlertConfig({ ...alertConfig, max: e.target.value })}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAlertDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleSetAlert} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Model Monitoring
      </Typography>

      <Paper sx={{ p: 2 }}>
        <MetricsOverview />
        <PerformanceGraph />
        <AlertsSection />
      </Paper>

      <AlertDialog />
    </Box>
  );
};

export default ModelMonitoring;
