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
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import MonitorIcon from '@mui/icons-material/Monitor';
import toast from 'react-hot-toast';
import socket from '../socket';
import { useAuthStore } from '../context/store';
import { getAllQuizzes, getQuizSubmissions } from '../services/quizService';

const MonitorSessions = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down('sm'));
  useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const quizResponse = await getAllQuizzes();
        const quizzes = quizResponse?.data || [];

        const submissionResponses = await Promise.all(
          quizzes.map(async (quiz) => {
            try {
              const res = await getQuizSubmissions(quiz._id);
              return { quiz, submissions: res?.data || [] };
            } catch {
              return { quiz, submissions: [] };
            }
          })
        );

        const inProgress = submissionResponses.flatMap(({ quiz, submissions }) =>
          submissions
            .filter((s) => s.status === 'in_progress')
            .map((s) => ({
              id: s._id,
              quizId: quiz._id,
              quiz: quiz.title,
              student: `${s.student?.firstName || ''} ${s.student?.lastName || ''}`.trim() || 'Unknown Student',
              studentEmail: s.student?.email || '-',
              flags: (s.suspiciousActivityDetected ? 1 : 0) + (s.activityLogs?.length || 0),
              progress: Math.min(100, Math.round(((s.answers?.length || 0) / Math.max(quiz.totalQuestions || 1, 1)) * 100)),
              timeLeft: '-',
              status: 'active'
            }))
        );

        setActiveSessions(inProgress);
      } catch (error) {
        toast.error('Failed to load monitor sessions');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  useEffect(() => {
    if (!user) return;

    socket.on('alert', (data) => {
      setLiveAlerts((prev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          alertType: data.alertType,
          message: data.message || `${data.activity || 'Violation'} detected`,
          studentName: data.studentName || data.studentId,
          studentEmail: data.studentEmail,
          severity: data.severity || 'high',
          timestamp: new Date().toISOString()
        },
        ...prev
      ].slice(0, 10));
    });

    return () => {
      socket.off('alert');
    };
  }, [user]);

  const stats = useMemo(() => {
    const activeCount = activeSessions.length;
    const flagged = activeSessions.reduce((sum, s) => sum + (s.flags || 0), 0);
    const avgProgress = activeCount > 0
      ? `${Math.round(activeSessions.reduce((sum, s) => sum + (s.progress || 0), 0) / activeCount)}%`
      : '0%';

    return [
      { title: 'Active Sessions', value: activeCount, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { title: 'Flagged Activities', value: flagged, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
      { title: 'Avg Progress', value: avgProgress, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
    ];
  }, [activeSessions]);

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
                  Monitor Live Sessions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                  Real-time monitoring of active quiz sessions
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

            {/* Active Sessions */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <MonitorIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>Active Sessions</Typography>
                  <Chip 
                    label={`${activeSessions.length} Live`} 
                    color="success" 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>

                <List>
                  {loading && (
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      Loading live sessions...
                    </Typography>
                  )}
                  {activeSessions.map((session, index) => (
                    <React.Fragment key={session.id}>
                      <ListItem
                        sx={{ 
                          p: 2,
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: session.flags > 0 ? '#fff3e0' : 'transparent',
                          '&:hover': { bgcolor: '#f8fafc' }
                        }}
                        secondaryAction={
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => navigate(`/monitoring/${session.quizId}`)}
                            sx={{ textTransform: 'none', minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                          >
                            Monitor
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={session.flags}
                            color="error"
                            invisible={session.flags === 0}
                          >
                            <Avatar sx={{ bgcolor: '#667eea' }}>
                              {session.student[0]}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                                {session.student}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {session.studentEmail}
                              </Typography>
                              <Chip 
                                label="LIVE" 
                                color="success" 
                                size="small"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              {session.flags > 0 && (
                                <Chip 
                                  icon={<WarningIcon />}
                                  label={`${session.flags} Flag${session.flags > 1 ? 's' : ''}`}
                                  color="warning" 
                                  size="small"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                                {session.quiz}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Chip label={`Progress: ${session.progress}%`} size="small" variant="outlined" />
                                <Chip label={`Time Left: ${session.timeLeft}`} size="small" variant="outlined" />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < activeSessions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                {activeSessions.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <MonitorIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>
                      No Active Sessions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                      Active quiz sessions will appear here
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mt: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Live Violation Alerts
                </Typography>
                {liveAlerts.length === 0 ? (
                  <Typography color="text.secondary">No violations detected yet.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {liveAlerts.map((alert) => (
                      <Alert key={alert.id} severity={alert.severity === 'critical' ? 'error' : 'warning'}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{alert.alertType}</Typography>
                        <Typography variant="body2">{alert.studentName} {alert.studentEmail ? `(${alert.studentEmail})` : ''}</Typography>
                        <Typography variant="caption">{alert.message}</Typography>
                      </Alert>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Container>
        </Box>
      </motion.div>
    </ResponsivePageLayout>
    </MainLayout>
  );
};

export default MonitorSessions;
