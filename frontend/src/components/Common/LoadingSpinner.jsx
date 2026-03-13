import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const dotVariants = {
    animate: (i) => ({
      y: [0, -15, 0],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        delay: i * 0.15,
      },
    }),
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      animate="animate"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: fullScreen ? '100vh' : '400px',
        backgroundColor: fullScreen ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
      }}
    >
      {/* Animated Spinner */}
      <Box
        component={motion.div}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, rgba(6, 182, 212, 0.1) 100%)',
          mb: 3,
          boxShadow: '0 0 20px rgba(8, 145, 178, 0.4)',
        }}
      />

      {/* Animated Dots */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={dotVariants}
            animate="animate"
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#0891b2',
              boxShadow: '0 0 10px rgba(8, 145, 178, 0.6)',
            }}
          />
        ))}
      </Box>

      {/* Loading Text */}
      <Typography
        variant="body1"
        sx={{
          color: 'textSecondary',
          fontWeight: 500,
          textAlign: 'center',
        }}
      >
        {message}
      </Typography>

      {/* Animated Underline */}
      <motion.div
        animate={{
          scaleX: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: 80,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #0891b2, transparent)',
          marginTop: 16,
          borderRadius: 1,
          transformOrigin: 'center',
        }}
      />
    </Box>
  );
};

export default LoadingSpinner;
