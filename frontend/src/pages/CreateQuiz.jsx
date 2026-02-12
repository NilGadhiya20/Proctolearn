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
  useMediaQuery
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
import { Plus, Trash2, Check } from 'lucide-react';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    { questionText: '', options: ['', '', '', ''], correctIndex: 0, marks: 1 }
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
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctIndex: 0, marks: 1 }]);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText.trim()) {
          throw new Error(`Question ${i + 1} text is required`);
        }
        const filledOpts = q.options.filter(opt => opt.trim());
        if (filledOpts.length < 2) {
          throw new Error(`Question ${i + 1} must have at least 2 options`);
        }
      }

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
      toast.success(`Quiz created with ${questions.length} questions!`);
      navigate('/my-quizzes');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create quiz';
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

  return (
    <MainLayout>
      <ResponsivePageLayout maxWidth="xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2, sm: 3, md: 4 } }}>
          <Container maxWidth="xl">
            {/* Header */}
            <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' } }}>
                  Create New Quiz
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  Configure quiz details, time window, questions, and proctoring
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ borderRadius: 2, minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
              >
                Back
              </Button>
            </Box>

            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              {/* Quiz Details */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#1e293b', mb: 3 }}>
                      Quiz Details
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                      <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Quiz Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Chapter"
                            name="chapter"
                            value={formData.chapter}
                            onChange={handleChange}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Duration (minutes)"
                            name="duration"
                            type="number"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Total Marks"
                            name="totalMarks"
                            type="number"
                            value={formData.totalMarks}
                            onChange={handleChange}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Passing Marks"
                            name="passingMarks"
                            type="number"
                            value={formData.passingMarks}
                            onChange={handleChange}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
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
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>

                {/* Questions Section */}
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                        Questions ({questions.length})
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<Plus className="h-4 w-4" />}
                        onClick={addQuestion}
                        sx={{ borderRadius: 2 }}
                      >
                        Add Question
                      </Button>
                    </Box>

                    <AnimatePresence>
                      {questions.map((q, qIdx) => (
                        <motion.div
                          key={qIdx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, border: '2px solid #e2e8f0' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="600">Question {qIdx + 1}</Typography>
                                {questions.length > 1 && (
                                  <IconButton size="small" color="error" onClick={() => removeQuestion(qIdx)}>
                                    <Trash2 className="h-4 w-4" />
                                  </IconButton>
                                )}
                              </Box>

                              <TextField
                                fullWidth
                                label="Question Text"
                                multiline
                                rows={2}
                                value={q.questionText}
                                onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
                                required
                                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />

                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Options (select correct answer)</Typography>
                              <RadioGroup value={q.correctIndex} onChange={(e) => updateQuestion(qIdx, 'correctIndex', Number(e.target.value))}>
                                {q.options.map((opt, optIdx) => (
                                  <Box key={optIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <FormControlLabel
                                      value={optIdx}
                                      control={<Radio size="small" />}
                                      label=""
                                      sx={{ m: 0 }}
                                    />
                                    <TextField
                                      fullWidth
                                      size="small"
                                      placeholder={`Option ${optIdx + 1}`}
                                      value={opt}
                                      onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                  </Box>
                                ))}
                              </RadioGroup>

                              <TextField
                                label="Marks"
                                type="number"
                                size="small"
                                value={q.marks}
                                onChange={(e) => updateQuestion(qIdx, 'marks', Number(e.target.value))}
                                sx={{ mt: 2, width: 120, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      startIcon={<AddCircleIcon />}
                      onClick={handleSubmit}
                      sx={{
                        py: { xs: 1, sm: 1.2, md: 1.5 },
                        borderRadius: 2,
                        mt: 2,
                        minHeight: '44px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                        textTransform: 'none',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                        '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' }
                      }}
                    >
                      {loading ? 'Creating Quiz...' : 'Create Quiz with Questions'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Proctoring Settings */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'sticky', top: 20 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <SecurityIcon color="primary" />
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                        Proctoring Settings
                      </Typography>
                    </Box>

                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                      Configure security rules to maintain assessment integrity
                    </Alert>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {proctoringSettings.map((setting) => (
                        <Box key={setting.key}>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            bgcolor: proctoring[setting.key] ? '#f0f9ff' : '#f8fafc',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: proctoring[setting.key] ? '#3b82f6' : '#e2e8f0',
                            transition: 'all 0.2s'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                              {React.cloneElement(setting.icon, {
                                sx: { color: proctoring[setting.key] ? '#3b82f6' : '#64748b' }
                              })}
                              <Box>
                                <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                                  {setting.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {setting.description}
                                </Typography>
                              </Box>
                            </Box>
                            <Switch
                              checked={proctoring[setting.key]}
                              onChange={() => handleProctoringChange(setting.key)}
                              color="primary"
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </motion.div>
      </ResponsivePageLayout>
    </MainLayout>
  );
};

export default CreateQuiz;
