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
import DeleteIcon from '@mui/icons-material/Delete';
import PublishIcon from '@mui/icons-material/Publish';
import VisibilityIcon from '@mui/icons-material/Visibility';
import QuizIcon from '@mui/icons-material/Quiz';
import toast from 'react-hot-toast';
import { getAllQuizzes, deleteQuiz, publishQuiz } from '../services/quizService';

const MyQuizzes = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);

  useEffect(() => {
    fetchQuizzes();
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

  const handlePublish = async (quizId) => {
    try {
      const response = await publishQuiz(quizId);
      if (response.success) {
        toast.success('Quiz published successfully!');
        fetchQuizzes();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish quiz');
    }
    handleMenuClose();
  };

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuiz(quizId);
        toast.success('Quiz deleted successfully!');
        fetchQuizzes();
      } catch (error) {
        toast.error('Failed to delete quiz');
      }
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
      active: 'primary',
      completed: 'info'
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
                <Typography>Loading quizzes...</Typography>
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
              <MenuItem onClick={() => navigate(`/edit-quiz/${selectedQuiz?._id}`)}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Edit
              </MenuItem>
              {selectedQuiz?.status === 'draft' && (
                <MenuItem onClick={() => handlePublish(selectedQuiz?._id)}>
                  <PublishIcon fontSize="small" sx={{ mr: 1 }} />
                  Publish
                </MenuItem>
              )}
              <MenuItem onClick={() => handleDelete(selectedQuiz?._id)} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            </Menu>

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
