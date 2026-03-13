import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Container, Paper, TextField, Button, Typography, Alert, InputAdornment, IconButton, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Visibility, VisibilityOff, Lock, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import apiClient from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Get token and email from URL
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    
    if (!urlToken) {
      setError('Invalid reset link. Please request a new password reset.');
      setTokenValid(false);
    } else {
      setToken(urlToken);
      setEmail(urlEmail || '');
    }
  }, [searchParams]);

  const validatePasswords = () => {
    if (!passwords.newPassword || !passwords.confirmPassword) {
      setError('Please enter both password fields');
      return false;
    }

    if (passwords.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        email,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success('Password reset successfully! Redirecting to login...');
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
      
      // If token is invalid or expired, disable form
      if (errorMsg.includes('Invalid') || errorMsg.includes('expired')) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const passwordStrength = (() => {
    const pwd = passwords.newPassword;
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return strength;
  })();

  const strengthColor = {
    0: '#94a3b8',
    1: '#ef4444',
    2: '#f97316',
    3: '#eab308',
    4: '#84cc16',
    5: '#22c55e'
  };

  const strengthLabel = {
    0: 'Enter a password',
    1: 'Too weak',
    2: 'Weak',
    3: 'Fair',
    4: 'Good',
    5: 'Very strong'
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={10}
              sx={{
                p: 5,
                borderRadius: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                <CheckCircle sx={{ fontSize: 80, color: '#22c55e', mb: 2 }} />
              </motion.div>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#166534' }}>
                Password Reset Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your password has been updated successfully. You can now login with your new password.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting to login page...
              </Typography>
              <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />
            </Paper>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={10}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              background: '#ffffff'
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    mb: 2,
                    boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)'
                  }}
                >
                  <Lock sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </motion.div>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your new password below. The link expires in 5 minutes.
              </Typography>
            </Box>

            {/* Error/Warning Alert */}
            {!tokenValid && (
              <Alert 
                severity="error" 
                icon={<ErrorIcon />}
                sx={{ mb: 3, borderRadius: 2 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Invalid or expired reset link
                </Typography>
                <Typography variant="caption">
                  Please request a new password reset from the login page.
                </Typography>
              </Alert>
            )}

            {error && tokenValid && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPasswords.newPassword ? 'text' : 'password'}
                  value={passwords.newPassword}
                  onChange={(e) => {
                    setPasswords({ ...passwords, newPassword: e.target.value });
                    setError('');
                  }}
                  disabled={!tokenValid || loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('newPassword')}
                          edge="end"
                          disabled={!tokenValid || loading}
                        >
                          {showPasswords.newPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
                {passwords.newPassword && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Password Strength:
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: strengthColor[passwordStrength],
                          fontWeight: 600 
                        }}
                      >
                        {strengthLabel[passwordStrength]}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength * 20}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: strengthColor[passwordStrength],
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={(e) => {
                    setPasswords({ ...passwords, confirmPassword: e.target.value });
                    setError('');
                  }}
                  disabled={!tokenValid || loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                          edge="end"
                          disabled={!tokenValid || loading}
                        >
                          {showPasswords.confirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                      },
                    },
                  }}
                />
                {passwords.confirmPassword && passwords.newPassword && (
                  <Box sx={{ mt: 1 }}>
                    {passwords.confirmPassword === passwords.newPassword ? (
                      <Typography variant="caption" sx={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircle sx={{ fontSize: 16 }} />
                        Passwords match
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#ef4444' }}>
                        Passwords do not match
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              <motion.div whileHover={{ scale: tokenValid && !loading ? 1.02 : 1 }} whileTap={{ scale: tokenValid && !loading ? 0.98 : 1 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={!tokenValid || loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                      boxShadow: '0 6px 20px rgba(245, 87, 108, 0.4)',
                    },
                    '&:disabled': {
                      background: '#e2e8f0',
                      color: '#94a3b8',
                    },
                  }}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </motion.div>

              {tokenValid && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    disabled={loading}
                    sx={{
                      textTransform: 'none',
                      color: '#667eea',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.1)',
                      },
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              )}
              
              {!tokenValid && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      },
                    }}
                  >
                    Go to Login Page
                  </Button>
                </Box>
              )}
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ResetPassword;
