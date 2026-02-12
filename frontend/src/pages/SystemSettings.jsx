import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [settings, setSettings] = useState({
    institutionName: 'Proctolearn Institution',
    institutionCode: 'DEFAULT',
    emailNotifications: true,
    smsNotifications: false,
    autoGrading: true,
    strictProctoring: true,
    allowStudentRegistration: false,
    sessionTimeout: 30,
    maxAttempts: 3
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <ResponsivePageLayout maxWidth="lg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 2, sm: 3, md: 4 } }}>
          <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>
                  System Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                  Configure your institution's platform settings
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{ borderRadius: 2, minHeight: '44px', fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                >
                  Back
                </Button>
              </Box>
            </Box>

            {/* General Settings */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <SettingsIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>General Settings</Typography>
                </Box>
                
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Institution Name"
                      value={settings.institutionName}
                      onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiOutlinedInput-input': { fontSize: '16px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Institution Code"
                      value={settings.institutionCode}
                      onChange={(e) => setSettings({ ...settings, institutionCode: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiOutlinedInput-input': { fontSize: '16px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Session Timeout (minutes)"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiOutlinedInput-input': { fontSize: '16px' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Quiz Attempts"
                      value={settings.maxAttempts}
                      onChange={(e) => setSettings({ ...settings, maxAttempts: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiOutlinedInput-input': { fontSize: '16px' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <NotificationsIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>Notification Settings</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Email Notifications</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                          Send email notifications for quiz events
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.smsNotifications}
                        onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>SMS Notifications</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                          Send SMS notifications for important events
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <SecurityIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem', lg: '2.5rem' } }}>Security & Proctoring</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.strictProctoring}
                        onChange={(e) => setSettings({ ...settings, strictProctoring: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Strict Proctoring Mode</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                          Enable enhanced proctoring features by default
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.autoGrading}
                        onChange={(e) => setSettings({ ...settings, autoGrading: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Automatic Grading</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                          Automatically grade objective questions
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={settings.allowStudentRegistration}
                        onChange={(e) => setSettings({ ...settings, allowStudentRegistration: e.target.checked })}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>Allow Student Registration</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
                          Enable students to self-register
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  Changes to security settings will apply to all new quizzes created after saving.
                </Alert>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </motion.div>
    </ResponsivePageLayout>
  );
};

export default SystemSettings;
