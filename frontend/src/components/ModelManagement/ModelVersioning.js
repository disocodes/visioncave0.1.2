import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const ModelVersioning = ({ modelId }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchVersions();
  }, [modelId]);

  const fetchVersions = async () => {
    try {
      const response = await axios.get(`/api/models/${modelId}/versions`);
      setVersions(response.data);
    } catch (error) {
      enqueueSnackbar('Error fetching model versions', { variant: 'error' });
    }
  };

  const handleCompareVersions = async () => {
    if (selectedVersions.length !== 2) {
      enqueueSnackbar('Please select exactly 2 versions to compare', { variant: 'warning' });
      return;
    }

    try {
      const response = await axios.post(`/api/models/versions/compare`, {
        version1: selectedVersions[0],
        version2: selectedVersions[1]
      });
      setComparisonResult(response.data);
      setCompareDialogOpen(true);
    } catch (error) {
      enqueueSnackbar('Error comparing versions', { variant: 'error' });
    }
  };

  const handleRollback = async (versionHash) => {
    try {
      await axios.post(`/api/models/${modelId}/versions/${versionHash}/rollback`);
      enqueueSnackbar('Successfully rolled back to selected version', { variant: 'success' });
      fetchVersions();
    } catch (error) {
      enqueueSnackbar('Error rolling back version', { variant: 'error' });
    }
  };

  const columns = [
    { field: 'hash', headerName: 'Version Hash', width: 200 },
    { field: 'created_at', headerName: 'Created At', width: 200 },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleRollback(params.row.hash)}
        >
          Rollback
        </Button>
      ),
    },
  ];

  const ComparisonDialog = () => (
    <Dialog
      open={compareDialogOpen}
      onClose={() => setCompareDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Version Comparison</DialogTitle>
      <DialogContent>
        {comparisonResult && (
          <Box>
            <Typography variant="h6">Metrics Comparison</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell>Version 1</TableCell>
                    <TableCell>Version 2</TableCell>
                    <TableCell>Difference</TableCell>
                    <TableCell>% Change</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(comparisonResult.metrics_comparison).map(([metric, values]) => (
                    <TableRow key={metric}>
                      <TableCell>{metric}</TableCell>
                      <TableCell>{values.v1.toFixed(4)}</TableCell>
                      <TableCell>{values.v2.toFixed(4)}</TableCell>
                      <TableCell>{values.diff.toFixed(4)}</TableCell>
                      <TableCell>{values.diff_percent.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 3 }}>Metadata Changes</Typography>
            <Box sx={{ mt: 1 }}>
              <pre>
                {JSON.stringify(
                  {
                    version1: comparisonResult.version1.metadata,
                    version2: comparisonResult.version2.metadata
                  },
                  null,
                  2
                )}
              </pre>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Model Versions
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleCompareVersions}
          disabled={selectedVersions.length !== 2}
        >
          Compare Selected Versions
        </Button>
      </Box>

      <DataGrid
        rows={versions}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
        onSelectionModelChange={(newSelection) => {
          setSelectedVersions(newSelection);
        }}
        autoHeight
      />

      <ComparisonDialog />
    </Box>
  );
};

export default ModelVersioning;
