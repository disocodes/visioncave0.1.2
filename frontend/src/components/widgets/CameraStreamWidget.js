import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Screenshot as ScreenshotIcon,
  FiberManualRecord as RecordIcon,
} from '@mui/icons-material';
import BaseWidget from './BaseWidget';

const CameraStreamWidget = ({
  cameraId,
  streamUrl,
  title = 'Camera Stream',
  onClose,
  onSettings,
  ...baseWidgetProps
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResolution, setSelectedResolution] = useState('720p');
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const resolutions = {
    '480p': { width: 854, height: 480 },
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
  };

  useEffect(() => {
    if (streamUrl && videoRef.current) {
      const video = videoRef.current;
      video.src = streamUrl;
      
      video.onloadeddata = () => {
        setIsLoading(false);
      };

      video.onerror = () => {
        setIsLoading(false);
        console.error('Error loading video stream');
      };
    }
  }, [streamUrl]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleResolutionChange = (event) => {
    setSelectedResolution(event.target.value);
    // Here you would typically make an API call to change the camera resolution
  };

  const handleScreenshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `screenshot-${new Date().toISOString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const startRecording = () => {
    if (videoRef.current && !isRecording) {
      const stream = videoRef.current.captureStream();
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recording-${new Date().toISOString()}.webm`;
        link.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <BaseWidget
      title={title}
      icon={VideocamIcon}
      onClose={onClose}
      onSettings={onSettings}
      {...baseWidgetProps}
    >
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: 'calc(100% - 48px)', // Leave space for controls
            objectFit: 'contain',
          }}
          autoPlay
          muted
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          alignItems="center"
        >
          <IconButton size="small" onClick={handlePlayPause} color="primary">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          <IconButton size="small" onClick={handleScreenshot} color="primary">
            <ScreenshotIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleRecordToggle}
            color={isRecording ? 'error' : 'primary'}
          >
            <RecordIcon />
          </IconButton>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="resolution-select-label">Resolution</InputLabel>
            <Select
              labelId="resolution-select-label"
              value={selectedResolution}
              label="Resolution"
              onChange={handleResolutionChange}
              sx={{ color: 'white', '& .MuiSelect-icon': { color: 'white' } }}
            >
              {Object.keys(resolutions).map((res) => (
                <MenuItem key={res} value={res}>
                  {res}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" sx={{ ml: 'auto', color: 'white' }}>
            Camera ID: {cameraId}
          </Typography>
        </Stack>
      </Box>
    </BaseWidget>
  );
};

export default CameraStreamWidget;
