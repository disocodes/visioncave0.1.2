import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import SchoolIcon from '@mui/icons-material/School';

const COLORS = ['#0088FE', '#FF8042'];

const StudentAttendanceWidget = ({ socketUrl }) => {
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    absent: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = new WebSocket(socketUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'attendance_update') {
        setAttendanceData(prevData => ({
          ...prevData,
          present: data.present,
          absent: data.absent,
          recentActivity: [
            {
              time: new Date().toLocaleTimeString(),
              action: data.action,
              student: data.student
            },
            ...prevData.recentActivity.slice(0, 4)
          ]
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

  const pieData = [
    { name: 'Present', value: attendanceData.present },
    { name: 'Absent', value: attendanceData.absent }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SchoolIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Student Attendance</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" align="center" gutterBottom>
                Attendance Overview
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography>
                  Total Students: {attendanceData.present + attendanceData.absent}
                </Typography>
                <Typography color="primary">
                  Present: {attendanceData.present}
                </Typography>
                <Typography color="error">
                  Absent: {attendanceData.absent}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Recent Activity
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.recentActivity.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>{activity.time}</TableCell>
                        <TableCell>{activity.student}</TableCell>
                        <TableCell>{activity.action}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StudentAttendanceWidget;
