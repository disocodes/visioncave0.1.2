import React, { memo } from 'react';
import { Handle } from 'reactflow';
import { Paper, Typography, Box } from '@mui/material';
import {
  Videocam,
  Analytics,
  NotificationsActive,
  Image,
  Timeline,
  CompareArrows,
  Person,
  DirectionsCar,
  Warning,
} from '@mui/icons-material';

const nodeStyles = {
  padding: '10px',
  borderRadius: '3px',
  width: 150,
  fontSize: '12px',
  color: '#222',
  textAlign: 'center',
  borderWidth: 1,
  borderStyle: 'solid',
};

const CustomNode = ({ data, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'cameraInput':
        return <Videocam />;
      case 'imageProcessing':
        return <Image />;
      case 'objectDetection':
        return <CompareArrows />;
      case 'personTracking':
        return <Person />;
      case 'vehicleTracking':
        return <DirectionsCar />;
      case 'analytics':
        return <Analytics />;
      case 'timeSeriesAnalysis':
        return <Timeline />;
      case 'alert':
        return <NotificationsActive />;
      case 'incidentDetection':
        return <Warning />;
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        ...nodeStyles,
        borderColor: data.selected ? '#ff0072' : '#555',
      }}
    >
      <Handle
        type="target"
        position="top"
        style={{ background: '#555' }}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        {getIcon()}
      </Box>
      
      <Typography variant="subtitle2">
        {data.label}
      </Typography>
      
      <Handle
        type="source"
        position="bottom"
        style={{ background: '#555' }}
      />
    </Paper>
  );
};

export const CameraInputNode = memo((props) => (
  <CustomNode {...props} type="cameraInput" />
));

export const ImageProcessingNode = memo((props) => (
  <CustomNode {...props} type="imageProcessing" />
));

export const ObjectDetectionNode = memo((props) => (
  <CustomNode {...props} type="objectDetection" />
));

export const PersonTrackingNode = memo((props) => (
  <CustomNode {...props} type="personTracking" />
));

export const VehicleTrackingNode = memo((props) => (
  <CustomNode {...props} type="vehicleTracking" />
));

export const AnalyticsNode = memo((props) => (
  <CustomNode {...props} type="analytics" />
));

export const TimeSeriesAnalysisNode = memo((props) => (
  <CustomNode {...props} type="timeSeriesAnalysis" />
));

export const AlertNode = memo((props) => (
  <CustomNode {...props} type="alert" />
));

export const IncidentDetectionNode = memo((props) => (
  <CustomNode {...props} type="incidentDetection" />
));

export default {
  cameraInput: CameraInputNode,
  imageProcessing: ImageProcessingNode,
  objectDetection: ObjectDetectionNode,
  personTracking: PersonTrackingNode,
  vehicleTracking: VehicleTrackingNode,
  analytics: AnalyticsNode,
  timeSeriesAnalysis: TimeSeriesAnalysisNode,
  alert: AlertNode,
  incidentDetection: IncidentDetectionNode,
};
