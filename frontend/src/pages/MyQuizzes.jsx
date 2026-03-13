import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import AnimatedLoader from '../components/Common/AnimatedLoader';
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import VisibilityIcon from '@mui/icons-material/Visibility';
import QuizIcon from '@mui/icons-material/Quiz';
import toast from 'react-hot-toast';
import { getAllQuizzes, deleteQuiz, publishQuiz, toggleQuizStatus } from '../services/quizService';
import { useAuthStore } from '../context/store';
import socket from '../socket';

const MyQuizzes = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmColor: 'primary',
    onConfirm: null
  });

  const isFacultyOrAdmin = user && (user.role === 'faculty' || user.role === 'admin');

  useEffect(() => {
    fetchQuizzes();

    // Listen for real-time quiz updates
    socket.on('quiz-updated', (data) => {
      console.log('Quiz updated:', data);
      // Refresh the quiz list
      fetchQuizzes();
      toast.success('Quiz list updated');
    });

    socket.on('quiz-status-changed', (data) => {
      console.log('Quiz status changed:', data);
      // Update the specific quiz in the list
      setQuizzes(prevQuizzes => 
        prevQuizzes.map(quiz => 
          quiz._id === data.quizId ? { ...quiz, status: data.newStatus } : quiz
        )
      );
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('quiz-updated');
      socket.off('quiz-status-changed');
    };
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getAllQuizzes();
      if (response.success) {
        setQuizzes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, quiz) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuiz(quiz);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openConfirmDialog = ({ title, message, confirmText, confirmColor, onConfirm }) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      confirmText,
      confirmColor,
      onConfirm
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false, onConfirm: null }));
  };

  const handleConfirmAction = async () => {
    if (typeof confirmDialog.onConfirm === 'function') {
      await confirmDialog.onConfirm();
    }
    closeConfirmDialog();
  };

  const handlePublish = async (quizId) => {
    openConfirmDialog({
      title: 'Publish Quiz',
      message: 'Are you sure you want to publish this quiz? Once published, students will be able to see and attempt it.',
      confirmText: 'Publish',
      confirmColor: 'success',
      onConfirm: async () => {
        try {
          const response = await publishQuiz(quizId);
          if (response.success) {
            toast.success('Quiz published successfully!');
            fetchQuizzes();
          } else {
            toast.error(response.message || 'Failed to publish quiz');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to publish quiz';
          toast.error(errorMessage);
          console.error('Publish error:', error);
        }
      }
    });
    handleMenuClose();
  };

  const handleDelete = async (quizId) => {
    openConfirmDialog({
      title: 'Delete Quiz',
      message: 'Are you sure you want to delete this quiz? This action cannot be undone.',
      confirmText: 'Delete',
      confirmColor: 'error',
      onConfirm: async () => {
        try {
          await deleteQuiz(quizId);
          toast.success('Quiz deleted successfully!');
          fetchQuizzes();
        } catch (error) {
          toast.error('Failed to delete quiz');
        }
      }
    });
    handleMenuClose();
  };

  const handleStatusChange = async (quizId, newStatus) => {
    try {
      const response = await toggleQuizStatus(quizId, newStatus);
      if (response.success) {
        toast.success(`Quiz status changed to ${newStatus}`);
        fetchQuizzes();
      } else {
        toast.error(response.message || 'Failed to change status');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change status';
      toast.error(errorMessage);
    }
    handleMenuClose();
  };

  const handleView = (quiz) => {
    setSelectedQuiz(quiz);
    setViewDialog(true);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      published: 'success',
      closed: 'error'
    };
    return colors[status] || 'default';
  };

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
                  My Quizzes
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                  Manage all your created quizzes
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/create-quiz')}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                  }}
                >
                  Create Quiz
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{ borderRadius: 2, minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                >
                  Back
                </Button>
              </Box>
            </Box>

            {/* Quiz Cards */}
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AnimatedLoader message="Loading quizzes" size="large" />
              </Box>
            ) : quizzes.length === 0 ? (
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 8, textAlign: 'center' }}>
                  <QuizIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>
                    No Quizzes Created Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                    Start by creating your first quiz
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/create-quiz')}
                    sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      textTransform: 'none',
                      minHeight: '44px',
                      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                    }}
                  >
                    Create Your First Quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                {quizzes.map((quiz) => (
                  <Grid item xs={12} md={6} lg={4} key={quiz._id}>
                    <Card sx={{ 
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>
                              {quiz.title}
                            </Typography>
                            <Chip 
                              label={quiz.status?.toUpperCase()} 
                              color={getStatusColor(quiz.status)}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                          </Box>
                          <IconButton 
                            size="small"
                            onClick={(e) => handleMenuOpen(e, quiz)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                          {quiz.description || 'No description provided'}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                          {quiz.subject && (
                            <Chip label={quiz.subject} size="small" variant="outlined" />
                          )}
                          {quiz.chapter && (
                            <Chip label={quiz.chapter} size="small" variant="outlined" />
                          )}
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Duration</Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{quiz.duration} min</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Total Marks</Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{quiz.totalMarks}</Typography>
                          </Grid>
                        </Grid>

                        {/* Quick Status Actions */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                          {isFacultyOrAdmin && quiz.status === 'draft' && (
                            <Button 
                              size="small"
                              variant="contained"
                              sx={{ flex: 1, minHeight: '36px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                              onClick={() => handlePublish(quiz._id)}
                            >
                              Publish
                            </Button>
                          )}
                          {isFacultyOrAdmin && quiz.status === 'published' && (
                            <>
                              <Button 
                                size="small"
                                variant="contained"
                                color="error"
                                sx={{ flex: 1, minHeight: '36px', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                                onClick={() => handleStatusChange(quiz._id, 'closed')}
                              >
                                Close
                              </Button>
                              <Button 
                                size="small"
                                variant="outlined"
                                sx={{ flex: 1, minHeight: '36px', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                                onClick={() => handleStatusChange(quiz._id, 'draft')}
                              >
                                Unpublish
                              </Button>
                            </>
                          )}
                          {isFacultyOrAdmin && quiz.status === 'closed' && (
                            <>
                              <Button 
                                size="small"
                                variant="contained"
                                color="success"
                                sx={{ flex: 1, minHeight: '36px', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                                onClick={() => handleStatusChange(quiz._id, 'published')}
                              >
                                Reopen
                              </Button>
                              <Button 
                                size="small"
                                variant="outlined"
                                sx={{ flex: 1, minHeight: '36px', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                                onClick={() => handleStatusChange(quiz._id, 'draft')}
                              >
                                Make Draft
                              </Button>
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Actions Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleView(selectedQuiz)}>
                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                View Details
              </MenuItem>
              {isFacultyOrAdmin && (
                <MenuItem onClick={() => navigate(`/edit-quiz/${selectedQuiz?._id}`)}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
              )}
              {isFacultyOrAdmin && selectedQuiz?.status === 'draft' && (
                <MenuItem onClick={() => handlePublish(selectedQuiz?._id)}>
                  <PublishIcon fontSize="small" sx={{ mr: 1 }} />
                  Publish
                </MenuItem>
              )}
              {isFacultyOrAdmin && selectedQuiz?.status === 'published' && (
                <>
                  <MenuItem onClick={() => handleStatusChange(selectedQuiz?._id, 'closed')} sx={{ color: 'error.main' }}>
                    <Chip label="●" size="small" color="error" sx={{ mr: 1, minWidth: '24px' }} />
                    Close
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusChange(selectedQuiz?._id, 'draft')}>
                    <PublishIcon fontSize="small" sx={{ mr: 1 }} />
                    Unpublish
                  </MenuItem>
                </>
              )}
              {isFacultyOrAdmin && selectedQuiz?.status === 'closed' && (
                <>
                  <MenuItem onClick={() => handleStatusChange(selectedQuiz?._id, 'published')} sx={{ color: 'success.main' }}>
                    <Chip label="●" size="small" color="success" sx={{ mr: 1, minWidth: '24px' }} />
                    Reopen
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusChange(selectedQuiz?._id, 'draft')}>
                    <PublishIcon fontSize="small" sx={{ mr: 1 }} />
                    Make Draft
                  </MenuItem>
                </>
              )}
              {isFacultyOrAdmin && (
                <MenuItem onClick={() => handleDelete(selectedQuiz?._id)} sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              )}
            </Menu>

            {/* In-page Confirm Dialog */}
            <Dialog
              open={confirmDialog.open}
              onClose={closeConfirmDialog}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle>
                <Typography variant="h6" fontWeight="bold">{confirmDialog.title}</Typography>
              </DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary">
                  {confirmDialog.message}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeConfirmDialog} variant="outlined">Cancel</Button>
                <Button
                  onClick={handleConfirmAction}
                  variant="contained"
                  color={confirmDialog.confirmColor || 'primary'}
                >
                  {confirmDialog.confirmText || 'Confirm'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle>
                <Typography variant="h6" fontWeight="bold">{selectedQuiz?.title}</Typography>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Description</Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedQuiz?.description || 'No description'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Subject</Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedQuiz?.subject || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Chapter</Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedQuiz?.chapter || 'N/A'}</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Duration</Typography>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedQuiz?.duration} min</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Total Marks</Typography>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedQuiz?.totalMarks}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Passing Marks</Typography>
                      <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedQuiz?.passingMarks}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setViewDialog(false)}>Close</Button>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </motion.div>
      </ResponsivePageLayout>
    </MainLayout>
  );
};

export default MyQuizzes;
