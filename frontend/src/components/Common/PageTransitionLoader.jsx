import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

const PageTransitionLoader = ({ isVisible = true }) => {
  if (!isVisible) return null;

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const barVariants = {
    animate: {
      scaleX: [0, 1, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      {/* Top progress bar */}
      <Box
        component={motion.div}
        variants={barVariants}
        animate="animate"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: 3,
          background: 'linear-gradient(90deg, #0891b2, #06b6d4, #0891b2)',
          zIndex: 9998,
          transformOrigin: 'left',
          boxShadow: '0 0 10px rgba(8, 145, 178, 0.6)',
        }}
      />

      {/* Center animated circle */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9998,
        }}
      >
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#0891b2',
            borderRightColor: '#06b6d4',
            boxShadow: '0 0 15px rgba(8, 145, 178, 0.5)',
          }}
        />
      </Box>
    </motion.div>
  );
};

export default PageTransitionLoader;
