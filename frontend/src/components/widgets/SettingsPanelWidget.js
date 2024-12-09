import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const SettingsPanelWidget = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);
  const [activeTab, setActiveTab] = useState(0);
  const [configChanged, setConfigChanged] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    general: {
      systemName: 'VisionCave',
      language: 'en',
      theme: 'light',
      notifications: true,
      autoUpdate: true,
    },
    video: {
      resolution: '1080p',
      fps: 30,
      quality: 'high',
      enableHardwareAcceleration: true,
      recordingFormat: 'mp4',
    },
    detection: {
      confidence: 0.6,
      minObjectSize: 30,
      maxObjectSize: 1000,
      trackerType: 'CSRT',
      enableMultiTracking: true,
    },
    analytics: {
      retentionPeriod: 30,
      aggregationInterval: '1h',
      enableAdvancedMetrics: true,
      exportFormat: 'csv',
    },
    safety: {
      ppeDetection: true,
      proximityThreshold: 2,
      restrictedZoneAlerts: true,
      violationThreshold: 3,
    },
    alerts: {
      email: true,
      push: true,
      sound: true,
      criticalOnly: false,
    },
  });

  useEffect(() => {
    // Load settings from backend
    // dispatch(fetchSettings());
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (category, setting, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
    setConfigChanged(true);
  };

  const handleSaveSettings = () => {
    dispatch(updateSettings(localSettings));
    setConfigChanged(false);
  };

  const handleResetSettings = () => {
    setLocalSettings(settings);
    setConfigChanged(false);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="General" />
            <Tab label="Video" />
            <Tab label="Detection" />
            <Tab label="Analytics" />
            <Tab label="Safety" />
            <Tab label="Alerts" />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="System Name"
                value={localSettings.general.systemName}
                onChange={(e) =>
                  handleSettingChange('general', 'systemName', e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={localSettings.general.language}
                  onChange={(e) =>
                    handleSettingChange('general', 'language', e.target.value)
                  }
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={localSettings.general.theme}
                  onChange={(e) =>
                    handleSettingChange('general', 'theme', e.target.value)
                  }
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.general.notifications}
                    onChange={(e) =>
                      handleSettingChange(
                        'general',
                        'notifications',
                        e.target.checked
                      )
                    }
                  />
                }
                label="Enable Notifications"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Video Settings */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Resolution</InputLabel>
                <Select
                  value={localSettings.video.resolution}
                  onChange={(e) =>
                    handleSettingChange('video', 'resolution', e.target.value)
                  }
                >
                  <MenuItem value="720p">720p</MenuItem>
                  <MenuItem value="1080p">1080p</MenuItem>
                  <MenuItem value="4k">4K</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>FPS</Typography>
              <Slider
                value={localSettings.video.fps}
                min={15}
                max={60}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(e, value) =>
                  handleSettingChange('video', 'fps', value)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Quality</InputLabel>
                <Select
                  value={localSettings.video.quality}
                  onChange={(e) =>
                    handleSettingChange('video', 'quality', e.target.value)
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Detection Settings */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography gutterBottom>Confidence Threshold</Typography>
              <Slider
                value={localSettings.detection.confidence}
                min={0}
                max={1}
                step={0.1}
                marks
                valueLabelDisplay="auto"
                onChange={(e, value) =>
                  handleSettingChange('detection', 'confidence', value)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tracker Type</InputLabel>
                <Select
                  value={localSettings.detection.trackerType}
                  onChange={(e) =>
                    handleSettingChange('detection', 'trackerType', e.target.value)
                  }
                >
                  <MenuItem value="CSRT">CSRT</MenuItem>
                  <MenuItem value="KCF">KCF</MenuItem>
                  <MenuItem value="MOSSE">MOSSE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.detection.enableMultiTracking}
                    onChange={(e) =>
                      handleSettingChange(
                        'detection',
                        'enableMultiTracking',
                        e.target.checked
                      )
                    }
                  />
                }
                label="Enable Multi-Object Tracking"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Settings */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography gutterBottom>Data Retention (days)</Typography>
              <Slider
                value={localSettings.analytics.retentionPeriod}
                min={1}
                max={90}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(e, value) =>
                  handleSettingChange('analytics', 'retentionPeriod', value)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Aggregation Interval</InputLabel>
                <Select
                  value={localSettings.analytics.aggregationInterval}
                  onChange={(e) =>
                    handleSettingChange(
                      'analytics',
                      'aggregationInterval',
                      e.target.value
                    )
                  }
                >
                  <MenuItem value="5m">5 minutes</MenuItem>
                  <MenuItem value="15m">15 minutes</MenuItem>
                  <MenuItem value="1h">1 hour</MenuItem>
                  <MenuItem value="1d">1 day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.analytics.enableAdvancedMetrics}
                    onChange={(e) =>
                      handleSettingChange(
                        'analytics',
                        'enableAdvancedMetrics',
                        e.target.checked
                      )
                    }
                  />
                }
                label="Enable Advanced Metrics"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Safety Settings */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.safety.ppeDetection}
                    onChange={(e) =>
                      handleSettingChange(
                        'safety',
                        'ppeDetection',
                        e.target.checked
                      )
                    }
                  />
                }
                label="PPE Detection"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>
                Proximity Threshold (meters)
                <Tooltip title="Minimum safe distance between people">
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Slider
                value={localSettings.safety.proximityThreshold}
                min={1}
                max={5}
                step={0.5}
                marks
                valueLabelDisplay="auto"
                onChange={(e, value) =>
                  handleSettingChange('safety', 'proximityThreshold', value)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>
                Violation Threshold
                <Tooltip title="Number of violations before triggering an alert">
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Slider
                value={localSettings.safety.violationThreshold}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(e, value) =>
                  handleSettingChange('safety', 'violationThreshold', value)
                }
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Alert Settings */}
        <TabPanel value={activeTab} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.alerts.email}
                    onChange={(e) =>
                      handleSettingChange('alerts', 'email', e.target.checked)
                    }
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.alerts.push}
                    onChange={(e) =>
                      handleSettingChange('alerts', 'push', e.target.checked)
                    }
                  />
                }
                label="Push Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.alerts.sound}
                    onChange={(e) =>
                      handleSettingChange('alerts', 'sound', e.target.checked)
                    }
                  />
                }
                label="Sound Alerts"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.alerts.criticalOnly}
                    onChange={(e) =>
                      handleSettingChange(
                        'alerts',
                        'criticalOnly',
                        e.target.checked
                      )
                    }
                  />
                }
                label="Critical Alerts Only"
              />
            </Grid>
          </Grid>
        </TabPanel>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          {configChanged && (
            <Alert severity="info" sx={{ flexGrow: 1 }}>
              You have unsaved changes
            </Alert>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleResetSettings}
            disabled={!configChanged}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={!configChanged}
          >
            Save Changes
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SettingsPanelWidget;
