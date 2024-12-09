import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import Webcam from 'react-webcam';

const WebcamSetup = ({ onSave, onCancel, initialData }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [name, setName] = useState('');
  const [resolution, setResolution] = useState({ width: 1280, height: 720 });
  const webcamRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSelectedDevice(initialData.deviceId);
      setResolution(initialData.resolution);
    }
    getWebcams();
    return () => {
      // Cleanup: stop the stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [initialData]);

  const getWebcams = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error accessing webcams:', error);
    }
  };

  const handleDeviceSelect = async (deviceId) => {
    setSelectedDevice(deviceId);
    // Stop current stream if exists
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId,
          width: resolution.width,
          height: resolution.height
        }
      });
      setStream(newStream);
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const handleSave = () => {
    const cameraData = {
      name,
      type: 'webcam',
      deviceId: selectedDevice,
      resolution,
      configuration: {
        frameRate: 30,
        facingMode: 'user'
      }
    };
    onSave(cameraData);
  };

  const videoConstraints = {
    deviceId: selectedDevice,
    width: resolution.width,
    height: resolution.height
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Webcam Setup
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Camera Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Webcam</InputLabel>
              <Select
                value={selectedDevice}
                onChange={(e) => handleDeviceSelect(e.target.value)}
                label="Select Webcam"
              >
                {devices.map((device) => (
                  <MenuItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${devices.indexOf(device) + 1}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Resolution</InputLabel>
              <Select
                value={`${resolution.width}x${resolution.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(Number);
                  setResolution({ width, height });
                }}
                label="Resolution"
              >
                <MenuItem value="640x480">640x480</MenuItem>
                <MenuItem value="1280x720">1280x720 (HD)</MenuItem>
                <MenuItem value="1920x1080">1920x1080 (Full HD)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!name || !selectedDevice}
            >
              Save
            </Button>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              height: '300px',
              bgcolor: 'black',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            {selectedDevice && (
              <Webcam
                ref={webcamRef}
                audio={false}
                videoConstraints={videoConstraints}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Live Preview
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WebcamSetup;
