import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Doughnut, Line } from 'react-chartjs-2';

const StudentAttendanceWidget = () => {
  const dispatch = useDispatch();
  const [attendanceData, setAttendanceData] = useState({
    totalStudents: 450,
    presentToday: 425,
    lateToday: 15,
    absentToday: 10,
    attendanceRate: 94.4,
    classes: [
      { id: '10A', present: 28, total: 30 },
      { id: '10B', present: 27, total: 30 },
      { id: '11A', present: 29, total: 30 },
      { id: '11B', present: 26, total: 30 },
      { id: '12A', present: 30, total: 30 },
    ],
    recentActivity: [
      {
        id: 1,
        student: 'John Smith',
        class: '10A',
        time: '08:45',
        status: 'late',
        reason: 'Traffic delay',
      },
      {
        id: 2,
        student: 'Emma Johnson',
        class: '11B',
        time: '08:15',
        status: 'present',
      },
    ],
  });

  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch attendance data from backend
    // dispatch(fetchAttendanceData());
  }, []);

  const attendanceDistributionData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [
      {
        data: [
          attendanceData.presentToday,
          attendanceData.lateToday,
          attendanceData.absentToday,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 206, 86)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const attendanceTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Attendance Rate',
        data: [96, 94, 95, 93, 94.4],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      present: 'success',
      late: 'warning',
      absent: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Student Attendance</Typography>
          <Box>
            <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Class"
              >
                <MenuItem value="all">All Classes</MenuItem>
                {attendanceData.classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    Class {cls.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4">{attendanceData.totalStudents}</Typography>
              <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Present Today
              </Typography>
              <Typography variant="h4" color="success.main">
                {attendanceData.presentToday}
              </Typography>
              <PersonIcon sx={{ fontSize: 40, color: 'success.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Late Today
              </Typography>
              <Typography variant="h4" color="warning.main">
                {attendanceData.lateToday}
              </Typography>
              <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mt: 1 }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Absent Today
              </Typography>
              <Typography variant="h4" color="error.main">
                {attendanceData.absentToday}
              </Typography>
              <NotificationsIcon
                sx={{ fontSize: 40, color: 'error.main', mt: 1 }}
              />
            </Paper>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Today's Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut
                  data={attendanceDistributionData}
                  options={{ maintainAspectRatio: false }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Weekly Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={attendanceTrendData}
                  options={{ maintainAspectRatio: false }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Class-wise Attendance */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Class-wise Attendance
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Class</TableCell>
                      <TableCell align="center">Total Students</TableCell>
                      <TableCell align="center">Present</TableCell>
                      <TableCell align="center">Attendance Rate</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell>Class {cls.id}</TableCell>
                        <TableCell align="center">{cls.total}</TableCell>
                        <TableCell align="center">{cls.present}</TableCell>
                        <TableCell align="center">
                          {((cls.present / cls.total) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              (cls.present / cls.total) * 100 >= 90
                                ? 'Good'
                                : 'Needs Attention'
                            }
                            color={
                              (cls.present / cls.total) * 100 >= 90
                                ? 'success'
                                : 'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Recent Activity
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Class</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.recentActivity.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{ width: 24, height: 24, mr: 1 }}
                            >
                              {activity.student.charAt(0)}
                            </Avatar>
                            {activity.student}
                          </Box>
                        </TableCell>
                        <TableCell>{activity.class}</TableCell>
                        <TableCell>{activity.time}</TableCell>
                        <TableCell>
                          <Chip
                            label={activity.status}
                            color={getStatusColor(activity.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{activity.reason || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Last updated: 2 minutes ago
          </Typography>
          <Button
            startIcon={<FilterIcon />}
            size="small"
            onClick={() => {
              // Handle advanced filtering
            }}
          >
            Advanced Filters
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudentAttendanceWidget;
