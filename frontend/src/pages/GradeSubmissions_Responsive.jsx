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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradingIcon from '@mui/icons-material/Grading';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import toast from 'react-hot-toast';

const GradeSubmissions = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [gradeDialog, setGradeDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const [submissions] = useState([
    { 
      id: 1, 
      student: 'John Doe', 
      quiz: 'Mathematics Quiz 1', 
      score: 85, 
      totalMarks: 100,
      status: 'graded',
      submittedAt: '2025-12-30 10:30 AM'
    },
    { 
      id: 2, 
      student: 'Jane Smith', 
      quiz: 'Science Quiz 2', 
      score: null, 
      totalMarks: 100,
      status: 'pending',
      submittedAt: '2025-12-31 09:15 AM'
    },
    { 
      id: 3, 
      student: 'Bob Johnson', 
      quiz: 'History Quiz 1', 
      score: 92, 
      totalMarks: 100,
      status: 'graded',
      submittedAt: '2025-12-29 02:45 PM'
    }
  ]);

  const handleGradeSubmission = () => {
    toast.success('Submission graded successfully!');
    setGradeDialog(false);
    setGrade('');
    setFeedback('');
  };

  const openGradeDialog = (submission) => {
    setSelectedSubmission(submission);
    setGradeDialog(true);
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');

  const stats = [
    { title: 'Total Submissions', value: submissions.length, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Pending Grading', value: pendingSubmissions.length, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: 'Graded', value: gradedSubmissions.length, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
  ];

  return (
    <ResponsivePageLayout maxWidth="xl">
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ 
              color: '#1e293b', 
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' }
            }}>
              Grade Submissions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
              Review and grade student quiz submissions
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ borderRadius: 2, minHeight: '44px' }}
          >
            Back
          </Button>
        </Box>

        {/* Statistics */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2.5, sm: 3, md: 4 } }}>
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
                  <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}>{stat.value}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>{stat.title}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Submissions Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
              color: '#1e293b', 
              mb: 3,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
            }}>
              All Submissions
            </Typography>
            
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}><strong>Student</strong></TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}><strong>Quiz</strong></TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}><strong>Submitted At</strong></TableCell>
                    <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}><strong>Score</strong></TableCell>
                    <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}><strong>Status</strong></TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#667eea', width: 32, height: 32, fontSize: '0.85rem' }}>
                            {submission.student[0]}
                          </Avatar>
                          <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                            {submission.student}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{submission.quiz}</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{submission.submittedAt}</TableCell>
                      <TableCell align="center">
                        {submission.score !== null ? (
                          <Chip 
                            label={`${submission.score}/${submission.totalMarks}`}
                            color={submission.score >= 70 ? 'success' : submission.score >= 50 ? 'warning' : 'error'}
                            size="small"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          icon={submission.status === 'graded' ? <CheckCircleIcon /> : <PendingIcon />}
                          label={submission.status.toUpperCase()}
                          color={submission.status === 'graded' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant={submission.status === 'pending' ? 'contained' : 'outlined'}
                          startIcon={<GradingIcon />}
                          onClick={() => openGradeDialog(submission)}
                          sx={{ textTransform: 'none', fontSize: { xs: '0.7rem', sm: '0.8rem' }, minHeight: '36px' }}
                        >
                          {submission.status === 'pending' ? 'Grade' : 'Review'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Grade Dialog */}
        <Dialog open={gradeDialog} onClose={() => setGradeDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">Grade Submission</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Student</Typography>
                <Typography variant="body1" fontWeight="600">{selectedSubmission?.student}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Quiz</Typography>
                <Typography variant="body1">{selectedSubmission?.quiz}</Typography>
              </Box>
              <TextField
                fullWidth
                type="number"
                label={`Score (out of ${selectedSubmission?.totalMarks})`}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                inputProps={{ min: 0, max: selectedSubmission?.totalMarks, style: { fontSize: '16px' } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Feedback (Optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                inputProps={{ style: { fontSize: '16px' } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setGradeDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleGradeSubmission}
              disabled={!grade}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                minHeight: '44px'
              }}
            >
              Submit Grade
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ResponsivePageLayout>
  );
};

export default GradeSubmissions;
