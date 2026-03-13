import React, { useState } from 'react';
import { Dialog, Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import apiClient from '../../services/api';

const ForgotPasswordModal = ({ open, onClose, userRole = 'student' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/forgot-password', { 
        email: email.toLowerCase()
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success('Password reset link sent to your email!');
        
        // Auto close after 3 seconds
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to send reset email. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    setError('');
    onClose();
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
              border: 'none',
              borders: '2px solid #e2e8f0',
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
                  background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(8, 145, 178, 0.3)'
                }}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </motion.div>
              <div>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {success ? 'Check Your Email' : 'Reset Password'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account
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
                      background: 'linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)'
                    }}
                  >
                    <svg className="w-10 h-10 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </motion.div>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
                    Email Sent Successfully!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                    We've sent a password reset link to:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#0891b2', 
                      fontWeight: 600, 
                      wordBreak: 'break-all',
                      mb: 2,
                      p: 1.5,
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      border: '1px solid #bae6fd'
                    }}
                  >
                    {email}
                  </Typography>

                  <Box sx={{ 
                    mb: 2, 
                    p: 1.5, 
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <Typography variant="caption" sx={{ color: '#166534', display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Check your spam folder if you don't see the email. The link expires in 1 hour.</span>
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Redirecting to login in 3 seconds...
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
                <Typography variant="body2" sx={{ color: '#475569', mb: 3, lineHeight: 1.6 }}>
                  Enter the email address associated with your {userRole} account, and we'll send you a link to reset your password.
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <TextField
                      fullWidth
                      type="email"
                      label="Email Address"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      disabled={loading}
                      autoFocus
                      sx={{
                        mb: 2.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          '&:hover fieldset': {
                            borderColor: '#0891b2'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0891b2',
                            boxShadow: '0 0 0 3px rgba(8, 145, 178, 0.1)'
                          }
                        },
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.95rem'
                        }
                      }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      disabled={loading || !email}
                      sx={{
                        background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                        color: 'white',
                        py: 1.5,
                        borderRadius: '12px',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 4px 15px rgba(8, 145, 178, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0e7490 0%, #0a828c 100%)',
                          boxShadow: '0 6px 20px rgba(8, 145, 178, 0.4)',
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
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          Send Reset Link
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          {!success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center', display: 'block', mt: 2 }}>
                Remember your password?{' '}
                <button
                  onClick={handleClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0891b2',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Back to Login
                </button>
              </Typography>
            </motion.div>
          )}
        </Box>
      </motion.div>
    </Dialog>
  );
};

export default ForgotPasswordModal;
