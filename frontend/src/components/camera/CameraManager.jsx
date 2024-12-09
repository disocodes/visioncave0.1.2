import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VideocamIcon from '@mui/icons-material/Videocam';
import WebcamSetup from './WebcamSetup';
import IPCameraSetup from './IPCameraSetup';
import axios from 'axios';

const CameraManager = () => {
  const [cameras, setCameras] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [setupType, setSetupType] = useState(null);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await axios.get('/api/v1/cameras');
      setCameras(response.data);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  const handleAddCamera = () => {
    setSelectedCamera(null);
    setOpenDialog(true);
  };

  const handleEditCamera = (camera) => {
    setSelectedCamera(camera);
    setSetupType(camera.type);
    setOpenDialog(true);
  };

  const handleDeleteCamera = async (cameraId) => {
    try {
      await axios.delete(`/api/v1/cameras/${cameraId}`);
      fetchCameras();
    } catch (error) {
      console.error('Error deleting camera:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCamera(null);
    setSetupType(null);
  };

  const handleCameraSetup = async (cameraData) => {
    try {
      if (selectedCamera) {
        await axios.put(`/api/v1/cameras/${selectedCamera.id}`, cameraData);
      } else {
        await axios.post('/api/v1/cameras', cameraData);
      }
      handleCloseDialog();
      fetchCameras();
    } catch (error) {
      console.error('Error setting up camera:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Camera Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCamera}
        >
          Add Camera
        </Button>
      </Box>

      <Grid container spacing={3}>
        {cameras.map((camera) => (
          <Grid item xs={12} md={6} lg={4} key={camera.id}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VideocamIcon sx={{ mr: 1 }} />
                <Typography variant="h6">{camera.name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Type: {camera.type}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Status: {camera.status}
              </Typography>
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={() => handleEditCamera(camera)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteCamera(camera.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          {!setupType ? (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Select Camera Type
              </Typography>
              <List>
                <ListItem
                  button
                  onClick={() => setSetupType('webcam')}
                >
                  <ListItemText
                    primary="Webcam"
                    secondary="Use connected USB webcam"
                  />
                </ListItem>
                <ListItem
                  button
                  onClick={() => setSetupType('ip')}
                >
                  <ListItemText
                    primary="IP Camera"
                    secondary="Connect to IP camera or RTSP stream"
                  />
                </ListItem>
              </List>
            </>
          ) : setupType === 'webcam' ? (
            <WebcamSetup
              onSave={handleCameraSetup}
              onCancel={handleCloseDialog}
              initialData={selectedCamera}
            />
          ) : (
            <IPCameraSetup
              onSave={handleCameraSetup}
              onCancel={handleCloseDialog}
              initialData={selectedCamera}
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default CameraManager;
