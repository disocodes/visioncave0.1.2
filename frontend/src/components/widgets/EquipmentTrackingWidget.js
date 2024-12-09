import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { Line } from 'react-chartjs-2';

const EquipmentTrackingWidget = () => {
  const dispatch = useDispatch();
  const [equipmentData, setEquipmentData] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [movementHistory, setMovementHistory] = useState([]);

  const [newEquipment, setNewEquipment] = useState({
    id: '',
    name: '',
    type: '',
    location: '',
    status: 'available',
    lastMaintenance: '',
    nextMaintenance: '',
  });

  useEffect(() => {
    // Fetch equipment data from backend
    // dispatch(fetchEquipmentData());
  }, []);

  const handleAddEquipment = () => {
    setDialogOpen(true);
    setSelectedEquipment(null);
    setNewEquipment({
      id: '',
      name: '',
      type: '',
      location: '',
      status: 'available',
      lastMaintenance: '',
      nextMaintenance: '',
    });
  };

  const handleEditEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setNewEquipment(equipment);
    setDialogOpen(true);
  };

  const handleSaveEquipment = () => {
    if (selectedEquipment) {
      // dispatch(updateEquipment(newEquipment));
    } else {
      // dispatch(addEquipment(newEquipment));
    }
    setDialogOpen(false);
  };

  const handleViewHistory = (equipment) => {
    setSelectedEquipment(equipment);
    // Fetch movement history
    // dispatch(fetchEquipmentHistory(equipment.id));
    setHistoryDialogOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      inUse: 'primary',
      maintenance: 'warning',
      missing: 'error',
    };
    return colors[status] || 'default';
  };

  const movementHistoryData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Movement Count',
        data: [12, 19, 3, 5, 2, 3],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Equipment Tracking</Typography>
          <Box>
            <TextField
              size="small"
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mr: 1 }}
              InputProps={{
                endAdornment: <SearchIcon />,
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddEquipment}
            >
              Add Equipment
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Maintenance</TableCell>
                <TableCell>Next Maintenance</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipmentData.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell>{equipment.id}</TableCell>
                  <TableCell>{equipment.name}</TableCell>
                  <TableCell>{equipment.type}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                      {equipment.location}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={equipment.status}
                      color={getStatusColor(equipment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{equipment.lastMaintenance}</TableCell>
                  <TableCell>{equipment.nextMaintenance}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditEquipment(equipment)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleViewHistory(equipment)}
                    >
                      <HistoryIcon />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Equipment Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            {selectedEquipment ? 'Edit Equipment' : 'Add Equipment'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Equipment Name"
                  value={newEquipment.name}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Type"
                  value={newEquipment.type}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, type: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={newEquipment.location}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, location: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Maintenance"
                  type="date"
                  value={newEquipment.lastMaintenance}
                  onChange={(e) =>
                    setNewEquipment({
                      ...newEquipment,
                      lastMaintenance: e.target.value,
                    })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Next Maintenance"
                  type="date"
                  value={newEquipment.nextMaintenance}
                  onChange={(e) =>
                    setNewEquipment({
                      ...newEquipment,
                      nextMaintenance: e.target.value,
                    })
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEquipment} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Movement History Dialog */}
        <Dialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Equipment Movement History</DialogTitle>
          <DialogContent>
            <Box sx={{ height: 300, mt: 2 }}>
              <Line data={movementHistoryData} />
            </Box>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movementHistory.map((movement, index) => (
                    <TableRow key={index}>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell>{movement.from}</TableCell>
                      <TableCell>{movement.to}</TableCell>
                      <TableCell>{movement.duration}</TableCell>
                      <TableCell>
                        <Chip
                          label={movement.status}
                          color={getStatusColor(movement.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EquipmentTrackingWidget;
