import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PeopleIcon from '@mui/icons-material/People';

const OccupancyTrackingWidget = ({ socketUrl }) => {
  const [occupancyData, setOccupancyData] = useState([]);
  const [currentOccupancy, setCurrentOccupancy] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = new WebSocket(socketUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'occupancy_update') {
        setCurrentOccupancy(data.current_occupancy);
        setOccupancyData(prevData => {
          const newData = [...prevData, {
            time: new Date().toLocaleTimeString(),
            occupancy: data.current_occupancy
          }];
          return newData.slice(-10); // Keep last 10 data points
        });
      }
      setLoading(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setLoading(false);
    };

    return () => {
      ws.close();
    };
  }, [socketUrl]);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PeopleIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Occupancy Tracking</Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              textAlign: 'center',
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1
            }}>
              <Typography variant="h3">{currentOccupancy}</Typography>
              <Typography variant="subtitle1">Current Occupancy</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={occupancyData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="occupancy" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default OccupancyTrackingWidget;
