import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Collapse,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const BaseWidget = ({
  title,
  icon: Icon,
  onClose,
  onSettings,
  expanded: controlledExpanded,
  onExpandChange,
  children,
  headerProps = {},
  contentProps = {},
}) => {
  const theme = useTheme();
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleExpandClick = () => {
    if (isControlled) {
      onExpandChange?.(!expanded);
    } else {
      setInternalExpanded(!expanded);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <CardHeader
        avatar={Icon && <Icon />}
        action={
          <Box>
            {onSettings && (
              <IconButton onClick={onSettings} size="small">
                <SettingsIcon />
              </IconButton>
            )}
            <IconButton
              onClick={handleExpandClick}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                }),
              }}
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
            {onClose && (
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        }
        title={
          <Typography variant="subtitle1" component="div">
            {title}
          </Typography>
        }
        {...headerProps}
      />
      <Collapse in={expanded} timeout="auto" sx={{ flexGrow: 1 }}>
        <CardContent
          sx={{ height: expanded ? '100%' : 'auto', pb: '16px !important' }}
          {...contentProps}
        >
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default BaseWidget;
