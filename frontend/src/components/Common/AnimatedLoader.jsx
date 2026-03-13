import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedLoader = ({ message = 'Loading...', fullScreen = false, size = 'medium' }) => {
  const sizes = {
    small: { spinner: 30, text: '0.875rem' },
    medium: { spinner: 50, text: '1rem' },
    large: { spinner: 80, text: '1.125rem' }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: { duration: 2, repeat: Infinity, ease: 'linear' }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  const dotVariants = {
    animate: (i) => ({
      y: [0, -10, 0],
      transition: { duration: 1.2, repeat: Infinity, delay: i * 0.15 }
    })
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: fullScreen ? '100vh' : '200px',
        width: '100%',
        gap: 2
      }}
    >
      {/* Animated Spinner */}
      <Box sx={{ position: 'relative', width: sizes[size].spinner, height: sizes[size].spinner }}>
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            border: `4px solid #e2e8f0`,
            borderTopColor: '#16a34a',
            borderRadius: '50%'
          }}
        />

        {/* Inner rotating ring (opposite direction) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: '6px',
            border: `3px solid transparent`,
            borderTopColor: '#22c55e',
            borderRightColor: '#22c55e',
            borderRadius: '50%'
          }}
        />

        {/* Pulsing center dot */}
        <motion.div
          variants={pulseVariants}
          animate="animate"
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: '#16a34a',
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 20px rgba(22, 163, 74, 0.5)'
          }}
        />
      </Box>

      {/* Loading Text with Animated Dots */}
      {message && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            sx={{
              fontSize: sizes[size].text,
              color: '#64748b',
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}
          >
            {message}
          </Typography>
          <Box sx={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                custom={i}
                variants={dotVariants}
                animate="animate"
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#16a34a',
                  borderRadius: '50%',
                  display: 'inline-block'
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AnimatedLoader;
