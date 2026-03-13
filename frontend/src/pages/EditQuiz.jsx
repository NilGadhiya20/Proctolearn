import React, { useState, useEffect } from 'react';
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
  IconButton,
  Radio,
  RadioGroup,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../components';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuizById, updateQuiz, toggleQuizStatus } from '../services/quizService';
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
import { Plus, Trash2, Check, AlertCircle, Calendar, Clock } from 'lucide-react';
import AnimatedLoader from '../components/Common/AnimatedLoader';
import socket from '../socket';

const EditQuiz = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  const steps = ['Quiz Details', 'Settings', 'Review'];

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

  const [attemptSettings, setAttemptSettings] = useState({
    hasLimit: false,
    maxAttempts: '1'
  });

  const [proctoring, setProctoringOptions] = useState({
    enabled: true,
    requiresFullscreen: true,
    allowTabSwitching: false,
    allowMultipleWindows: false,
    webcamRequired: false,
    microphoneRequired: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);

  // Load existing quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setInitialLoading(true);
        const response = await getQuizById(quizId);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to load quiz');
        }

        const quiz = response.data;
        setQuizData(quiz);

        // Populate form with existing data
        setFormData({
          title: quiz.title || '',
          description: quiz.description || '',
          duration: quiz.duration || '',
          totalMarks: quiz.totalMarks || '',
          passingMarks: quiz.passingMarks || '',
          subject: quiz.subject || '',
          chapter: quiz.chapter || '',
          startDate: quiz.accessWindow?.startDate ? new Date(quiz.accessWindow.startDate).toISOString().slice(0, 16) : '',
          endDate: quiz.accessWindow?.endDate ? new Date(quiz.accessWindow.endDate).toISOString().slice(0, 16) : ''
        });

        setAttemptSettings({
          hasLimit: quiz.attemptSettings?.hasLimit ?? false,
          maxAttempts: quiz.attemptSettings?.maxAttempts?.toString() || '1'
        });

        setProctoringOptions(quiz.proctoring || {
          enabled: true,
          requiresFullscreen: true,
          allowTabSwitching: false,
          allowMultipleWindows: false,
          webcamRequired: false,
          microphoneRequired: false
        });

        setInitialLoading(false);
      } catch (err) {
        console.error('Load quiz error:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to load quiz');
        setTimeout(() => navigate('/my-quizzes'), 2000);
      }
    };

    if (quizId) {
      loadQuiz();
    }

    // Listen for real-time quiz updates from other users
    socket.on('quiz-updated', (data) => {
      if (data.quizId === quizId && data.updatedBy !== socket.id) {
        console.log('Quiz updated by another user:', data);
        toast.info('This quiz was updated by another user. Refreshing...');
        // Reload quiz data
        loadQuiz();
      }
    });

    socket.on('quiz-status-changed', (data) => {
      if (data.quizId === quizId) {
        console.log('Quiz status changed:', data);
        setQuizData(prev => ({ ...prev, status: data.newStatus }));
        toast.info(`Quiz status changed to ${data.newStatus}`);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('quiz-updated');
      socket.off('quiz-status-changed');
    };
  }, [quizId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttemptSettingsChange = (name, value) => {
    setAttemptSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const response = await toggleQuizStatus(quizId, newStatus);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to change quiz status');
      }

      setQuizData(prev => ({ ...prev, status: newStatus }));
      toast.success(`Quiz status changed to ${newStatus}`);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to change status';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleProctoringChange = (name) => {
    setProctoringOptions(prev => ({ ...prev, [name]: !prev[name] }));
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
        if (!formData.passingMarks || formData.passingMarks < 0) {
          toast.error('Valid passing marks is required');
          return false;
        }
        if (parseInt(formData.passingMarks) > parseInt(formData.totalMarks)) {
          toast.error('Passing marks cannot exceed total marks');
          return false;
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
    if (!validateStep(0)) return;

    setLoading(true);
    setError('');

    try {
      const updatePayload = {
        title: formData.title,
        description: formData.description,
        duration: parseInt(formData.duration),
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        subject: formData.subject,
        chapter: formData.chapter,
        attemptSettings: {
          hasLimit: attemptSettings.hasLimit,
          maxAttempts: attemptSettings.hasLimit ? parseInt(attemptSettings.maxAttempts) : null
        },
        proctoring,
        accessWindow: {}
      };

      // Only add dates if they are provided
      if (formData.startDate) {
        updatePayload.accessWindow.startDate = new Date(formData.startDate).toISOString();
      }
      if (formData.endDate) {
        updatePayload.accessWindow.endDate = new Date(formData.endDate).toISOString();
      }

      const response = await updateQuiz(quizId, updatePayload);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update quiz');
      }

      toast.success('Quiz updated successfully!');
      navigate('/my-quizzes');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update quiz';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
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
        return renderSettings();
      case 2:
        return renderReview();
      default:
        return null;
    }
  };

  const renderQuizDetails = () => (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
          Basic Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Quiz Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              required
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Total Marks"
              name="totalMarks"
              type="number"
              value={formData.totalMarks}
              onChange={handleChange}
              required
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Passing Marks"
              name="passingMarks"
              type="number"
              value={formData.passingMarks}
              onChange={handleChange}
              required
              inputProps={{ min: 0, max: formData.totalMarks }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#1e293b' }}>
                    Limit Attempts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {attemptSettings.hasLimit ? 'Students can attempt a limited number of times' : 'Students can attempt unlimited times'}
                  </Typography>
                </Box>
                <Switch
                  checked={attemptSettings.hasLimit}
                  onChange={(e) => handleAttemptSettingsChange('hasLimit', e.target.checked)}
                  sx={{ ml: 2 }}
                />
              </Box>

              {attemptSettings.hasLimit && (
                <TextField
                  fullWidth
                  label="Maximum Attempts"
                  type="number"
                  value={attemptSettings.maxAttempts}
                  onChange={(e) => handleAttemptSettingsChange('maxAttempts', e.target.value)}
                  inputProps={{ min: 1, max: 10 }}
                  helperText="Number of times students can attempt (1-10)"
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Chapter"
              name="chapter"
              value={formData.chapter}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mt: 2, mb: 2 }}>
              Access Window (Optional)
            </Typography>
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
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

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

  const renderReview = () => (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PreviewIcon sx={{ color: '#9333ea', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
              Review Changes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review your changes before updating
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
                    {quizData?.totalQuestions || 0}
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

        <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
          <strong>Note:</strong> To edit questions, please use the "Manage Questions" feature from the quiz menu after saving these changes.
        </Alert>
      </CardContent>
    </Card>
  );

  if (initialLoading) {
    return (
      <MainLayout>
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <AnimatedLoader message="Loading quiz" size="large" />
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ResponsivePageLayout>
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
                  Edit Quiz
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Update quiz details and settings
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Status Selector */}
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={quizData?.status || 'draft'}
                    label="Status"
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={loading}
                    sx={{
                      bgcolor: 'white',
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }
                    }}
                  >
                    <MenuItem value="draft">
                      <Chip label="Draft" size="small" color="default" />
                    </MenuItem>
                    <MenuItem value="published">
                      <Chip label="Published" size="small" color="info" />
                    </MenuItem>
                    <MenuItem value="active">
                      <Chip label="Active" size="small" color="success" />
                    </MenuItem>
                    <MenuItem value="closed">
                      <Chip label="Closed" size="small" color="warning" />
                    </MenuItem>
                    <MenuItem value="archived">
                      <Chip label="Archived" size="small" color="error" />
                    </MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/my-quizzes')}
                  sx={{
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    '&:hover': {
                      borderColor: '#2563eb',
                      bgcolor: '#eff6ff'
                    }
                  }}
                >
                  Back to My Quizzes
                </Button>
              </Box>
            </Box>
          </motion.div>

          {/* Stepper */}
          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stepper activeStep={activeStep} sx={{ flexWrap: 'wrap' }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(activeStep)}
          </motion.div>

          {/* Navigation Buttons */}
          <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<NavigateBeforeIcon />}
                  sx={{ minWidth: 120 }}
                >
                  Back
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      sx={{
                        minWidth: 150,
                        bgcolor: '#22c55e',
                        '&:hover': { bgcolor: '#16a34a' }
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<NavigateNextIcon />}
                      sx={{ minWidth: 120 }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </ResponsivePageLayout>
    </MainLayout>
  );
};

export default EditQuiz;
