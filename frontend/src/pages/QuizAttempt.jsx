import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, Chip, Container, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Grid, IconButton, List, ListItem, ListItemButton, Paper, Stack, TextField, Typography, LinearProgress } from '@mui/material';
import { Flag as FlagIcon, FlagOutlined as FlagOutlinedIcon,Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { getQuizForAttempt, saveAnswer, submitQuiz } from '../services/quizAttemptService';
import { KEYS } from '../utils/keyboardNavigation';
import AnimatedLoader from '../components/Common/AnimatedLoader';
import { useAuthStore } from '../context/store';
import socket from '../socket';

// Fallback hooks if not available
const useEscapeKey = (open, callback) => {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') callback();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, callback]);
};

const useFocusTrap = (open, ref) => {
  useEffect(() => {
    if (!open || !ref.current) return;
    ref.current.focus();
  }, [open, ref]);
};

export default function QuizAttempt() {
  const params = useParams();
  const { quizId } = params;
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Check if component was loaded directly without ID
  useEffect(() => {
    if (!quizId) {
      console.error('🚨 CRITICAL: Quiz page loaded without quizId!');
      console.error('   This usually means:');
      console.error('   1. You visited /quiz directly');
      console.error('   2. navigate() was called with undefined quizId');
      console.error('   3. The URL pattern does not match');
      
      setTimeout(() => {
        toast.error('Invalid quiz ID. Please select a quiz from available quizzes.');
        navigate('/available-quizzes');
      }, 1000);
      return;
    }
  }, [quizId, navigate]);

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
  const [fullscreenPromptOpen, setFullscreenPromptOpen] = useState(false);
  
  // If no quizId, show error screen
  if (!quizId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Quiz ID</h1>
          <p className="text-gray-600 mb-6">The quiz ID is missing. Please select a quiz from the available quizzes page.</p>
          <button
            onClick={() => navigate('/available-quizzes')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Go to Available Quizzes
          </button>
        </div>
      </div>
    );
  }
  
  const timerRef = useRef(null);
  const tabBlurRef = useRef(0);
  const lastTabEventAtRef = useRef(0);
  const copyPasteRef = useRef(0);
  const autoSubmitTriggeredRef = useRef(false);
  const containerRef = useRef(null);
  const dialogRef = useRef(null);

  const MAX_TAB_SWITCHES = 3;
  const MAX_COPY_PASTE_ALERTS = 3;

  const proctoringEnabled = quiz?.proctoring?.enabled ?? true;
  const isFullscreenRequired = Boolean(quiz?.proctoring?.requiresFullscreen);
  const allowTabSwitching = Boolean(quiz?.proctoring?.allowTabSwitching);
  const shouldDetectTabSwitch = proctoringEnabled && !allowTabSwitching;

  const emitProctoringActivity = useCallback((activityType, details = {}) => {
    if (!submission?._id || !quizId || !user?._id) return;

    socket.emit('activity', {
      submissionId: submission._id,
      quizId,
      activityType,
      studentId: user._id,
      institutionId: user.institution || user.institutionId,
      studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Unknown Student',
      studentEmail: user.email || 'No email',
      details
    });
  }, [submission, quizId, user]);

  const registerSuspiciousActivity = (activityType, source = 'general') => {
    emitProctoringActivity('suspicious_activity', {
      activityType,
      source,
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    if (!submission?._id || !quizId || !user?._id) return;

    socket.emit('join-quiz', {
      submissionId: submission._id,
      quizId,
      studentId: user._id
    });
  }, [submission, quizId, user]);
  
  // Close submit dialog with Escape key
  useEscapeKey(openSubmitDialog, () => setOpenSubmitDialog(false));
  
  // Trap focus in dialog when open
  useFocusTrap(openSubmitDialog, dialogRef);
  
  // Keyboard navigation for questions and options
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isClipboardShortcut =
        (e.ctrlKey || e.metaKey) && ['c', 'x', 'v'].includes(e.key.toLowerCase());

      if (isClipboardShortcut && quiz && submission) {
        e.preventDefault();
        registerSuspiciousActivity('Copy/paste shortcut', 'keyboard_shortcut');

        copyPasteRef.current += 1;
        emitProctoringActivity('clipboard_shortcut_blocked', {
          key: e.key,
          count: copyPasteRef.current,
          reason: 'copy_paste_shortcut_disabled_during_quiz'
        });

        if (copyPasteRef.current <= MAX_COPY_PASTE_ALERTS) {
          toast.error(`Copy/paste is disabled (${copyPasteRef.current}/${MAX_COPY_PASTE_ALERTS})`);
        }

        return;
      }

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
  }, [currentQuestionIdx, questions, openSubmitDialog, quiz, submission, emitProctoringActivity]);

  // Load quiz
  useEffect(() => {
    const load = async () => {
      // Don't load if quizId is not available
      if (!quizId) {
        console.error('❌ Cannot load quiz: quizId is undefined');
        toast.error('Invalid quiz ID. Redirecting to available quizzes...');
        setTimeout(() => navigate('/available-quizzes'), 2000);
        return;
      }

      try {
        setLoading(true);
        console.log('🎯 Loading quiz with ID:', quizId);
        const data = await getQuizForAttempt(quizId);
        
        if (!data) {
          throw new Error('Failed to load quiz data');
        }
        
        setQuiz(data.quiz);
        setSubmission(data.submission);
        setQuestions(data.questions);
        setTimeLeft(data.quiz.duration * 60);
        
        // Load existing answers if any
        if (data.submission.answers && data.submission.answers.length > 0) {
          const answerMap = {};
          data.submission.answers.forEach(ans => {
            const questionKey = ans.questionId || ans.question;
            if (!questionKey) return;
            answerMap[questionKey] = ans.answer ?? ans.selectedOption ?? ans.selectedOptions ?? '';
            if (ans.flagged) {
              setFlagged(prev => new Set([...prev, questionKey]));
            }
          });
          setAnswers(answerMap);
        }
        
        setLoading(false);
      } catch (e) {
        console.error('Quiz load error:', e);
        const errorMessage = e?.response?.data?.message || e?.message || 'Failed to load quiz';
        toast.error(errorMessage, { duration: 4000 });
        
        // Delay navigation to let user read the error
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 2000);
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
        setFullscreenPromptOpen(false);
        if (isFullscreenRequired) {
          emitProctoringActivity('fullscreen_enter', { reason: 'mandatory_fullscreen_entered' });
        }
      }
    } catch (e) {
      toast.error('Could not enter fullscreen');
    }
  };

  const exitFullscreen = async () => {
    if (isFullscreenRequired) {
      toast.error('Fullscreen is mandatory for this quiz');
      return;
    }
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Fullscreen exit detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      const currentlyFullscreen = Boolean(document.fullscreenElement);

      if (!currentlyFullscreen && isFullscreen) {
        setIsFullscreen(false);

        if (isFullscreenRequired) {
          registerSuspiciousActivity('Fullscreen exit', 'fullscreen_change');
          toast.error('⚠️ Fullscreen exited - violation reported to faculty');
          emitProctoringActivity('fullscreen_exit', {
            reason: 'fullscreen_closed_or_escaped',
            mandatory: true
          });
          setFullscreenPromptOpen(true);
        }
      }

      if (currentlyFullscreen && !isFullscreen) {
        setIsFullscreen(true);
        if (isFullscreenRequired) {
          setFullscreenPromptOpen(false);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, isFullscreenRequired, emitProctoringActivity]);

  useEffect(() => {
    if (isFullscreenRequired && !document.fullscreenElement) {
      setFullscreenPromptOpen(true);
    } else {
      setFullscreenPromptOpen(false);
    }
  }, [isFullscreenRequired]);

  // Tab switch detection based on quiz proctoring settings
  useEffect(() => {
    if (!quiz || !submission || !shouldDetectTabSwitch) {
      return;
    }

    const registerTabSwitch = (source) => {
      const now = Date.now();
      if (now - lastTabEventAtRef.current < 800) {
        return;
      }
      lastTabEventAtRef.current = now;

      registerSuspiciousActivity('Tab switch', source);

      tabBlurRef.current += 1;
      emitProctoringActivity('tab_switch', {
        reason: source,
        count: tabBlurRef.current,
        mandatoryFullscreen: isFullscreenRequired
      });

      if (tabBlurRef.current <= MAX_TAB_SWITCHES) {
        toast.error(`Tab switch detected (${tabBlurRef.current}/${MAX_TAB_SWITCHES})`);
      }

      if (tabBlurRef.current >= MAX_TAB_SWITCHES && !autoSubmitTriggeredRef.current) {
        autoSubmitTriggeredRef.current = true;
        toast.error('3 tab switches detected. Quiz is being auto-submitted.');
        handleAutoSubmit();
      }

    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        return;
      }

      registerTabSwitch('visibility_hidden');
    };

    const handleWindowBlur = () => {
      registerTabSwitch('window_blur');
    };

    const handleTabShortcutAttempt = (e) => {
      const key = e.key?.toLowerCase();
      const isSystemSwitchAttempt =
        key === 'tab' && (e.altKey || e.ctrlKey || e.metaKey);

      if (isSystemSwitchAttempt) {
        // Browsers cannot fully block OS-level app switching, but we still record and warn.
        e.preventDefault();
        registerTabSwitch(`shortcut_${e.altKey ? 'alt' : e.ctrlKey ? 'ctrl' : 'meta'}_tab`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('keydown', handleTabShortcutAttempt, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('keydown', handleTabShortcutAttempt, true);
    };
  }, [quiz, submission, shouldDetectTabSwitch, emitProctoringActivity, isFullscreenRequired]);

  // Disable copy, paste and cut while quiz is active
  useEffect(() => {
    if (!quiz || !submission) {
      return;
    }

    const handleClipboard = (e) => {
      e.preventDefault();

      copyPasteRef.current += 1;

      emitProctoringActivity('clipboard_blocked', {
        type: e.type,
        count: copyPasteRef.current,
        reason: 'clipboard_disabled_during_quiz'
      });

      registerSuspiciousActivity('Copy/paste attempt', e.type);

      if (copyPasteRef.current <= MAX_COPY_PASTE_ALERTS) {
        toast.error(`Copy/paste is disabled (${copyPasteRef.current}/${MAX_COPY_PASTE_ALERTS})`);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      emitProctoringActivity('right_click_blocked', { reason: 'context_menu_disabled' });
      registerSuspiciousActivity('Right-click', 'context_menu');
    };

    document.addEventListener('copy', handleClipboard);
    document.addEventListener('paste', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('paste', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [quiz, submission, emitProctoringActivity]);

  // Window close/refresh attempt detection
  useEffect(() => {
    if (!quiz || !submission) {
      return;
    }

    const handleBeforeUnload = (e) => {
      registerSuspiciousActivity('Window close/refresh attempt', 'beforeunload');
      emitProctoringActivity('window_close_attempt', { reason: 'before_unload' });
      e.preventDefault();
      e.returnValue = 'Leaving will be treated as suspicious activity.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quiz, submission, emitProctoringActivity]);

  // Auto-submit on time expiry
  const handleAutoSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const answersPayload = questions
        .map((question) => ({
          questionId: question._id,
          answer: answers[question._id]
        }))
        .filter((entry) => entry.answer !== undefined && entry.answer !== null && entry.answer !== '');

      const result = await submitQuiz(quizId, answersPayload);
      const score = result?.submission?.score ?? result?.submission?.totalMarksObtained ?? result?.grading?.obtainedMarks;
      const total = result?.submission?.totalMarks ?? result?.grading?.totalMarks;
      toast.success(score != null && total ? `Quiz auto-submitted: ${score}/${total}` : 'Quiz auto-submitted');
      navigate('/student/dashboard');
    } catch (e) {
      toast.error('Auto-submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Manual submit
  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const answersPayload = questions
        .map((question) => ({
          questionId: question._id,
          answer: answers[question._id]
        }))
        .filter((entry) => entry.answer !== undefined && entry.answer !== null && entry.answer !== '');

      const result = await submitQuiz(quizId, answersPayload);
      const score = result?.submission?.score ?? result?.submission?.totalMarksObtained ?? result?.grading?.obtainedMarks;
      const total = result?.submission?.totalMarks ?? result?.grading?.totalMarks;
      toast.success(score != null && total ? `Quiz submitted successfully: ${score}/${total}` : 'Quiz submitted successfully');
      navigate('/student/dashboard');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
      setOpenSubmitDialog(false);
    }
  };

  if (loading) return (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatedLoader message="Loading quiz" size="large" />
    </Box>
  );
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

      {/* Mandatory Fullscreen Dialog */}
      <Dialog
        open={fullscreenPromptOpen}
        onClose={() => {}}
        disableEscapeKeyDown
      >
        <DialogTitle>Fullscreen Required</DialogTitle>
        <DialogContent>
          <Typography>
            This quiz requires fullscreen mode. Please enter fullscreen to continue your attempt.
          </Typography>
          <Typography sx={{ mt: 1, color: 'error.main', fontWeight: 600 }}>
            Exiting fullscreen is reported instantly to faculty monitoring.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={enterFullscreen} variant="contained" color="primary">
            Enter Fullscreen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
