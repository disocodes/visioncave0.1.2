import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  useTheme,
  alpha,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  LocalHospital as HospitalIcon,
  Construction as MineIcon,
  TrafficRounded as TrafficIcon,
  ArrowForward as ArrowForwardIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  CameraAlt as CameraIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ModuleCard = ({ title, description, icon, image, path, stats }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: 200,
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={title}
          sx={{
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(to bottom, ${alpha(
              theme.palette.primary.main,
              0.2
            )}, ${alpha(theme.palette.primary.main, 0.4)})`,
          }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            top: theme.spacing(1),
            right: theme.spacing(1),
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {icon}
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {description}
        </Typography>
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid item xs={6} key={index}>
              <Paper
                sx={{
                  p: 1,
                  textAlign: 'center',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <Typography variant="h6" color="primary">
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(path)}
        >
          Enter Module
        </Button>
      </Box>
    </Card>
  );
};

const LandingPage = () => {
  const theme = useTheme();

  const modules = [
    {
      title: 'Residential Vision',
      description:
        'Advanced monitoring and security solutions for residential areas, including package detection and suspicious activity alerts.',
      icon: <HomeIcon />,
      image: '/images/residential.jpg',
      path: '/residential',
      stats: [
        { value: '24/7', label: 'Monitoring' },
        { value: '99.9%', label: 'Accuracy' },
      ],
    },
    {
      title: 'School Vision',
      description:
        'Comprehensive surveillance system for educational institutions, featuring attendance tracking and safety monitoring.',
      icon: <SchoolIcon />,
      image: '/images/school.jpg',
      path: '/school',
      stats: [
        { value: '1000+', label: 'Students' },
        { value: '95%', label: 'Safety Score' },
      ],
    },
    {
      title: 'Hospital Vision',
      description:
        'Real-time patient monitoring system with fall detection and equipment tracking capabilities.',
      icon: <HospitalIcon />,
      image: '/images/hospital.jpg',
      path: '/hospital',
      stats: [
        { value: '100%', label: 'Coverage' },
        { value: '<30s', label: 'Response' },
      ],
    },
    {
      title: 'Mine Site Vision',
      description:
        'Advanced safety and equipment monitoring for mining operations, including machinery tracking and hazard detection.',
      icon: <MineIcon />,
      image: '/images/mine.jpg',
      path: '/mine',
      stats: [
        { value: '15+', label: 'Vehicles' },
        { value: '85%', label: 'Efficiency' },
      ],
    },
    {
      title: 'Traffic Vision',
      description:
        'Smart traffic monitoring and analysis system for urban areas, featuring flow analysis and incident detection.',
      icon: <TrafficIcon />,
      image: '/images/traffic.jpg',
      path: '/traffic',
      stats: [
        { value: '50+', label: 'Cameras' },
        { value: '90%', label: 'Accuracy' },
      ],
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        pt: 4,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Welcome to VisionCave
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
          >
            Advanced AI-powered video analytics platform for comprehensive
            monitoring and security across multiple domains
          </Typography>
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            <Grid item>
              <Tooltip title="Real-time Security">
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <SecurityIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">Advanced Security</Typography>
                </Paper>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Analytics Dashboard">
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <AnalyticsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">Real-time Analytics</Typography>
                </Paper>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Multi-camera Support">
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <CameraIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">Multi-camera Support</Typography>
                </Paper>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>

        {/* Module Cards */}
        <Grid container spacing={4}>
          {modules.map((module, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <ModuleCard {...module} />
            </Grid>
          ))}
        </Grid>

        {/* Quick Access Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Quick Access
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CameraIcon />}
                sx={{ height: '100%', minHeight: 64 }}
              >
                Camera Management
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                sx={{ height: '100%', minHeight: 64 }}
              >
                Analytics Dashboard
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SettingsIcon />}
                sx={{ height: '100%', minHeight: 64 }}
              >
                System Settings
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
