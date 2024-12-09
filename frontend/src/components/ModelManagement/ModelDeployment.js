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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const ModelDeployment = ({ modelId }) => {
  const [deployments, setDeployments] = useState([]);
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState({
    platform: 'docker',
    port: 8000,
    replicas: 1,
    resources: {
      requests: {
        cpu: '100m',
        memory: '512Mi'
      },
      limits: {
        cpu: '500m',
        memory: '1Gi'
      }
    }
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchDeployments();
    const interval = setInterval(fetchDeployments, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [modelId]);

  const fetchDeployments = async () => {
    try {
      const response = await axios.get(`/api/models/${modelId}/deployments`);
      setDeployments(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching deployments', { variant: 'error' });
    }
  };

  const handleDeploy = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/models/${modelId}/deployments`, deploymentConfig);
      enqueueSnackbar('Model deployment initiated', { variant: 'success' });
      setDeploymentDialogOpen(false);
      fetchDeployments();
    } catch (error) {
      enqueueSnackbar('Error deploying model', { variant: 'error' });
    }
    setLoading(false);
  };

  const handleDelete = async (deploymentId) => {
    try {
      await axios.delete(`/api/models/${modelId}/deployments/${deploymentId}`);
      enqueueSnackbar('Deployment deleted successfully', { variant: 'success' });
      fetchDeployments();
    } catch (error) {
      enqueueSnackbar('Error deleting deployment', { variant: 'error' });
    }
  };

  const handleUpdate = async (deploymentId, updates) => {
    try {
      await axios.patch(`/api/models/${modelId}/deployments/${deploymentId}`, updates);
      enqueueSnackbar('Deployment updated successfully', { variant: 'success' });
      fetchDeployments();
    } catch (error) {
      enqueueSnackbar('Error updating deployment', { variant: 'error' });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 130 },
    { field: 'status', headerName: 'Status', width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'running' ? 'success' : 'error'}
          size="small"
        />
      )
    },
    { field: 'platform', headerName: 'Platform', width: 130 },
    { field: 'endpoint', headerName: 'Endpoint', width: 250 },
    { field: 'created_at', headerName: 'Created At', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedDeployment(params.row)}
            sx={{ mr: 1 }}
          >
            Details
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const DeploymentDialog = () => (
    <Dialog
      open={deploymentDialogOpen}
      onClose={() => setDeploymentDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Deploy Model</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                value={deploymentConfig.platform}
                label="Platform"
                onChange={(e) => setDeploymentConfig({
                  ...deploymentConfig,
                  platform: e.target.value
                })}
              >
                <MenuItem value="docker">Docker</MenuItem>
                <MenuItem value="kubernetes">Kubernetes</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Port"
              type="number"
              value={deploymentConfig.port}
              onChange={(e) => setDeploymentConfig({
                ...deploymentConfig,
                port: parseInt(e.target.value)
              })}
            />
          </Grid>

          {deploymentConfig.platform === 'kubernetes' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Replicas"
                type="number"
                value={deploymentConfig.replicas}
                onChange={(e) => setDeploymentConfig({
                  ...deploymentConfig,
                  replicas: parseInt(e.target.value)
                })}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CPU Request"
              value={deploymentConfig.resources.requests.cpu}
              onChange={(e) => setDeploymentConfig({
                ...deploymentConfig,
                resources: {
                  ...deploymentConfig.resources,
                  requests: {
                    ...deploymentConfig.resources.requests,
                    cpu: e.target.value
                  }
                }
              })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Memory Request"
              value={deploymentConfig.resources.requests.memory}
              onChange={(e) => setDeploymentConfig({
                ...deploymentConfig,
                resources: {
                  ...deploymentConfig.resources,
                  requests: {
                    ...deploymentConfig.resources.requests,
                    memory: e.target.value
                  }
                }
              })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeploymentDialogOpen(false)}>Cancel</Button>
        <Button
          onClick={handleDeploy}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Deploy'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const DeploymentDetailsDialog = () => {
    if (!selectedDeployment) return null;

    return (
      <Dialog
        open={!!selectedDeployment}
        onClose={() => setSelectedDeployment(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Deployment Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6">Status Information</Typography>
              <Box sx={{ mt: 1 }}>
                <pre>
                  {JSON.stringify(selectedDeployment, null, 2)}
                </pre>
              </Box>
            </Grid>

            {selectedDeployment.platform === 'kubernetes' && (
              <Grid item xs={12}>
                <Typography variant="h6">Kubernetes Resources</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography>
                    Replicas: {selectedDeployment.replicas?.desired || 0} desired,{' '}
                    {selectedDeployment.replicas?.available || 0} available
                  </Typography>
                </Box>
              </Grid>
            )}

            {selectedDeployment.platform === 'docker' && (
              <Grid item xs={12}>
                <Typography variant="h6">Container Stats</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography>
                    Status: {selectedDeployment.container_status}
                  </Typography>
                  {selectedDeployment.container_stats && (
                    <pre>
                      {JSON.stringify(selectedDeployment.container_stats, null, 2)}
                    </pre>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDeployment(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Model Deployments</Typography>
        <Button
          variant="contained"
          onClick={() => setDeploymentDialogOpen(true)}
        >
          New Deployment
        </Button>
      </Box>

      <DataGrid
        rows={deployments}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        autoHeight
        disableSelectionOnClick
      />

      <DeploymentDialog />
      <DeploymentDetailsDialog />
    </Box>
  );
};

export default ModelDeployment;
