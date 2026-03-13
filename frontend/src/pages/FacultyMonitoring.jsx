import { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Grid, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, Collapse, Dialog, DialogTitle, DialogContent, Stack, LinearProgress, Alert } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Alert as AlertIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import apiClient from '../services/api';
import useRealtimeAttempts from '../hooks/useRealtimeAttempts';
import AnimatedLoader from '../components/Common/AnimatedLoader';

export default function FacultyMonitoring() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);

  // Use real-time hook for live submissions
  const { submissions, setSubmissions, alerts } = useRealtimeAttempts(selectedQuiz?._id, !!selectedQuiz);

  // Fetch faculty's quizzes
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const res = await apiClient.get('/quizzes');
        setQuizzes(res.data?.data || []);
      } catch (e) {
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    loadQuizzes();
  }, []);

  // Fetch submissions for selected quiz (initial load only)
  useEffect(() => {
    if (!selectedQuiz) return;

    const loadInitialSubmissions = async () => {
      try {
        const res = await apiClient.get(`/quizzes/${selectedQuiz._id}/submissions`);
        const subs = res.data?.data || [];
        
        // Calculate risk levels
        const withRisk = subs.map(sub => ({
          ...sub,
          riskLevel: sub.suspiciousActivityDetected ? (sub.suspicionScore > 60 ? 'critical' : 'warning') : 'normal',
          lastActivity: sub.updatedAt,
          activityCount: sub.activityLogs?.length || 0
        }));
        
        setSubmissions(withRisk);
      } catch (e) {
        toast.error('Failed to load submissions');
      }
    };

    loadInitialSubmissions();
  }, [selectedQuiz, setSubmissions]);

  // Fetch activity logs for a submission
  const loadActivityLogs = async (submissionId) => {
    if (logs[submissionId]) return;

    try {
      const res = await apiClient.get(`/quizzes/submission/${submissionId}/logs`);
      setLogs(prev => ({ ...prev, [submissionId]: res.data?.data || [] }));
    } catch (e) {
      console.error('Failed to load logs');
    }
  };

  const handleExpandSubmission = (submissionId) => {
    setExpandedSubmission(expandedSubmission === submissionId ? null : submissionId);
    if (expandedSubmission !== submissionId) {
      loadActivityLogs(submissionId);
    }
  };

  // Get anomalous submissions (from hook alerts or suspicious flag)
  const anomalousSubmissions = submissions.filter(s => s.suspiciousActivityDetected || s.riskLevel !== 'normal');

  if (loading) return (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatedLoader message="Loading faculty monitoring" size="large" />
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Grid container spacing={3}>
        {/* Alerts Panel */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: anomalousSubmissions.length > 0 ? 'error.light' : 'success.light' }}>
            <CardHeader
              title={`Active Alerts: ${anomalousSubmissions.length}`}
              action={
                <Chip
                  icon={<AlertIcon />}
                  label={`${anomalousSubmissions.length} Suspicious`}
                  color={anomalousSubmissions.length > 0 ? 'error' : 'success'}
                />
              }
            />
            <CardContent>
              {anomalousSubmissions.length === 0 ? (
                <Alert severity="success">All student submissions look normal!</Alert>
              ) : (
                <Stack spacing={2}>
                  {anomalousSubmissions.map((sub) => (
                    <Alert key={sub._id} severity="warning">
                      <strong>{sub.student?.firstName} {sub.student?.lastName}</strong> - Suspicious activity detected (Score: {sub.suspicionScore || 0}%)
                    </Alert>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quiz Selection */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader title="My Quizzes" />
            <CardContent>
              <Stack spacing={1} sx={{ maxHeight: 400, overflow: 'auto' }}>
                {quizzes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No quizzes created yet</Typography>
                ) : (
                  quizzes.map(quiz => (
                    <Card
                      key={quiz._id}
                      onClick={() => setSelectedQuiz(quiz)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: selectedQuiz?._id === quiz._id ? 'primary.light' : 'transparent',
                        border: selectedQuiz?._id === quiz._id ? '2px solid' : '1px solid',
                        borderColor: selectedQuiz?._id === quiz._id ? 'primary.main' : 'divider',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{quiz.title}</Typography>
                      <Chip size="small" label={`${quiz.totalQuestions || 0} Qs`} sx={{ mt: 1 }} />
                    </Card>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Submissions Monitoring */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardHeader
              title={selectedQuiz ? `Live Monitoring: ${selectedQuiz.title}` : 'Select a quiz to monitor'}
              subheader={selectedQuiz && `${submissions.length} submissions`}
            />
            <CardContent>
              {!selectedQuiz ? (
                <Typography color="text.secondary">Select a quiz from the left panel</Typography>
              ) : submissions.length === 0 ? (
                <Typography color="text.secondary">No submissions yet</Typography>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell />
                        <TableCell>Student</TableCell>
                        <TableCell>Enrollment</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Risk</TableCell>
                        <TableCell>Started</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissions.map((sub) => (
                        <>
                          <TableRow
                            key={sub._id}
                            hover
                            sx={{
                              bgcolor: sub.suspiciousActivityDetected ? 'error.light' : 'transparent',
                              cursor: 'pointer'
                            }}
                          >
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleExpandSubmission(sub._id)}
                              >
                                <ExpandMoreIcon sx={{
                                  transform: expandedSubmission === sub._id ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s'
                                }} />
                              </IconButton>
                            </TableCell>
                            <TableCell>{sub.student?.firstName} {sub.student?.lastName}</TableCell>
                            <TableCell>{sub.student?.enrollmentNumber || '-'}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={sub.status}
                                color={sub.status === 'submitted' ? 'success' : sub.status === 'in_progress' ? 'info' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ width: 100 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={(sub.answers?.length || 0) / selectedQuiz.totalQuestions * 100}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              {sub.suspiciousActivityDetected ? (
                                <Chip size="small" label="⚠️ Suspicious" color="error" />
                              ) : (
                                <Chip size="small" label="✓ Normal" color="success" />
                              )}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                              {new Date(sub.createdAt).toLocaleTimeString()}
                            </TableCell>
                          </TableRow>

                          {/* Activity Details */}
                          {expandedSubmission === sub._id && (
                            <TableRow>
                              <TableCell colSpan={7} sx={{ p: 2, bgcolor: 'action.hover' }}>
                                <Stack spacing={2}>
                                  <div>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                      Activity Timeline
                                    </Typography>
                                    {logs[sub._id]?.length === 0 ? (
                                      <Typography variant="body2" color="text.secondary">No activity logs yet</Typography>
                                    ) : (
                                      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                        <Stack spacing={0.5}>
                                          {logs[sub._id]?.slice(0, 10).map((log, idx) => (
                                            <Box key={idx} sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1, fontSize: '0.8rem' }}>
                                              <Typography variant="caption" sx={{ fontWeight: 600, color: log.severity === 'high' ? 'error.main' : 'inherit' }}>
                                                {log.activityType}
                                              </Typography>
                                              {' - '}
                                              <Typography variant="caption" color="text.secondary">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Stack>
                                      </Box>
                                    )}
                                  </div>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
