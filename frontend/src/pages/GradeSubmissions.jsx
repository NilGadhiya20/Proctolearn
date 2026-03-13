import React, { useEffect, useMemo, useState } from 'react';
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
import { MainLayout } from '../components';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GradingIcon from '@mui/icons-material/Grading';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import toast from 'react-hot-toast';
import { getAllQuizzes, getQuizSubmissions } from '../services/quizService';

const GradeSubmissions = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [gradeDialog, setGradeDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        const quizResponse = await getAllQuizzes();
        const quizzes = quizResponse?.data || [];

        const allSubmissionGroups = await Promise.all(
          quizzes.map(async (quiz) => {
            try {
              const res = await getQuizSubmissions(quiz._id);
              const quizSubs = res?.data || [];
              return quizSubs.map((s) => ({
                id: s._id,
                student: `${s.student?.firstName || ''} ${s.student?.lastName || ''}`.trim() || 'Unknown Student',
                studentEmail: s.student?.email || '-',
                quiz: quiz.title,
                score: typeof s.percentage === 'number' ? Math.round(s.percentage) : null,
                totalMarks: s.totalMarks || quiz.totalMarks || 100,
                status: s.status === 'graded' ? 'graded' : (s.status === 'submitted' ? 'pending' : 'in_progress'),
                submittedAt: s.submittedAt || s.updatedAt || s.createdAt
              }));
            } catch {
              return [];
            }
          })
        );

        const merged = allSubmissionGroups
          .flat()
          .filter((s) => s.status !== 'in_progress')
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        setSubmissions(merged);
      } catch (error) {
        toast.error('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  const handleGradeSubmission = () => {
    toast.success('Grade captured in UI. Backend grade-save API can be added next.');
    setGradeDialog(false);
    setGrade('');
    setFeedback('');
  };

  const openGradeDialog = (submission) => {
    setSelectedSubmission(submission);
    setGradeDialog(true);
  };

  const pendingSubmissions = useMemo(() => submissions.filter(s => s.status === 'pending'), [submissions]);
  const gradedSubmissions = useMemo(() => submissions.filter(s => s.status === 'graded'), [submissions]);

  const stats = [
    { title: 'Total Submissions', value: submissions.length, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Pending Grading', value: pendingSubmissions.length, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: 'Graded', value: gradedSubmissions.length, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
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
                  Grade Submissions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                  Review and grade student quiz submissions
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

            {/* Submissions Table */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#1e293b', mb: 3, fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>
                  All Submissions
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Student</strong></TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Quiz</strong></TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Submitted At</strong></TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Score</strong></TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Status</strong></TableCell>
                        <TableCell align="right" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Typography color="text.secondary">Loading real submissions...</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      {submissions.map((submission) => (
                        <TableRow key={submission.id} hover>
                          <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: '#667eea' }}>
                                {submission.student[0]}
                              </Avatar>
                              <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                                {submission.student}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {submission.studentEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{submission.quiz}</TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '-'}</TableCell>
                          <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
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
                          <TableCell align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                            <Chip 
                              icon={submission.status === 'graded' ? <CheckCircleIcon /> : <PendingIcon />}
                              label={submission.status.toUpperCase()}
                              color={submission.status === 'graded' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                            <Button
                              size="small"
                              variant={submission.status === 'pending' ? 'contained' : 'outlined'}
                              startIcon={<GradingIcon />}
                              onClick={() => openGradeDialog(submission)}
                              sx={{ textTransform: 'none', minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
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
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Student</Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedSubmission?.student}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Quiz</Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{selectedSubmission?.quiz}</Typography>
                  </Box>
                  <TextField
                    fullWidth
                    type="number"
                    label={`Score (out of ${selectedSubmission?.totalMarks})`}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    inputProps={{ min: 0, max: selectedSubmission?.totalMarks }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiOutlinedInput-input': { fontSize: '16px' } }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Feedback (Optional)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiOutlinedInput-input': { fontSize: '16px' } }}
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
                    minHeight: '44px',
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                  }}
                >
                  Submit Grade
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

export default GradeSubmissions;
