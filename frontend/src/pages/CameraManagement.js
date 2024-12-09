import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
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
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export default function CameraManagement() {
  const [cameras, setCameras] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: '',
    location: '',
    configuration: {
      resolution: '1280x720',
      frameRate: 30,
      protocol: 'RTSP',
    },
  });

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch('/api/v1/cameras');
      const data = await response.json();
      setCameras(data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  const handleOpenDialog = (camera = null) => {
    if (camera) {
      setFormData(camera);
      setSelectedCamera(camera);
    } else {
      setFormData({
        name: '',
        url: '',
        type: '',
        location: '',
        configuration: {
          resolution: '1280x720',
          frameRate: 30,
          protocol: 'RTSP',
        },
      });
      setSelectedCamera(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCamera(null);
  };

  const handleSubmit = async () => {
    try {
      const url = selectedCamera
        ? `/api/v1/cameras/${selectedCamera.id}`
        : '/api/v1/cameras';
      const method = selectedCamera ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      handleCloseDialog();
      fetchCameras();
    } catch (error) {
      console.error('Error saving camera:', error);
    }
  };

  const handleDelete = async (cameraId) => {
    if (window.confirm('Are you sure you want to delete this camera?')) {
      try {
        await fetch(`/api/v1/cameras/${cameraId}`, {
          method: 'DELETE',
        });
        fetchCameras();
      } catch (error) {
        console.error('Error deleting camera:', error);
      }
    }
  };

  const handleTestConnection = async (cameraId) => {
    try {
      const response = await fetch(`/api/v1/cameras/${cameraId}/test`);
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error('Error testing camera connection:', error);
      alert('Failed to test camera connection');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Camera Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Camera
        </Button>
      </Box>

      <Grid container spacing={3}>
        {cameras.map((camera) => (
          <Grid item xs={12} sm={6} md={4} key={camera.id}>
            <Card>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={`/api/v1/cameras/${camera.id}/thumbnail`}
                  alt={camera.name}
                  style={{ maxHeight: '100%', maxWidth: '100%' }}
                  onError={(e) => {
                    e.target.src = '/placeholder-camera.png';
                  }}
                />
              </CardMedia>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">{camera.name}</Typography>
                  <Chip
                    label={camera.status}
                    color={camera.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {camera.location}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Type: {camera.type}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(camera)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(camera.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleTestConnection(camera.id)}
                  >
                    <RefreshIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(camera)}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCamera ? 'Edit Camera' : 'Add New Camera'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Camera Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Camera URL"
              fullWidth
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Camera Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <MenuItem value="IP">IP Camera</MenuItem>
                <MenuItem value="USB">USB Camera</MenuItem>
                <MenuItem value="RTSP">RTSP Stream</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Location"
              fullWidth
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Resolution</InputLabel>
              <Select
                value={formData.configuration.resolution}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    configuration: {
                      ...formData.configuration,
                      resolution: e.target.value,
                    },
                  })
                }
              >
                <MenuItem value="640x480">640x480</MenuItem>
                <MenuItem value="1280x720">1280x720 (HD)</MenuItem>
                <MenuItem value="1920x1080">1920x1080 (Full HD)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Frame Rate"
              type="number"
              fullWidth
              value={formData.configuration.frameRate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  configuration: {
                    ...formData.configuration,
                    frameRate: parseInt(e.target.value),
                  },
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCamera ? 'Update' : 'Add'} Camera
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
