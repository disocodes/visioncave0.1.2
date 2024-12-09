import React, { useState, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import axios from 'axios';

const IPCameraSetup = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    username: '',
    password: '',
    protocol: 'rtsp',
    port: '',
  });
  const [testStatus, setTestStatus] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        url: initialData.url || '',
        username: initialData.configuration?.username || '',
        password: initialData.configuration?.password || '',
        protocol: initialData.configuration?.protocol || 'rtsp',
        port: initialData.configuration?.port || '',
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const testConnection = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      const response = await axios.post('/api/v1/cameras/test-connection', {
        url: formData.url,
        username: formData.username,
        password: formData.password,
        protocol: formData.protocol,
        port: formData.port,
      });
      setTestStatus({ success: true, message: 'Connection successful!' });
    } catch (error) {
      setTestStatus({
        success: false,
        message: error.response?.data?.detail || 'Connection failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const cameraData = {
      name: formData.name,
      type: 'ip',
      url: formData.url,
      configuration: {
        username: formData.username,
        password: formData.password,
        protocol: formData.protocol,
        port: formData.port,
      }
    };
    onSave(cameraData);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        IP Camera Setup
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Camera Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Protocol</InputLabel>
            <Select
              name="protocol"
              value={formData.protocol}
              onChange={handleInputChange}
              label="Protocol"
            >
              <MenuItem value="rtsp">RTSP</MenuItem>
              <MenuItem value="http">HTTP</MenuItem>
              <MenuItem value="https">HTTPS</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Camera URL/IP"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Port"
            name="port"
            value={formData.port}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          {testStatus && (
            <Alert
              severity={testStatus.success ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {testStatus.message}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              onClick={testConnection}
              disabled={testing || !formData.url}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!formData.name || !formData.url}
        >
          Save
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default IPCameraSetup;
