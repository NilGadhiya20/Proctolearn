import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GradingIcon from '@mui/icons-material/Grading';
import toast from 'react-hot-toast';
import { getAllQuizzes, getQuizSubmissions, getSubmissionDetails, updateSubmissionGrade } from '../services/quizService';

const toNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
  return null;
};

const normalizeText = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};

const getScoreColor = (percentage) => {
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'warning';
  return 'error';
};

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
};

const extractCorrectAnswerText = (question) => {
  if (question?.correctAnswer !== undefined && question?.correctAnswer !== null && question?.correctAnswer !== '') {
    if (Array.isArray(question.correctAnswer)) return question.correctAnswer.join(', ');
    return String(question.correctAnswer);
  }

  const correctOptions = Array.isArray(question?.options)
    ? question.options.filter((option) => option?.isCorrect).map((option) => option.text)
    : [];

  if (correctOptions.length > 0) {
    return correctOptions.join(', ');
  }

  return 'Manual review';
};

const answerToText = (question, answer) => {
  if (Array.isArray(answer)) return answer.join(', ');
  if (answer === null || answer === undefined) return '';

  const numeric = toNumber(answer);
  if (numeric !== null && Array.isArray(question?.options)) {
    return question.options[numeric]?.text ?? String(answer);
  }

  return String(answer);
};

const compareAnswers = (question, providedAnswer) => {
  if (!question) return false;

  if (Array.isArray(question.options) && question.options.some((option) => option.isCorrect)) {
    const correct = question.options.filter((option) => option.isCorrect).map((option) => normalizeText(option.text)).sort();
    const provided = String(providedAnswer || '')
      .split(',')
      .map((item) => normalizeText(item))
      .filter(Boolean)
      .sort();

    if (correct.length === 0 || provided.length === 0) return false;
    return correct.length === provided.length && correct.every((item, index) => item === provided[index]);
  }

  if (question.correctAnswer !== undefined && question.correctAnswer !== null && question.correctAnswer !== '') {
    return normalizeText(answerToText(question, providedAnswer)) === normalizeText(answerToText(question, question.correctAnswer));
  }

  return false;
};

const buildEditableQuestions = (questions = []) => {
  return questions.map((question) => {
    const currentAnswer = question.studentAnswer ?? question.answer ?? question.selectedOptions ?? '';
    const answerText = Array.isArray(currentAnswer) ? currentAnswer.join(', ') : answerToText(question, currentAnswer);
    const marksAllotted = toNumber(question.marksAllotted ?? question.marks) ?? 0;
    const currentMarks = toNumber(question.marksObtained) ?? (compareAnswers(question, answerText) ? marksAllotted : 0);

    return {
      ...question,
      answerDraft: answerText,
      marksDraft: currentMarks,
      marksAllotted,
      isCorrect: compareAnswers(question, answerText)
    };
  });
};

