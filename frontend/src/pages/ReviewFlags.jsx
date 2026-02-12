import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import toast from 'react-hot-toast';

const ReviewFlags = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [flags, setFlags] = useState([
    { 
      id: 1, 
      student: 'Jane Smith', 
      quiz: 'Science Quiz 2', 
      type: 'Tab Switch', 
      severity: 'high',
      timestamp: '2025-12-31 10:45 AM',
      description: 'Student switched tabs 3 times during the quiz',
      status: 'pending'
    },
    { 
      id: 2, 
      student: 'Bob Johnson', 
      quiz: 'History Quiz 1', 
      type: 'Multiple Windows', 
      severity: 'medium',
      timestamp: '2025-12-31 11:20 AM',
      description: 'Multiple browser windows detected',
      status: 'pending'
    },
    { 
      id: 3, 
      student: 'Alice Williams', 
      quiz: 'Mathematics Quiz 1', 
      type: 'Face Detection', 
      severity: 'high',
      timestamp: '2025-12-31 11:35 AM',
      description: 'No face detected for 2 minutes',
      status: 'pending'
    }
  ]);

  const handleApprove = (flagId) => {
    setFlags(flags.map(f => f.id === flagId ? { ...f, status: 'approved' } : f));
    toast.success('Flag approved and action taken');
    setViewDialog(false);
  };

  const handleDismiss = (flagId) => {
    setFlags(flags.map(f => f.id === flagId ? { ...f, status: 'dismissed' } : f));
    toast.success('Flag dismissed');
    setViewDialog(false);
  };

  const handleViewDetails = (flag) => {
    setSelectedFlag(flag);
    setViewDialog(true);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'info'
    };
    return colors[severity] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      dismissed: 'default'
    };
    return colors[status] || 'default';
  };

  const pendingFlags = flags.filter(f => f.status === 'pending');
  const reviewedFlags = flags.filter(f => f.status !== 'pending');

  const stats = [
    { title: 'Total Flags', value: flags.length, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: 'Pending Review', value: pendingFlags.length, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Reviewed', value: reviewedFlags.length, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
  ];

  return (
    <MainLayout>
      <ResponsivePageLayout maxWidth="xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2, sm: 3, md: 4 } }}>
          <Container maxWidth="xl">
            {/* Header */}
            <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>
                  Review Proctoring Flags
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                  Review and take action on flagged activities
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ borderRadius: 2, minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
              >
                Back
              </Button>
            </Box>

            {/* Statistics */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ 
                    borderRadius: 3,
                    background: stat.gradient,
                    color: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent>
                      <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>{stat.value}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{stat.title}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pending Flags */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <WarningIcon color="warning" />
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>Pending Review</Typography>
                  <Chip 
                    label={pendingFlags.length} 
                    color="warning" 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>

                {pendingFlags.length === 0 ? (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    No pending flags to review!
                  </Alert>
                ) : (
                  <List>
                    {pendingFlags.map((flag, index) => (
                      <React.Fragment key={flag.id}>
                        <ListItem
                          sx={{ 
                            p: 2,
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: flag.severity === 'high' ? '#ffebee' : '#fff3e0',
                            '&:hover': { bgcolor: flag.severity === 'high' ? '#ffcdd2' : '#ffe0b2' }
                          }}
                          secondaryAction={
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewDetails(flag)}
                                sx={{ textTransform: 'none', minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                              >
                                Review
                              </Button>
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: getSeverityColor(flag.severity) === 'error' ? '#f44336' : '#ff9800' }}>
                              <FlagIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                                  {flag.student}
                                </Typography>
                                <Chip 
                                  label={flag.type}
                                  color={getSeverityColor(flag.severity)}
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                                  {flag.quiz}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                                  {flag.timestamp}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < pendingFlags.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            {/* Reviewed Flags */}
            {reviewedFlags.length > 0 && (
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <CheckCircleIcon color="success" />
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>Reviewed</Typography>
                  </Box>

                  <List>
                    {reviewedFlags.map((flag, index) => (
                      <React.Fragment key={flag.id}>
                        <ListItem sx={{ p: 2 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: '#94a3b8' }}>
                              {flag.student[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                                  {flag.student}
                                </Typography>
                                <Chip 
                                  label={flag.status.toUpperCase()}
                                  color={getStatusColor(flag.status)}
                                  size="small"
                                />
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                                {flag.type} - {flag.quiz}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < reviewedFlags.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}

            {/* View Details Dialog */}
            <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FlagIcon color="warning" />
                  <Typography variant="h6" fontWeight="bold">Flag Details</Typography>
                </Box>
              </DialogTitle>
              <DialogContent>
                {selectedFlag && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Alert severity={selectedFlag.severity === 'high' ? 'error' : 'warning'} sx={{ borderRadius: 2 }}>
                      {selectedFlag.severity.toUpperCase()} SEVERITY INCIDENT
                    </Alert>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Student</Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedFlag.student}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Quiz</Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedFlag.quiz}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Violation Type</Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedFlag.type}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Time</Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedFlag.timestamp}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Description</Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedFlag.description}</Typography>
                    </Box>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<CancelIcon />}
                  onClick={() => handleDismiss(selectedFlag?.id)}
                  sx={{ textTransform: 'none', minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                >
                  Dismiss Flag
                </Button>
                <Button 
                  variant="contained" 
                  color="error"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleApprove(selectedFlag?.id)}
                  sx={{ textTransform: 'none', minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                >
                  Confirm Violation
                </Button>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </motion.div>
      </ResponsivePageLayout>
    </MainLayout>
  );
};

export default ReviewFlags;
