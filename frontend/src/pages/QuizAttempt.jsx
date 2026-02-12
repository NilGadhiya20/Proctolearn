import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, Chip, Container, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Grid, IconButton, List, ListItem, ListItemButton, Paper, Stack, TextField, Typography, LinearProgress } from '@mui/material';
import { Flag as FlagIcon, FlagOutlined as FlagOutlinedIcon,Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { getQuizForAttempt, saveAnswer, submitQuiz } from '../services/quizAttemptService';
import { KEYS } from '../utils/keyboardNavigation';
import { useEscapeKey, useFocusTrap } from '../hooks/useKeyboardNavigation';

export default function QuizAttempt() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  // State
  const [quiz, setQuiz] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const timerRef = useRef(null);
  const tabBlurRef = useRef(0);
  const containerRef = useRef(null);
  const dialogRef = useRef(null);
  
  // Close submit dialog with Escape key
  useEscapeKey(openSubmitDialog, () => setOpenSubmitDialog(false));
  
  // Trap focus in dialog when open
  useFocusTrap(openSubmitDialog, dialogRef);
  
  // Keyboard navigation for questions and options
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keyboard shortcuts when in text input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Navigate between questions with arrow keys
      if (e.key === KEYS.ARROW_LEFT && currentQuestionIdx > 0) {
        e.preventDefault();
        setCurrentQuestionIdx(prev => prev - 1);
      } else if (e.key === KEYS.ARROW_RIGHT && currentQuestionIdx < questions.length - 1) {
        e.preventDefault();
        setCurrentQuestionIdx(prev => prev + 1);
      }
      
      // Select options with number keys (1-4)
      if (questions[currentQuestionIdx] && !openSubmitDialog) {
        const optionIndex = parseInt(e.key) - 1;
        const currentQuestion = questions[currentQuestionIdx];
        if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
          e.preventDefault();
          setAnswers(prev => ({ ...prev, [currentQuestion._id]: optionIndex }));
          autoSaveAnswer(currentQuestionIdx, optionIndex);
        }
      }
      
      // Toggle flag with F key
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFlag(currentQuestionIdx);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIdx, questions, openSubmitDialog]);

  // Load quiz
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getQuizForAttempt(quizId);
        setQuiz(data.quiz);
        setSubmission(data.submission);
        setQuestions(data.questions);
        setTimeLeft(data.quiz.duration * 60);
        setLoading(false);
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to load quiz');
        navigate('/student/dashboard');
      }
    };
    load();
  }, [quizId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quiz]);

  // Auto-save answer
  const autoSaveAnswer = useCallback(async (qIdx, answer) => {
    if (!submission) return;
    try {
      await saveAnswer(quizId, questions[qIdx]._id, answer, flagged.has(questions[qIdx]._id));
    } catch (e) {
      console.error('Auto-save failed:', e);
    }
  }, [quizId, questions, flagged, submission]);

  // Handle answer change
  const handleAnswerChange = (e) => {
    const { value } = e.target;
    const qIdx = currentQuestionIdx;
    const q = questions[qIdx];

    setAnswers(prev => ({ ...prev, [q._id]: value }));
    autoSaveAnswer(qIdx, value);
  };

  // Toggle flag
  const toggleFlag = async (qIdx) => {
    const q = questions[qIdx];
    const newFlagged = new Set(flagged);
    
    if (newFlagged.has(q._id)) {
      newFlagged.delete(q._id);
    } else {
      newFlagged.add(q._id);
    }
    
    setFlagged(newFlagged);
    await autoSaveAnswer(qIdx, answers[q._id] || '');
  };

  // Fullscreen
  const enterFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (e) {
      toast.error('Could not enter fullscreen');
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Fullscreen exit detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
        toast.error('⚠️ Fullscreen exited - suspicious activity detected');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen]);

  // Tab blur detection
  useEffect(() => {
    const handleBlur = () => {
      tabBlurRef.current++;
      if (tabBlurRef.current > 2) {
        toast.error('⚠️ Multiple tab switches detected - please stay focused');
      }
    };

    const handleFocus = () => {
      tabBlurRef.current = 0;
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Auto-submit on time expiry
  const handleAutoSubmit = async () => {
    setSubmitting(true);
    try {
      await submitQuiz(quizId);
      toast.success('Quiz auto-submitted due to time expiry');
      navigate('/student/dashboard');
    } catch (e) {
      toast.error('Auto-submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Manual submit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitQuiz(quizId);
      toast.success('Quiz submitted successfully');
      navigate('/student/dashboard');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
      setOpenSubmitDialog(false);
    }
  };

  if (loading) return <Box sx={{ p: 3 }}><Typography>Loading quiz...</Typography></Box>;
  if (!quiz || questions.length === 0) return <Box sx={{ p: 3 }}><Typography>Quiz not found</Typography></Box>;

  const currentQuestion = questions[currentQuestionIdx];
  const answered = Object.keys(answers).length;
  const progress = (answered / questions.length) * 100;

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <Box ref={containerRef} sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 2 }}>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          {/* Header */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <div>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{quiz.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{quiz.totalQuestions} Questions</Typography>
                </div>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                  <Chip
                    label={`Time: ${formatTime(timeLeft)}`}
                    color={timeLeft < 300 ? 'error' : 'default'}
                    sx={{ fontWeight: 700, fontSize: '0.95rem' }}
                  />
                  <Chip
                    label={`Progress: ${answered}/${questions.length}`}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                  <IconButton onClick={isFullscreen ? exitFullscreen : enterFullscreen} color="primary">
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Stack>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Question {currentQuestionIdx + 1} of {questions.length}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {currentQuestion.questionText}
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Box>

              {/* MCQ Options */}
              <Stack spacing={1.5}>
                {currentQuestion.options.map((opt, idx) => (
                  <Button
                    key={idx}
                    variant={answers[currentQuestion._id] === idx ? 'contained' : 'outlined'}
                    color={answers[currentQuestion._id] === idx ? 'primary' : 'inherit'}
                    onClick={() => {
                      const newAnswer = idx;
                      setAnswers(prev => ({ ...prev, [currentQuestion._id]: newAnswer }));
                      autoSaveAnswer(currentQuestionIdx, newAnswer);
                    }}
                    sx={{
                      justifyContent: 'flex-start',
                      p: 2,
                      textAlign: 'left',
                      textTransform: 'none',
                      fontSize: '1rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body1">{opt.text}</Typography>
                    </Box>
                  </Button>
                ))}
              </Stack>

              {/* Navigation Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 4 }} justifyContent="space-between">
                <Button
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIdx === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outlined"
                  startIcon={flagged.has(currentQuestion._id) ? <FlagIcon /> : <FlagOutlinedIcon />}
                  onClick={() => toggleFlag(currentQuestionIdx)}
                  color={flagged.has(currentQuestion._id) ? 'error' : 'inherit'}
                >
                  {flagged.has(currentQuestion._id) ? 'Flagged' : 'Flag for Review'}
                </Button>
                <Button
                  onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQuestionIdx === questions.length - 1}
                >
                  Next
                </Button>
              </Stack>
            </Card>
          </Grid>

          {/* Sidebar - Question Navigator */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto', p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Questions</Typography>
              <List>
                {questions.map((q, idx) => (
                  <ListItemButton
                    key={idx}
                    selected={idx === currentQuestionIdx}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    sx={{
                      mb: 1,
                      bgcolor: idx === currentQuestionIdx ? 'primary.light' : 'transparent',
                      borderRadius: 1,
                      position: 'relative'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: answers[q._id] !== undefined ? 'success.main' : 'action.disabledBackground',
                          color: answers[q._id] !== undefined ? 'white' : 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Typography variant="caption" sx={{ flex: 1 }}>Q{idx + 1}</Typography>
                      {flagged.has(q._id) && <FlagIcon sx={{ color: 'error.main', fontSize: '1rem' }} />}
                    </Stack>
                  </ListItemButton>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => setOpenSubmitDialog(true)}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Submit Confirmation Dialog */}
      <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)}>
        <DialogTitle>Submit Quiz?</DialogTitle>
        <DialogContent>
          <Typography>
            You have answered {answered} out of {questions.length} questions.
          </Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            Are you sure you want to submit? You cannot change your answers after submission.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmitDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="success" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Confirm Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
