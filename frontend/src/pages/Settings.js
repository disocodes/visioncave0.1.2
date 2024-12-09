import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const userRoles = {
  admin: 'Administrator',
  manager: 'Manager',
  operator: 'Operator',
  viewer: 'Viewer',
};

const modulePermissions = {
  residential: 'Residential Vision',
  school: 'School Vision',
  hospital: 'Hospital Vision',
  mine: 'Mine Site Vision',
  traffic: 'Traffic Vision',
};

function Settings() {
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    role: '',
    permissions: [],
  });

  const [appSettings, setAppSettings] = useState({
    darkMode: true,
    notifications: true,
    autoUpdate: true,
    dataRetention: 30,
    streamQuality: 'high',
    gpuAcceleration: true,
  });

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/v1/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/v1/settings');
      const data = await response.json();
      setAppSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveUser = async () => {
    try {
      const url = selectedUser
        ? `/api/v1/users/${selectedUser.id}`
        : '/api/v1/users';
      const method = selectedUser ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userFormData),
      });

      setUserDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`/api/v1/users/${userId}`, {
          method: 'DELETE',
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appSettings),
      });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const renderUserManagement = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedUser(null);
            setUserFormData({
              username: '',
              email: '',
              role: '',
              permissions: [],
            });
            setUserDialogOpen(true);
          }}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{userRoles[user.role]}</TableCell>
                <TableCell>
                  {user.permissions.map((permission) => (
                    <Chip
                      key={permission}
                      label={modulePermissions[permission]}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedUser(user);
                      setUserFormData(user);
                      setUserDialogOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAppSettings = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Application Settings
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={appSettings.darkMode}
                      onChange={(e) =>
                        setAppSettings({
                          ...appSettings,
                          darkMode: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Dark Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={appSettings.notifications}
                      onChange={(e) =>
                        setAppSettings({
                          ...appSettings,
                          notifications: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Enable Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={appSettings.autoUpdate}
                      onChange={(e) =>
                        setAppSettings({
                          ...appSettings,
                          autoUpdate: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Auto Update"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Stream Quality</InputLabel>
                  <Select
                    value={appSettings.streamQuality}
                    onChange={(e) =>
                      setAppSettings({
                        ...appSettings,
                        streamQuality: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="low">Low (480p)</MenuItem>
                    <MenuItem value="medium">Medium (720p)</MenuItem>
                    <MenuItem value="high">High (1080p)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  type="number"
                  label="Data Retention (days)"
                  value={appSettings.dataRetention}
                  onChange={(e) =>
                    setAppSettings({
                      ...appSettings,
                      dataRetention: parseInt(e.target.value),
                    })
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={appSettings.gpuAcceleration}
                      onChange={(e) =>
                        setAppSettings({
                          ...appSettings,
                          gpuAcceleration: e.target.checked,
                        })
                      }
                    />
                  }
                  label="GPU Acceleration"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="User Management" />
          <Tab label="Application Settings" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {currentTab === 0 ? renderUserManagement() : renderAppSettings()}
      </Box>

      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Username"
              fullWidth
              value={userFormData.username}
              onChange={(e) =>
                setUserFormData({ ...userFormData, username: e.target.value })
              }
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={userFormData.email}
              onChange={(e) =>
                setUserFormData({ ...userFormData, email: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={userFormData.role}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, role: e.target.value })
                }
              >
                {Object.entries(userRoles).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={userFormData.permissions}
                onChange={(e) =>
                  setUserFormData({
                    ...userFormData,
                    permissions: e.target.value,
                  })
                }
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={modulePermissions[value]}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {Object.entries(modulePermissions).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">
            {selectedUser ? 'Update' : 'Add'} User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Settings;
