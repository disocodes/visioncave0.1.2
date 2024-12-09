import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import PsychologyIcon from '@mui/icons-material/Psychology';
import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';

const ClassroomAttentionWidget = ({ socketUrl }) => {
  const [attentionData, setAttentionData] = useState({
    currentScore: 0,
    timeline: [],
    alerts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = new WebSocket(socketUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'attention_update') {
        setAttentionData(prevData => ({
          currentScore: data.attention_score,
          timeline: [
            ...prevData.timeline,
            {
              time: new Date().toLocaleTimeString(),
              score: data.attention_score,
              engagement: data.engagement_level,
            }
          ].slice(-20), // Keep last 20 data points
          alerts: data.alerts || prevData.alerts,
        }));
        setLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setLoading(false);
    };

    return () => ws.close();
  }, [socketUrl]);

  const getAttentionColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PsychologyIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Classroom Attention Analysis</Typography>
        <Tooltip title="Alerts">
          <IconButton sx={{ ml: 'auto' }}>
            <NotificationsIcon color={attentionData.alerts.length > 0 ? 'error' : 'inherit'} />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={attentionData.currentScore}
                  size={120}
                  thickness={4}
                  sx={{
                    color: getAttentionColor(attentionData.currentScore),
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" component="div">
                    {Math.round(attentionData.currentScore)}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="subtitle1" align="center" sx={{ mt: 2 }}>
                Current Attention Level
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Attention Timeline
                <Tooltip title="Shows attention and engagement levels over time">
                  <InfoIcon fontSize="small" sx={{ ml: 1 }} />
                </Tooltip>
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attentionData.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      name="Attention"
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#82ca9d"
                      name="Engagement"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {attentionData.alerts.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                <Typography variant="subtitle1" color="warning.main">
                  Attention Alerts
                </Typography>
                {attentionData.alerts.map((alert, index) => (
                  <Typography key={index} variant="body2" sx={{ mt: 1 }}>
                    • {alert}
                  </Typography>
                ))}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default ClassroomAttentionWidget;
