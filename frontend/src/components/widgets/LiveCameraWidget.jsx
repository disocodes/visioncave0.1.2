import React, { useState, useEffect } from 'react';
import { Box, Button, ButtonGroup, Slider, Typography } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import PanToolIcon from '@mui/icons-material/PanTool';

const LiveCameraWidget = ({ streamUrl, onSnapshot, onRecordingToggle }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    // Initialize camera stream
    const initStream = async () => {
      try {
        // Connect to camera stream
      } catch (error) {
        console.error('Failed to initialize camera stream:', error);
      }
    };

    initStream();
    return () => {
      // Cleanup stream
    };
  }, [streamUrl]);

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording);
    onRecordingToggle?.(!isRecording);
  };

  const handleSnapshot = () => {
    // Capture current frame
    onSnapshot?.();
  };

  const handleZoomChange = (event, newValue) => {
    setZoomLevel(newValue);
  };

  const handlePanToggle = () => {
    setIsPanning(!isPanning);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          width: '100%',
          height: '300px',
          bgcolor: 'black',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Camera feed will be rendered here */}
      </Box>
      <Box sx={{ mt: 2 }}>
        <ButtonGroup variant="contained" sx={{ mb: 2 }}>
          <Button
            startIcon={<VideocamIcon />}
            color={isRecording ? 'error' : 'primary'}
            onClick={handleRecordingToggle}
          >
            {isRecording ? 'Stop' : 'Record'}
          </Button>
          <Button
            startIcon={<CameraAltIcon />}
            onClick={handleSnapshot}
          >
            Snapshot
          </Button>
          <Button
            startIcon={<PanToolIcon />}
            color={isPanning ? 'secondary' : 'primary'}
            onClick={handlePanToggle}
          >
            Pan
          </Button>
        </ButtonGroup>
        <Box sx={{ px: 2 }}>
          <Typography gutterBottom>Zoom</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ZoomInIcon sx={{ mr: 1 }} />
            <Slider
              value={zoomLevel}
              onChange={handleZoomChange}
              min={1}
              max={5}
              step={0.1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LiveCameraWidget;
