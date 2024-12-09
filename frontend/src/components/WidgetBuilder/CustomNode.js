import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings,
  Delete,
} from '@mui/icons-material';

const CustomNode = ({ data, isConnectable }) => {
  const getNodeStyle = (type) => {
    const baseStyle = {
      padding: '10px',
      borderRadius: '5px',
      width: '200px',
    };

    const styles = {
      camera: {
        ...baseStyle,
        backgroundColor: '#e3f2fd',
        borderColor: '#90caf9',
      },
      detection: {
        ...baseStyle,
        backgroundColor: '#f3e5f5',
        borderColor: '#ce93d8',
      },
      tracking: {
        ...baseStyle,
        backgroundColor: '#e8f5e9',
        borderColor: '#a5d6a7',
      },
      analytics: {
        ...baseStyle,
        backgroundColor: '#fff3e0',
        borderColor: '#ffb74d',
      },
      alert: {
        ...baseStyle,
        backgroundColor: '#ffebee',
        borderColor: '#ef9a9a',
      },
      residential: {
        ...baseStyle,
        backgroundColor: '#e8eaf6',
        borderColor: '#9fa8da',
      },
      school: {
        ...baseStyle,
        backgroundColor: '#f3e5f5',
        borderColor: '#ce93d8',
      },
      hospital: {
        ...baseStyle,
        backgroundColor: '#e1f5fe',
        borderColor: '#81d4fa',
      },
      mine: {
        ...baseStyle,
        backgroundColor: '#fff3e0',
        borderColor: '#ffb74d',
      },
      traffic: {
        ...baseStyle,
        backgroundColor: '#f1f8e9',
        borderColor: '#aed581',
      },
      default: {
        ...baseStyle,
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
      },
    };

    return styles[type] || styles.default;
  };

  const handleConfig = () => {
    // Implement node configuration
    console.log('Configure node:', data);
  };

  const handleDelete = () => {
    // Implement node deletion
    console.log('Delete node:', data);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />

      <Paper
        elevation={2}
        sx={{
          ...getNodeStyle(data.type),
          position: 'relative',
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Typography variant="subtitle2">
            {data.label}
          </Typography>
          <Box>
            <Tooltip title="Configure">
              <IconButton
                size="small"
                onClick={handleConfig}
                sx={{ mr: 0.5 }}
              >
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={handleDelete}
                color="error"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {data.configuration && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Configuration:
            </Typography>
            <pre style={{ margin: 0, fontSize: '0.75rem' }}>
              {JSON.stringify(data.configuration, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </Box>
  );
};

export default memo(CustomNode);
