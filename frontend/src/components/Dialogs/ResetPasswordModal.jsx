import React, { useState, useEffect } from 'react';
import { Dialog, Box, TextField, Button, Typography, CircularProgress, Alert, InputAdornment, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '../../services/api';

const ResetPasswordModal = ({ open, onClose, email = '' }) => {
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

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, []);

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

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        email: email || new URLSearchParams(window.location.search).get('email'),
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success('Password reset successfully! You can now login.');
        
        // Auto close after 3 seconds
        setTimeout(() => {
          handleClose();
          window.location.href = '/login';
        }, 3000);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPasswords({ newPassword: '', confirmPassword: '' });
    setShowPasswords({ newPassword: false, confirmPassword: false });
    setSuccess(false);
    setError('');
    onClose();
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          border: '2px solid #e2e8f0',
          overflow: 'visible'
        },
        component: motion.div,
        variants: dialogVariants,
        initial: 'hidden',
        animate: 'visible',
        exit: 'exit'
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
            p: { xs: 3, sm: 4 }
          }}
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: '#f1f5f9',
              border: '2px solid #e2e8f0',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.3s ease'
            }}
            className="hover:bg-red-50 hover:border-red-300"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
              </motion.div>
              <div>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {success ? 'Password Reset!' : 'Set New Password'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Secure your account
                </Typography>
              </div>
            </Box>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #d1fae5 0%, #d0f2f7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </motion.div>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                    Password Reset Successfully!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
                    Your password has been changed. You can now login with your new password.
                  </Typography>

                  <Box sx={{ 
                    p: 1.5, 
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    mb: 2
                  }}>
                    <Typography variant="caption" sx={{ color: '#166534', display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Your account is now secure. Redirecting to login...</span>
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Redirecting in 3 seconds...
                  </Typography>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Typography variant="body2" sx={{ color: '#475569', mb: 3 }}>
                  Create a strong password to secure your account. Use a mix of letters, numbers, and symbols.
                </Typography>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 2, borderRadius: 1.5 }}
                    icon={
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  {/* New Password Field */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <TextField
                      fullWidth
                      type={showPasswords.newPassword ? 'text' : 'password'}
                      label="New Password"
                      placeholder="Enter new password"
                      value={passwords.newPassword}
                      onChange={(e) => {
                        setPasswords(prev => ({ ...prev, newPassword: e.target.value }));
                        setError('');
                      }}
                      disabled={loading}
                      autoFocus
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('newPassword')}
                              edge="end"
                              disabled={loading}
                              sx={{ color: '#64748b' }}
                            >
                              {showPasswords.newPassword ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          '&:hover fieldset': {
                            borderColor: '#10b981'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#10b981',
                            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                          }
                        }
                      }}
                    />
                  </motion.div>

                  {/* Password Strength Indicator */}
                  {passwords.newPassword && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 }}
                      sx={{ mb: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, flex: 1 }}>
                          Password Strength
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: strengthColor[passwordStrength],
                            fontWeight: 700
                          }}
                        >
                          {strengthLabel[passwordStrength]}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: i * 0.05 }}
                            style={{
                              flex: 1,
                              height: 4,
                              borderRadius: '2px',
                              background: i <= passwordStrength ? strengthColor[passwordStrength] : '#e2e8f0',
                              transformOrigin: 'left'
                            }}
                          />
                        ))}
                      </Box>
                    </motion.div>
                  )}

                  {/* Confirm Password Field */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <TextField
                      fullWidth
                      type={showPasswords.confirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      placeholder="Re-enter password"
                      value={passwords.confirmPassword}
                      onChange={(e) => {
                        setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }));
                        setError('');
                      }}
                      disabled={loading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('confirmPassword')}
                              edge="end"
                              disabled={loading}
                              sx={{ color: '#64748b' }}
                            >
                              {showPasswords.confirmPassword ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        mb: 2.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          '&:hover fieldset': {
                            borderColor: '#10b981'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#10b981',
                            boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)'
                          }
                        }
                      }}
                    />
                  </motion.div>

                  {/* Match Indicator */}
                  {passwords.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.05 }}
                      sx={{
                        mb: 2.5,
                        p: 1,
                        borderRadius: '8px',
                        background: passwords.newPassword === passwords.confirmPassword 
                          ? '#f0fdf4' 
                          : '#fef2f2',
                        border: `1px solid ${passwords.newPassword === passwords.confirmPassword 
                          ? '#bbf7d0' 
                          : '#fecaca'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {passwords.newPassword === passwords.confirmPassword ? (
                        <>
                          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                            Passwords match
                          </Typography>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 600 }}>
                            Passwords do not match
                          </Typography>
                        </>
                      )}
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      disabled={loading || !passwords.newPassword || !passwords.confirmPassword || passwords.newPassword !== passwords.confirmPassword}
                      sx={{
                        background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                        color: 'white',
                        py: 1.5,
                        borderRadius: '12px',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669 0%, #0a828c 100%)',
                          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                          transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                          opacity: 0.6,
                          cursor: 'not-allowed'
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v1a1 1 0 011 1v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a1 1 0 011-1zm8-2v1H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Reset Password
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </motion.div>
    </Dialog>
  );
};

export default ResetPasswordModal;
