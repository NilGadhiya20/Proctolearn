import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { Box } from '@mui/material';

const MainLayout = ({ children }) => {
  const contentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeInOut' }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
    }}>
      <Header onMenuToggle={() => {}} />
      
      <motion.div
        initial="initial"
        animate="animate"
        variants={contentVariants}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          paddingTop: '72px', // Account for fixed header height
          minHeight: '100vh',
        }}
      >
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 1.5, sm: 2, md: 3 },
            backgroundColor: '#f9fafb',
            width: '100%',
            boxSizing: 'border-box',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </Box>
        <Footer />
      </motion.div>
    </Box>
  );
};

export default MainLayout;
