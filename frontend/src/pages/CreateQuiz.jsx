import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Radio,
  RadioGroup,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '../context/store';
import { createQuiz, addQuestionsToQuiz } from '../services/quizService';
import toast from 'react-hot-toast';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import TabIcon from '@mui/icons-material/Tab';
import WebcamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import WindowIcon from '@mui/icons-material/Window';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Visibility';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { Plus, Trash2, Check, AlertCircle, Eye, Calendar, Clock } from 'lucide-react';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const steps = ['Quiz Details', 'Questions', 'Settings', 'Review'];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    subject: '',
    chapter: '',
    startDate: '',
    endDate: ''
  });

  const [proctoring, setProctoringOptions] = useState({
    enabled: true,
    requiresFullscreen: true,
    allowTabSwitching: false,
    allowMultipleWindows: false,
    webcamRequired: false,
    microphoneRequired: false
  });

  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', ''], correctIndex: 0, marks: 1 }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addQuiz } = useQuizStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProctoringChange = (name) => {
    setProctoringOptions(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', ''], correctIndex: 0, marks: 1 }]);
  };

  const removeQuestion = (idx) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== idx));
    }
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  const addOption = (qIdx) => {
    const updated = [...questions];
    if (updated[qIdx].options.length < 6) {
      updated[qIdx].options.push('');
      setQuestions(updated);
    } else {
      toast.error('Maximum 6 options allowed per question');
    }
  };

  const removeOption = (qIdx, optIdx) => {
    const updated = [...questions];
    if (updated[qIdx].options.length > 2) {
      updated[qIdx].options.splice(optIdx, 1);
      // Adjust correctIndex if needed
      if (updated[qIdx].correctIndex >= updated[qIdx].options.length) {
        updated[qIdx].correctIndex = updated[qIdx].options.length - 1;
      }
      setQuestions(updated);
    } else {
      toast.error('Minimum 2 options required per question');
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Quiz Details
        if (!formData.title.trim()) {
          toast.error('Quiz title is required');
          return false;
        }
        if (!formData.duration || formData.duration <= 0) {
          toast.error('Valid duration is required');
          return false;
        }
        if (!formData.totalMarks || formData.totalMarks <= 0) {
          toast.error('Valid total marks is required');
          return false;
        }
        if (!formData.passingMarks || formData.passingMarks <= 0) {
          toast.error('Valid passing marks is required');
          return false;
        }
        if (parseInt(formData.passingMarks) > parseInt(formData.totalMarks)) {
          toast.error('Passing marks cannot exceed total marks');
          return false;
        }
        return true;
      
      case 1: // Questions
        if (questions.length === 0) {
          toast.error('At least one question is required');
          return false;
        }
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.questionText.trim()) {
            toast.error(`Question ${i + 1} text is required`);
            return false;
          }
          const filledOpts = q.options.filter(opt => opt.trim());
          if (filledOpts.length < 2) {
            toast.error(`Question ${i + 1} must have at least 2 filled options`);
            return false;
          }
          if (!q.options[q.correctIndex]?.trim()) {
            toast.error(`Question ${i + 1} has invalid correct answer`);
            return false;
          }
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) return; // Validate questions one more time

    setLoading(true);
    setError('');

    try {
      // 1. Create Quiz
      const quizPayload = {
        title: formData.title,
        description: formData.description,
        duration: parseInt(formData.duration),
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        subject: formData.subject,
        chapter: formData.chapter,
        proctoring,
        accessWindow: {
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        }
      };

      const quizRes = await createQuiz(quizPayload);
      if (!quizRes.success) {
        throw new Error(quizRes.message || 'Failed to create quiz');
      }

      const quizId = quizRes.data._id;

      // 2. Add Questions
      const questionPayload = questions.map(q => ({
        questionText: q.questionText,
        options: q.options.filter(opt => opt.trim()),
        correctIndex: q.correctIndex,
        marks: Number(q.marks) || 1,
        questionType: 'mcq'
      }));

      const qRes = await addQuestionsToQuiz(quizId, questionPayload);
      if (!qRes.success) {
        throw new Error(qRes.message || 'Failed to add questions');
      }

      addQuiz(quizRes.data);
      toast.success(`Quiz created successfully with ${questions.length} questions!`);
      navigate('/my-quizzes');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create quiz';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalQuestionMarks = () => {
    return questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  };

  const proctoringSettings = [
    { key: 'enabled', label: 'Enable Proctoring', icon: <SecurityIcon />, description: 'Activate proctoring features' },
    { key: 'requiresFullscreen', label: 'Require Fullscreen', icon: <FullscreenIcon />, description: 'Force fullscreen mode' },
    { key: 'allowTabSwitching', label: 'Allow Tab Switching', icon: <TabIcon />, description: 'Permit switching tabs' },
    { key: 'allowMultipleWindows', label: 'Allow Multiple Windows', icon: <WindowIcon />, description: 'Permit multiple windows' },
    { key: 'webcamRequired', label: 'Require Webcam', icon: <WebcamIcon />, description: 'Mandate webcam access' },
    { key: 'microphoneRequired', label: 'Require Microphone', icon: <MicIcon />, description: 'Mandate microphone access' },
  ];

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderQuizDetails();
      case 1:
        return renderQuestions();
      case 2:
        return renderSettings();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };

  const renderSettings = () => (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SecurityIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
              Proctoring & Security Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure security rules to maintain assessment integrity
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          These settings help prevent cheating and ensure fair assessment
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {proctoringSettings.map((setting) => (
            <Box key={setting.key}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2.5,
                bgcolor: proctoring[setting.key] ? '#f0f9ff' : '#f8fafc',
                borderRadius: 2,
                border: '2px solid',
                borderColor: proctoring[setting.key] ? '#3b82f6' : '#e2e8f0',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: proctoring[setting.key] ? '#2563eb' : '#cbd5e1',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: proctoring[setting.key] ? '#dbeafe' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {React.cloneElement(setting.icon, {
                      sx: { color: proctoring[setting.key] ? '#3b82f6' : '#64748b', fontSize: 20 }
                    })}
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight="600" sx={{ color: '#1e293b', fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
                      {setting.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {setting.description}
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={proctoring[setting.key]}
                  onChange={() => handleProctoringChange(setting.key)}
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#3b82f6',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#3b82f6',
                    },
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Alert severity="warning" icon={<AlertCircle className="h-5 w-5" />} sx={{ mt: 3, borderRadius: 2 }}>
          <strong>Note:</strong> Webcam and microphone requirements may limit accessibility for some students. Use these options carefully.
        </Alert>
      </CardContent>
    </Card>
  );

  const renderReview = () => {
    const totalQuestionMarks = calculateTotalQuestionMarks();
    const marksMatch = totalQuestionMarks === parseInt(formData.totalMarks || 0);

    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PreviewIcon sx={{ color: '#9333ea', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                Review & Submit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review your quiz before creating
              </Typography>
            </Box>
          </Box>

          {/* Quiz Info Summary */}
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, border: '2px solid #e2e8f0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: '#1e293b' }}>
                {formData.title}
              </Typography>
              {formData.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {formData.description}
                </Typography>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f0f9ff', borderRadius: 2 }}>
                    <Clock className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <Typography variant="h6" fontWeight="700" color="primary">
                      {formData.duration}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Minutes</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                    <AddCircleIcon sx={{ color: '#22c55e', mb: 1 }} />
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#22c55e' }}>
                      {questions.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Questions</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fef3c7', borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#f59e0b', mb: 0.5 }}>
                      {formData.totalMarks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Total Marks</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fef2f2', borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#ef4444', mb: 0.5 }}>
                      {formData.passingMarks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Passing Marks</Typography>
                  </Box>
                </Grid>
              </Grid>

              {(formData.subject || formData.chapter) && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                  {formData.subject && (
                    <Chip label={`Subject: ${formData.subject}`} size="small" sx={{ mr: 1, mb: 1 }} />
                  )}
                  {formData.chapter && (
                    <Chip label={`Chapter: ${formData.chapter}`} size="small" variant="outlined" sx={{ mb: 1 }} />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Time Window */}
          {(formData.startDate || formData.endDate) && (
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, border: '2px solid #e2e8f0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Calendar className="h-5 w-5 text-slate-600" />
                  <Typography variant="subtitle2" fontWeight="600">Time Window</Typography>
                </Box>
                <Grid container spacing={2}>
                  {formData.startDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Start</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {new Date(formData.startDate).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                  {formData.endDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block">End</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {new Date(formData.endDate).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Questions Summary */}
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, border: '2px solid #e2e8f0' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                Questions Summary
              </Typography>
              {!marksMatch && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  Total question marks ({totalQuestionMarks}) don't match quiz total marks ({formData.totalMarks})
                </Alert>
              )}
              {questions.slice(0, 3).map((q, idx) => (
                <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                  <Typography variant="body2" fontWeight="600" gutterBottom>
                    Q{idx + 1}: {q.questionText}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {q.options.filter(o => o.trim()).map((opt, optIdx) => (
                      <Chip 
                        key={optIdx}
                        label={opt}
                        size="small"
                        color={optIdx === q.correctIndex ? "success" : "default"}
                        variant={optIdx === q.correctIndex ? "filled" : "outlined"}
                        icon={optIdx === q.correctIndex ? <Check className="h-3 w-3" /> : null}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Marks: {q.marks}
                  </Typography>
                </Box>
              ))}
              {questions.length > 3 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  ... and {questions.length - 3} more questions
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Proctoring Summary */}
          <Card variant="outlined" sx={{ borderRadius: 2, border: '2px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon sx={{ color: '#64748b', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight="600">Security Settings</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(proctoring).filter(([_, value]) => value).map(([key, _]) => {
                  const setting = proctoringSettings.find(s => s.key === key);
                  return setting ? (
                    <Chip 
                      key={key}
                      label={setting.label}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : null;
                })}
              </Box>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  };

  const renderQuestions = () => (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpOutlineIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                Questions ({questions.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add multiple choice questions with 2-6 options each
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={addQuestion}
            sx={{
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Add Question
          </Button>
        </Box>

        {calculateTotalQuestionMarks() !== parseInt(formData.totalMarks || 0) && formData.totalMarks && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            Total question marks ({calculateTotalQuestionMarks()}) should match quiz total marks ({formData.totalMarks})
          </Alert>
        )}

        <AnimatePresence>
          {questions.map((question, qIndex) => (
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                variant="outlined"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  border: '2px solid #e2e8f0',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Chip
                      label={`Question ${qIndex + 1}`}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {question.correctIndex !== null && (
                        <Chip
                          label={`Correct: ${String.fromCharCode(65 + question.correctIndex)}`}
                          size="small"
                          color="success"
                          icon={<Check className="h-3 w-5" />}
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => removeQuestion(qIndex)}
                        sx={{
                          color: '#ef4444',
                          '&:hover': { bgcolor: '#fee2e2' }
                        }}
                        disabled={questions.length === 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Question Text"
                    value={question.questionText}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].questionText = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    sx={{ mb: 3 }}
                    required
                  />

                  <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                    Options (Select the correct answer)
                  </Typography>

                  <RadioGroup
                    value={question.correctIndex !== null ? question.correctIndex.toString() : ''}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].correctIndex = parseInt(e.target.value);
                      setQuestions(newQuestions);
                    }}
                  >
                    {question.options.map((option, optIndex) => (
                      <Box
                        key={optIndex}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                          p: 2,
                          bgcolor: question.correctIndex === optIndex ? '#f0fdf4' : '#f8fafc',
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: question.correctIndex === optIndex ? '#22c55e' : '#e2e8f0',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FormControlLabel
                          value={optIndex.toString()}
                          control={<Radio />}
                          label=""
                          sx={{ m: 0, mr: 1 }}
                        />
                        <Chip
                          label={String.fromCharCode(65 + optIndex)}
                          size="small"
                          sx={{
                            mr: 2,
                            fontWeight: 700,
                            bgcolor: question.correctIndex === optIndex ? '#22c55e' : '#cbd5e1',
                            color: question.correctIndex === optIndex ? 'white' : '#475569'
                          }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          value={option}
                          onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[qIndex].options[optIndex] = e.target.value;
                            setQuestions(newQuestions);
                          }}
                          sx={{ flex: 1 }}
                          required
                        />
                        {question.options.length > 2 && (
                          <Tooltip title="Remove option">
                            <IconButton
                              size="small"
                              onClick={() => removeOption(qIndex, optIndex)}
                              sx={{
                                ml: 1,
                                color: '#ef4444',
                                '&:hover': { bgcolor: '#fee2e2' }
                              }}
                            >
                              <RemoveCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    ))}
                  </RadioGroup>

                  {question.options.length < 6 && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddCircleIcon />}
                      onClick={() => addOption(qIndex)}
                      sx={{
                        mt: 1,
                        mb: 2,
                        textTransform: 'none',
                        borderColor: '#cbd5e1',
                        color: '#64748b',
                        '&:hover': { borderColor: '#3b82f6', color: '#3b82f6', bgcolor: '#f0f9ff' }
                      }}
                    >
                      Add Option
                    </Button>
                  )}

                  <TextField
                    type="number"
                    label="Marks for this question"
                    value={question.marks}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].marks = parseInt(e.target.value) || 0;
                      setQuestions(newQuestions);
                    }}
                    sx={{ mt: 2 }}
                    size="small"
                    InputProps={{ inputProps: { min: 1 } }}
                    required
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );

  const renderQuizDetails = () => (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AddCircleIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
              Quiz Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter basic details about your quiz
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Quiz Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Mathematics - Chapter 5 Quiz"
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide additional context about this quiz..."
              multiline
              rows={3}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Mathematics"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Chapter/Topic"
              name="chapter"
              value={formData.chapter}
              onChange={handleChange}
              placeholder="e.g., Algebra, Chapter 5"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Duration (minutes) *"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              placeholder="60"
              required
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Total Marks *"
              name="totalMarks"
              type="number"
              value={formData.totalMarks}
              onChange={handleChange}
              placeholder="100"
              required
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Passing Marks *"
              name="passingMarks"
              type="number"
              value={formData.passingMarks}
              onChange={handleChange}
              placeholder="40"
              required
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
              <Calendar className="h-5 w-5 text-slate-600" />
              <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
                Time Window (Optional)
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date & Time"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText="When students can start taking the quiz"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date & Time"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText="When the quiz will no longer be accessible"
            />
          </Grid>
        </Grid>

        {formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate) && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            End date should be after start date
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <ResponsivePageLayout maxWidth="xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2, sm: 3, md: 4 } }}>
            <Container maxWidth="lg">
              {/* Header */}
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b', mb: 0.5 }}>
                    Create New Quiz
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Follow the steps to create your quiz
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{ borderRadius: 2 }}
                >
                  Back
                </Button>
              </Box>

              {/* Stepper */}
              <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Step Content */}
              <Box sx={{ mb: 4 }}>
                {renderStepContent(activeStep)}
              </Box>

              {/* Navigation Buttons */}
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      startIcon={<NavigateBeforeIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Back
                    </Button>
                    
                    <Box sx={{ flex: 1 }} />
                    
                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={<SaveIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                          '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' }
                        }}
                      >
                        {loading ? 'Creating...' : 'Create Quiz'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<NavigateNextIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          bgcolor: '#3b82f6',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': { bgcolor: '#2563eb' }
                        }}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Container>
          </Box>
        </motion.div>
      </ResponsivePageLayout>
    </MainLayout>
  );
};

export default CreateQuiz;
