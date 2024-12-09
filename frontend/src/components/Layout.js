import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Videocam as VideocamIcon,
  ModelTraining as ModelIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [moduleMenuAnchor, setModuleMenuAnchor] = useState(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleModuleMenuOpen = (event) => {
    setModuleMenuAnchor(event.currentTarget);
  };

  const handleModuleMenuClose = () => {
    setModuleMenuAnchor(null);
  };

  const handleModuleSelect = (moduleId) => {
    navigate(`/dashboard/vision/${moduleId}`);
    handleModuleMenuClose();
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/', exact: true },
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      onClick: handleModuleMenuOpen,
      selected: location.pathname.startsWith('/dashboard/vision/')
    },
    { text: 'Widget Builder', icon: <BuildIcon />, path: '/widget-builder' },
    { text: 'Camera Management', icon: <VideocamIcon />, path: '/camera-management' },
    { text: 'Models', icon: <ModelIcon />, path: '/models' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1a1a1a',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VisionCave
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#1a1a1a',
            color: 'white',
            borderRight: '1px solid rgba(255, 255, 255, 0.12)',
            transform: open ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
            transition: 'transform 0.3s ease-in-out',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={item.onClick || (() => navigate(item.path))}
                  selected={item.selected || location.pathname === item.path}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Menu
        anchorEl={moduleMenuAnchor}
        open={Boolean(moduleMenuAnchor)}
        onClose={handleModuleMenuClose}
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={() => handleModuleSelect('residential')}>Residential</MenuItem>
        <MenuItem onClick={() => handleModuleSelect('school')}>School</MenuItem>
        <MenuItem onClick={() => handleModuleSelect('hospital')}>Hospital</MenuItem>
        <MenuItem onClick={() => handleModuleSelect('mine')}>Mine Site</MenuItem>
        <MenuItem onClick={() => handleModuleSelect('traffic')}>Traffic</MenuItem>
      </Menu>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#121212',
          color: 'white',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
