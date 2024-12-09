import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Box, IconButton, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const WidgetContainer = ({ id, type, children, onMove, index }) => {
  const [expanded, setExpanded] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'WIDGET',
    item: { id, type, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'WIDGET',
    hover: (item, monitor) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <Paper
      ref={(node) => drag(drop(node))}
      elevation={3}
      sx={{
        m: 1,
        opacity: isDragging ? 0.5 : 1,
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          borderBottom: expanded ? 1 : 0,
          borderColor: 'divider',
        }}
      >
        <IconButton size="small" sx={{ mr: 1 }}>
          <DragIndicatorIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>{type}</Box>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Box
        sx={{
          display: expanded ? 'block' : 'none',
          p: 2,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default WidgetContainer;
