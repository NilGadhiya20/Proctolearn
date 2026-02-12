/**
 * Global Responsive Wrapper HOC
 * Automatically applies responsive styling to ALL pages
 * Ensures 100% compatibility across all devices and screen sizes
 */

import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

const withResponsive = (Component) => {
  return (props) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isLarge = useMediaQuery(theme.breakpoints.up('lg'));

    const pageVariants = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    };

    return (
      <Box
        component={motion.div}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        transition={pageVariants.transition}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          backgroundColor: '#f9fafb',
          
          // Mobile optimization
          ...(isMobile && {
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }),
          
          // Tablet optimization
          ...(isTablet && {
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }),
          
          // Desktop optimization
          ...(isLarge && {
            fontSize: '1rem',
            lineHeight: 1.6,
          }),

          // Safe area support for notched devices
          paddingTop: 'max(0px, env(safe-area-inset-top))',
          paddingLeft: 'max(0px, env(safe-area-inset-left))',
          paddingRight: 'max(0px, env(safe-area-inset-right))',
          paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
        }}
      >
        <Component {...props} isMobile={isMobile} isTablet={isTablet} isLarge={isLarge} />
      </Box>
    );
  };
};

export default withResponsive;
