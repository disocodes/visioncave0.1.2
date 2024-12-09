import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material';
import ModelVersioning from '../components/ModelManagement/ModelVersioning';
import ModelMonitoring from '../components/ModelManagement/ModelMonitoring';
import ModelDeployment from '../components/ModelManagement/ModelDeployment';

const ModelManagement = ({ modelId }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const TabPanel = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ mt: 2 }}>
      {value === index && children}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Model Management
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Versions" />
          <Tab label="Monitoring" />
          <Tab label="Deployment" />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        <ModelVersioning modelId={modelId} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <ModelMonitoring modelId={modelId} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <ModelDeployment modelId={modelId} />
      </TabPanel>
    </Box>
  );
};

export default ModelManagement;
