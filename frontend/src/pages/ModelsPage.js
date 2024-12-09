import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  LinearProgress,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  PlayArrow as TrainIcon,
  Save as DeployIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const modelTypes = {
  objectDetection: {
    name: 'Object Detection',
    frameworks: ['TensorFlow', 'PyTorch', 'YOLO'],
  },
  classification: {
    name: 'Classification',
    frameworks: ['TensorFlow', 'PyTorch', 'ResNet'],
  },
  segmentation: {
    name: 'Segmentation',
    frameworks: ['TensorFlow', 'PyTorch', 'Mask R-CNN'],
  },
  tracking: {
    name: 'Tracking',
    frameworks: ['TensorFlow', 'PyTorch', 'DeepSORT'],
  },
};

function ModelsPage() {
  const [models, setModels] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    framework: '',
    description: '',
    file: null,
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/v1/models');
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleUpload = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch('/api/v1/models/upload', {
        method: 'POST',
        body: formDataToSend,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.ok) {
        setUploadDialogOpen(false);
        fetchModels();
      }
    } catch (error) {
      console.error('Error uploading model:', error);
    }
  };

  const handleDelete = async (modelId) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await fetch(`/api/v1/models/${modelId}`, {
          method: 'DELETE',
        });
        fetchModels();
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };

  const handleTrain = async (modelId) => {
    try {
      await fetch(`/api/v1/models/${modelId}/train`, {
        method: 'POST',
      });
      alert('Training started successfully');
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  const handleDeploy = async (modelId) => {
    try {
      await fetch(`/api/v1/models/${modelId}/deploy`, {
        method: 'POST',
      });
      alert('Model deployed successfully');
    } catch (error) {
      console.error('Error deploying model:', error);
    }
  };

  const renderModelCards = () => {
    return models.map((model) => (
      <Grid item xs={12} sm={6} md={4} key={model.id}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">{model.name}</Typography>
              <Chip
                label={model.status}
                color={model.status === 'deployed' ? 'success' : 'default'}
                size="small"
              />
            </Box>
            <Typography color="textSecondary" gutterBottom>
              {modelTypes[model.type]?.name || model.type}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Framework: {model.framework}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {model.description}
            </Typography>
          </CardContent>
          <CardActions>
            <IconButton size="small" onClick={() => handleTrain(model.id)}>
              <TrainIcon />
            </IconButton>
            <IconButton size="small" onClick={() => handleDeploy(model.id)}>
              <DeployIcon />
            </IconButton>
            <IconButton size="small" onClick={() => handleDelete(model.id)}>
              <DeleteIcon />
            </IconButton>
            <IconButton size="small" onClick={() => setSelectedModel(model)}>
              <InfoIcon />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Models</Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Model
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Models" />
          <Tab label="Object Detection" />
          <Tab label="Classification" />
          <Tab label="Segmentation" />
          <Tab label="Tracking" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {renderModelCards()}
      </Grid>

      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload New Model</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Model Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Model Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {Object.entries(modelTypes).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Framework</InputLabel>
              <Select
                value={formData.framework}
                onChange={(e) =>
                  setFormData({ ...formData, framework: e.target.value })
                }
              >
                {formData.type &&
                  modelTypes[formData.type].frameworks.map((framework) => (
                    <MenuItem key={framework} value={framework}>
                      {framework}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload Model File
              <input
                type="file"
                hidden
                onChange={(e) =>
                  setFormData({ ...formData, file: e.target.files[0] })
                }
              />
            </Button>
            {uploadProgress > 0 && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!selectedModel}
        onClose={() => setSelectedModel(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedModel?.name} - Details</DialogTitle>
        <DialogContent>
          {selectedModel && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Accuracy
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.metrics?.accuracy || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Processing Time
                  </Typography>
                  <Typography variant="h6">
                    {selectedModel.metrics?.processingTime || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                Training History
              </Typography>
              {selectedModel.trainingHistory?.map((entry, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(entry.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    Epochs: {entry.epochs}, Loss: {entry.loss}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedModel(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModelsPage;
