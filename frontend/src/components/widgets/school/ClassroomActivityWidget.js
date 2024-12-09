import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { School, People, Timeline } from '@mui/icons-material';

const ClassroomActivityWidget = () => {
  const classroomData = useSelector((state) => state.widgetData.classroom);

  const formatAttentionScore = (score) => {
    return `${Math.round(score)}%`;
  };

  const getAttentionColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Classroom Activity Monitor
        </Typography>

        {/* Overall Statistics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="body2" color="textSecondary">
                Active Classes
              </Typography>
              <Typography variant="h6">
                {classroomData.classrooms.length}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'secondary.main' }} />
              <Typography variant="body2" color="textSecondary">
                Total Students
              </Typography>
              <Typography variant="h6">
                {classroomData.classrooms.reduce(
                  (sum, room) => sum + room.occupancy,
                  0
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 40, color: 'success.main' }} />
              <Typography variant="body2" color="textSecondary">
                Avg. Attention
              </Typography>
              <Typography variant="h6">
                {formatAttentionScore(classroomData.averages.attention)}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Classroom List */}
        <List>
          {classroomData.classrooms.map((classroom, index) => (
            <ListItem key={classroom.id || index}>
              <ListItemText
                primary={classroom.name}
                secondary={
                  <Box sx={{ width: '100%' }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Typography variant="body2" component="span">
                          Attention Score:{' '}
                          <span
                            style={{
                              color: getAttentionColor(classroom.attention),
                              fontWeight: 'bold',
                            }}
                          >
                            {formatAttentionScore(classroom.attention)}
                          </span>
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <LinearProgress
                          variant="determinate"
                          value={classroom.attention}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getAttentionColor(
                                classroom.attention
                              ),
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          Students: {classroom.occupancy} | Activity Level:{' '}
                          {classroom.activity}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {/* Attention Trend Chart */}
        <Box sx={{ height: 200, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={classroomData.classrooms}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="attention"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClassroomActivityWidget;
