import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, CardContent, CardHeader, Grid, Typography, Chip, Stack, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip, Badge, Pulse, LinearProgress, Alert, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { VolumeUp as VolumeUpIcon, VolumeMute as VolumeMuteIcon, Warning as WarningIcon, Error as ErrorIcon, CheckCircle as CheckCircleIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import apiClient from '../services/api';
import useRealtimeAttempts from '../hooks/useRealtimeAttempts';

// Helper component for status indicator with pulse animation
const StatusIndicator = ({ status, label }) => {
  const statusConfig = {
    normal: { color: 'success', icon: CheckCircleIcon, bg: '#dcfce7' },
    warning: { color: 'warning', icon: WarningIcon, bg: '#fef3c7' },
    critical: { color: 'error', icon: ErrorIcon, bg: '#fee2e2' }
  };

  const config = statusConfig[status] || statusConfig.normal;
  const Icon = config.icon;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        bgcolor: config.color === 'success' ? '#22c55e' : config.color === 'warning' ? '#f59e0b' : '#ef4444',
        animation: status === 'critical' ? 'pulse 2s infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 }
        }
      }} />
      <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
    </Box>
  );
};

export default function LiveMonitoringPanel() {
  const { id: quizId } = useParams();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  const { submissions, setSubmissions, alerts, setAlerts, clearAlerts, activityFeed } = useRealtimeAttempts(quizId, !!quizId);

  // Load initial submissions
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const res = await apiClient.get(`/quizzes/${quizId}/submissions`);
        const subs = res.data?.data || [];
        
        // Calculate risk levels
        const withRisk = subs.map(sub => ({
          ...sub,
          riskLevel: sub.suspiciousActivityDetected ? (sub.suspicionScore > 60 ? 'critical' : 'warning') : 'normal',
          lastActivity: new Date(sub.updatedAt),
          activityCount: sub.activityLogs?.length || 0
        }));
        
        setSubmissions(withRisk);
      } catch (e) {
        toast.error('Failed to load submissions');
      }
    };

    if (quizId) loadSubmissions();
  }, [quizId, setSubmissions]);

  // Play sound on alerts
  useEffect(() => {
    if (alerts.length > 0 && soundEnabled) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      // Alert sound: 800Hz for 200ms
      oscillator.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  }, [alerts.length, soundEnabled]);

  // Calculate summary stats
  const normalCount = submissions.filter(s => s.riskLevel === 'normal').length;
  const warningCount = submissions.filter(s => s.riskLevel === 'warning').length;
  const criticalCount = submissions.filter(s => s.riskLevel === 'critical').length;

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Header with Sound Control */}
        <Grid item xs={12}>
          <Card sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>Live Monitoring Panel</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Real-time student activity tracking</Typography>
                </div>
                <Stack direction="row" spacing={2}>
                  <Tooltip title={soundEnabled ? 'Disable sound' : 'Enable sound'}>
                    <IconButton
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                    >
                      {soundEnabled ? <VolumeUpIcon /> : <VolumeMuteIcon />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="caption">Normal Activity</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{normalCount}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>No issues detected</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="caption">Warning</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{warningCount}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Minor violations</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="caption">Critical</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{criticalCount}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Needs immediate attention</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="caption">Total Submissions</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>{submissions.length}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Active attempts</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Main Monitoring Table */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Student Submissions"
              subheader={`${submissions.length} active submissions`}
              action={
                <Tooltip title="Refresh data">
                  <IconButton size="small"><RefreshIcon /></IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              {submissions.length === 0 ? (
                <Typography color="text.secondary">No submissions yet</Typography>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Risk Level</TableCell>
                        <TableCell>Violations</TableCell>
                        <TableCell>Last Activity</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissions.map((sub) => (
                        <TableRow
                          key={sub._id}
                          hover
                          sx={{
                            bgcolor: sub.riskLevel === 'critical' ? '#fee2e2' : sub.riskLevel === 'warning' ? '#fef3c7' : 'transparent'
                          }}
                        >
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {sub.student?.firstName} {sub.student?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {sub.student?.enrollmentNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={sub.status}
                              color={sub.status === 'submitted' ? 'success' : 'info'}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ width: 100 }}>
                              <LinearProgress
                                variant="determinate"
                                value={(sub.answers?.length || 0) / (sub.quiz?.totalQuestions || 1) * 100}
                              />
                              <Typography variant="caption">
                                {sub.answers?.length || 0}/{sub.quiz?.totalQuestions || 0}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <StatusIndicator status={sub.riskLevel} label={sub.riskLevel.toUpperCase()} />
                          </TableCell>
                          <TableCell>
                            <Badge badgeContent={sub.activityCount} color="error">
                              <Typography variant="caption">{sub.activityCount} logs</Typography>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {sub.lastActivity ? new Date(sub.lastActivity).toLocaleTimeString() : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              onClick={() => setExpandedSubmission(expandedSubmission === sub._id ? null : sub._id)}
                            >
                              {expandedSubmission === sub._id ? 'Hide' : 'Details'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts Feed */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Alert Feed"
              subheader={`${alerts.length} recent alerts`}
              action={
                <Button size="small" onClick={clearAlerts}>Clear</Button>
              }
            />
            <CardContent>
              {alerts.length === 0 ? (
                <Typography color="text.secondary">No alerts</Typography>
              ) : (
                <Stack spacing={2} sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {alerts.map((alert, idx) => (
                    <Alert
                      key={idx}
                      severity={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'}
                      onClose={() => setAlerts(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {alert.alertType || 'Activity Alert'}
                      </Typography>
                      {(alert.studentName || alert.studentEmail) && (
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
                          Student: {alert.studentName || '-'} {alert.studentEmail ? `(${alert.studentEmail})` : ''}
                        </Typography>
                      )}
                      {alert.message && (
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          {alert.message}
                        </Typography>
                      )}
                      <Typography variant="caption">
                        {alert.activity} - Risk: {alert.score}%
                      </Typography>
                    </Alert>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Activity Stream" subheader="Real-time activity log" />
            <CardContent>
              {activityFeed.length === 0 ? (
                <Typography color="text.secondary">No activity yet</Typography>
              ) : (
                <Stack spacing={1} sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {activityFeed.slice(0, 20).map((activity, idx) => (
                    <Box key={idx} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {activity.activityType || activity.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : '-'}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={activity.severity || 'info'}
                        color={activity.severity === 'critical' ? 'error' : activity.severity === 'high' ? 'warning' : 'default'}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