const GradeSubmissions = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [dialogMode, setDialogMode] = useState('view');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewMeta, setReviewMeta] = useState(null);

  const loadSubmissions = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const quizResponse = await getAllQuizzes();
      const quizzes = quizResponse?.data || [];

      const groups = await Promise.all(
        quizzes.map(async (quiz) => {
          try {
            const res = await getQuizSubmissions(quiz._id);
            const quizSubs = res?.data || [];

            return quizSubs.map((submission) => {
              const totalMarks = toNumber(submission.totalMarks ?? quiz.totalMarks) ?? 0;
              const score = toNumber(submission.score ?? submission.totalMarksObtained);
              const percentage = toNumber(submission.percentage) ?? (totalMarks > 0 && score !== null ? (score / totalMarks) * 100 : 0);

              return {
                id: submission._id,
                quizId: quiz._id,
                quiz: quiz.title,
                student: `${submission.student?.firstName || ''} ${submission.student?.lastName || ''}`.trim() || 'Unknown Student',
                studentEmail: submission.student?.email || '-',
                score: score ?? 0,
                percentage: Math.round(percentage || 0),
                totalMarks,
                status: submission.status === 'graded' ? 'graded' : (submission.status === 'submitted' ? 'pending' : 'in_progress'),
                submittedAt: submission.submittedAt || submission.updatedAt || submission.createdAt,
                raw: submission
              };
            });
          } catch {
            return [];
          }
        })
      );

      const merged = groups
        .flat()
        .filter((item) => item.status !== 'in_progress')
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      setSubmissions(merged);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const loadSubmissionDetails = useCallback(async (submission) => {
    setDialogLoading(true);
    try {
      const response = await getSubmissionDetails(submission.id);
      const details = response?.data || {};
      const questions = buildEditableQuestions(details.questions || []);
      setSelectedSubmission({ ...submission, ...(details.submission || {}), quizData: details.quiz });
      setReviewQuestions(questions);
      setReviewNotes(details.submission?.reviewNotes || '');
      setReviewMeta({
        totalMarks: toNumber(details.submission?.totalMarks ?? submission.totalMarks) ?? 0,
        obtainedMarks: toNumber(details.submission?.score ?? details.submission?.totalMarksObtained ?? submission.score) ?? 0,
        percentage: toNumber(details.submission?.percentage ?? submission.percentage) ?? 0,
        grade: details.submission?.grade || '',
        isPassed: Boolean(details.submission?.isPassed)
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load submission details');
    } finally {
      setDialogLoading(false);
    }
  }, []);

  const openSubmission = async (submission, mode) => {
    setDialogMode(mode);
    setDialogOpen(true);
    await loadSubmissionDetails(submission);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedSubmission(null);
    setReviewQuestions([]);
    setReviewNotes('');
    setReviewMeta(null);
    setDialogMode('view');
  };

  const updateQuestionAnswer = (questionId, value) => {
    setReviewQuestions((prev) => prev.map((question) => {
      if (String(question._id) !== String(questionId)) return question;
      const nextMarks = compareAnswers(question, value) ? question.marksAllotted : 0;
      return {
        ...question,
        answerDraft: value,
        marksDraft: nextMarks,
        isCorrect: compareAnswers(question, value)
      };
    }));
  };

  const updateQuestionMarks = (questionId, value) => {
    const numeric = Number(value);
    setReviewQuestions((prev) => prev.map((question) => {
      if (String(question._id) !== String(questionId)) return question;
      return {
        ...question,
        marksDraft: Number.isNaN(numeric) ? 0 : Math.max(0, numeric)
      };
    }));
  };

  const previewSummary = useMemo(() => {
    const totalMarks = reviewQuestions.reduce((sum, q) => sum + (toNumber(q.marksAllotted) ?? 0), 0);
    const obtainedMarks = reviewQuestions.reduce((sum, q) => sum + (toNumber(q.marksDraft) ?? 0), 0);
    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
    return { totalMarks, obtainedMarks, percentage };
  }, [reviewQuestions]);

  const stats = useMemo(() => {
    const percentages = submissions.map((submission) => toNumber(submission.percentage) ?? 0);
    const totalSubmissions = submissions.length;
    const averageScore = totalSubmissions > 0
      ? Math.round(percentages.reduce((sum, value) => sum + value, 0) / totalSubmissions)
      : 0;
    const highestScore = percentages.length > 0 ? Math.max(...percentages) : 0;

    return [
      { title: 'Total Submissions', value: totalSubmissions, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { title: 'Average Score', value: `${averageScore}%`, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
      { title: 'Highest Score', value: `${highestScore}%`, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
    ];
  }, [submissions]);

  const pendingSubmissions = useMemo(() => submissions.filter((item) => item.status === 'pending'), [submissions]);
  const gradedSubmissions = useMemo(() => submissions.filter((item) => item.status === 'graded'), [submissions]);

  const handleSaveReview = async () => {
    if (!selectedSubmission) return;

    setSaving(true);
    try {
      const payload = {
        reviewNotes,
        answers: reviewQuestions.map((question) => ({
          questionId: question._id,
          answer: question.answerDraft,
          marksObtained: toNumber(question.marksDraft) ?? 0
        }))
      };

      const response = await updateSubmissionGrade(selectedSubmission.id, payload);
      const updated = response?.data?.submission;
      const summary = response?.data?.summary;

      setSubmissions((prev) => prev.map((item) => {
        if (item.id !== selectedSubmission.id) return item;
        const totalMarks = toNumber(updated?.totalMarks ?? summary?.totalMarks ?? item.totalMarks) ?? item.totalMarks;
        const score = toNumber(updated?.score ?? summary?.obtainedMarks ?? item.score) ?? item.score;
        const percentage = toNumber(updated?.percentage ?? summary?.percentage ?? item.percentage) ?? item.percentage;

        return {
          ...item,
          score,
          percentage: Math.round(percentage),
          totalMarks,
          status: 'graded',
          submittedAt: updated?.submittedAt || item.submittedAt,
          raw: updated || item.raw
        };
      }));

      setSelectedSubmission((prev) => prev ? { ...prev, ...(updated || {}) } : prev);
      setReviewMeta({
        totalMarks: summary?.totalMarks ?? previewSummary.totalMarks,
        obtainedMarks: summary?.obtainedMarks ?? previewSummary.obtainedMarks,
        percentage: summary?.percentage ?? previewSummary.percentage,
        grade: summary?.grade || updated?.grade || '',
        isPassed: Boolean(summary?.isPassed ?? updated?.isPassed)
      });
      toast.success('Submission updated successfully');
      if (dialogMode === 'edit') {
        setDialogMode('view');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save submission');
    } finally {
      setSaving(false);
    }
  };

  const isReviewMode = dialogMode === 'edit';

  return (
    <MainLayout>
      <ResponsivePageLayout maxWidth="xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2, sm: 3, md: 4 } }}>
            <Container maxWidth="xl">
              <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>
                    Grade Submissions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                    Review, edit, and persist student quiz results
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => loadSubmissions({ silent: true })}
                    sx={{ borderRadius: 2, minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ borderRadius: 2, minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                  >
                    Back
                  </Button>
                </Stack>
              </Box>

              <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                {stats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ borderRadius: 3, background: stat.gradient, color: 'white', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                      <CardContent>
                        <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>{stat.value}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>{stat.title}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip icon={<AssignmentTurnedInIcon />} label={`Submitted: ${pendingSubmissions.length}`} variant="outlined" />
                <Chip icon={<GradingIcon />} label={`Graded: ${gradedSubmissions.length}`} variant="outlined" />
              </Box>

              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#1e293b', mb: 3, fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem', lg: '2rem' } }}>
                    All Submissions
                  </Typography>

                  <Box sx={{ overflowX: 'auto' }}>
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <Box sx={{ minWidth: 900 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2.2fr 1.5fr 1.2fr 1.3fr 0.9fr 1.3fr', bgcolor: 'grey.100', px: 2, py: 1.5, fontWeight: 700 }}>
                          <Typography variant="subtitle2">Student</Typography>
                          <Typography variant="subtitle2">Quiz</Typography>
                          <Typography variant="subtitle2">Submitted At</Typography>
                          <Typography variant="subtitle2">Score</Typography>
                          <Typography variant="subtitle2" align="center">Status</Typography>
                          <Typography variant="subtitle2" align="right">Actions</Typography>
                        </Box>
                        {loading && (
                          <Box sx={{ p: 3 }}>
                            <Typography color="text.secondary">Loading real submissions...</Typography>
                          </Box>
                        )}
                        {!loading && submissions.length === 0 && (
                          <Box sx={{ p: 4 }}>
                            <Alert severity="info">No submissions found yet.</Alert>
                          </Box>
                        )}
                        {submissions.map((submission) => (
                          <Box key={submission.id} sx={{ display: 'grid', gridTemplateColumns: '2.2fr 1.5fr 1.2fr 1.3fr 0.9fr 1.3fr', alignItems: 'center', px: 2, py: 1.6, borderTop: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f8fafc' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ bgcolor: '#667eea', width: 38, height: 38, fontSize: '0.9rem' }}>{getInitials(submission.student)}</Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="700">{submission.student}</Typography>
                                <Typography variant="caption" color="text.secondary">{submission.studentEmail}</Typography>
                              </Box>
                            </Box>
                            <Typography variant="body2">{submission.quiz}</Typography>
                            <Typography variant="body2">{formatDateTime(submission.submittedAt)}</Typography>
                            <Box>
                              <Chip
                                label={`${submission.score}/${submission.totalMarks} • ${submission.percentage}%`}
                                color={getScoreColor(submission.percentage)}
                                size="small"
                                sx={{ fontWeight: 700 }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <Chip
                                icon={submission.status === 'graded' ? <CheckCircleIcon /> : <CancelIcon />}
                                label={submission.status === 'graded' ? 'GRADED' : 'PENDING'}
                                color={submission.status === 'graded' ? 'success' : 'warning'}
                                size="small"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                                onClick={() => openSubmission(submission, 'view')}
                                sx={{ textTransform: 'none', minHeight: '40px' }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => openSubmission(submission, 'edit')}
                                sx={{ textTransform: 'none', minHeight: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                              >
                                Edit
                              </Button>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Box>
                </CardContent>
              </Card>

              <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="lg" fullWidth fullScreen={isMobile}>
                <DialogTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">{isReviewMode ? 'Review & Edit Submission' : 'View Submission'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedSubmission?.student} • {selectedSubmission?.quiz}
                      </Typography>
                    </Box>
                    {dialogMode === 'view' ? (
                      <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setDialogMode('edit')}>Edit</Button>
                    ) : (
                      <Button startIcon={<VisibilityIcon />} variant="outlined" onClick={() => setDialogMode('view')}>View Only</Button>
                    )}
                  </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ bgcolor: '#f8fafc' }}>
                  {dialogLoading ? (
                    <Box sx={{ p: 4 }}>
                      <Typography color="text.secondary">Loading submission details...</Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2.5}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                              <Typography variant="caption" color="text.secondary">Total Marks</Typography>
                              <Typography variant="h5" fontWeight="bold">{reviewMeta?.totalMarks ?? 0}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                              <Typography variant="caption" color="text.secondary">Obtained Marks</Typography>
                              <Typography variant="h5" fontWeight="bold">{reviewMeta?.obtainedMarks ?? previewSummary.obtainedMarks}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                              <Typography variant="caption" color="text.secondary">Percentage</Typography>
                              <Typography variant="h5" fontWeight="bold">{reviewMeta?.percentage ?? previewSummary.percentage}%</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>

                      <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">Student</Typography>
                              <Typography variant="body1" fontWeight="700">{selectedSubmission?.student}</Typography>
                              <Typography variant="caption" color="text.secondary">{selectedSubmission?.studentEmail}</Typography>
                            </Box>
                            <Chip
                              label={`${reviewMeta?.grade || selectedSubmission?.grade || 'N/A'}${reviewMeta?.isPassed ? ' • Passed' : ''}`}
                              color={reviewMeta?.percentage >= 80 ? 'success' : reviewMeta?.percentage >= 60 ? 'warning' : 'error'}
                              variant="outlined"
                            />
                          </Stack>
                        </CardContent>
                      </Card>

                      {reviewQuestions.map((question, index) => (
                        <Card key={question._id} sx={{ borderRadius: 3, overflow: 'visible' }}>
                          <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                  <Typography variant="subtitle2" color="text.secondary">Question {index + 1}</Typography>
                                  {question.isCorrect ? (
                                    <Chip icon={<CheckCircleIcon />} label="Correct" color="success" size="small" />
                                  ) : (
                                    <Chip icon={<CancelIcon />} label="Incorrect" color="error" size="small" />
                                  )}
                                </Stack>
                                <Typography variant="body1" fontWeight="700" sx={{ mb: 1 }}>{question.questionText}</Typography>
                                <Typography variant="caption" color="text.secondary">Correct answer: {extractCorrectAnswerText(question)}</Typography>
                              </Box>
                              <Chip label={`${question.marksDraft ?? 0}/${question.marksAllotted ?? 0} marks`} color={getScoreColor(question.marksAllotted > 0 ? Math.round((toNumber(question.marksDraft) ?? 0) / question.marksAllotted * 100) : 0)} size="small" />
                            </Stack>

                            {Array.isArray(question.options) && question.options.length > 0 && (
                              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {question.options.map((option, optIndex) => (
                                  <Chip
                                    key={optIndex}
                                    label={option.text}
                                    variant={option.isCorrect ? 'filled' : 'outlined'}
                                    color={option.isCorrect ? 'success' : 'default'}
                                    size="small"
                                  />
                                ))}
                              </Box>
                            )}

                            <Grid container spacing={2} alignItems="stretch">
                              <Grid item xs={12} md={8}>
                                <TextField
                                  fullWidth
                                  label="Student's selected answer"
                                  value={question.answerDraft || ''}
                                  onChange={(e) => updateQuestionAnswer(question._id, e.target.value)}
                                  disabled={!isReviewMode}
                                  multiline
                                  minRows={2}
                                  helperText={isReviewMode ? 'Edit the answer text and the score will recalculate automatically.' : 'Read-only view'}
                                />
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="Marks awarded"
                                  value={question.marksDraft ?? 0}
                                  onChange={(e) => updateQuestionMarks(question._id, e.target.value)}
                                  disabled={!isReviewMode}
                                  inputProps={{ min: 0, max: question.marksAllotted ?? 0, step: 0.5 }}
                                  helperText={`Out of ${question.marksAllotted ?? 0}`}
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}

                      <Card sx={{ borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Review Notes</Typography>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            disabled={!isReviewMode}
                            placeholder="Optional notes for the student or faculty record"
                          />
                        </CardContent>
                      </Card>
                    </Stack>
                  )}
                </DialogContent>

                <DialogActions sx={{ p: 3, bgcolor: '#fff' }}>
                  <Button onClick={closeDialog}>Close</Button>
                  {isReviewMode && (
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveReview}
                      disabled={saving || dialogLoading}
                      sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '44px' }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
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
