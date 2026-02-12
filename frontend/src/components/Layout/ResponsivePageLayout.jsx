/**
 * Universal Page Layout Component
 * Provides guaranteed responsive layout for all pages
 * Auto-adjusts to any device, screen size, or orientation
 */

import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

export const ResponsivePageLayout = ({ 
  children, 
  title, 
  maxWidth = 'lg',
  spacing = true,
  animate = true,
  padding = true,
  fullHeight = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
  };

  // Responsive padding values
  const paddingX = {
    xs: 1.5,
    sm: 2,
    md: 3,
    lg: 4,
  };

  const paddingY = {
    xs: 2,
    sm: 2.5,
    md: 3,
    lg: 3.5,
  };

  const contentPadding = isMobile 
    ? `${paddingY.xs * 8}px ${paddingX.xs * 8}px`
    : isTablet
    ? `${paddingY.sm * 8}px ${paddingX.sm * 8}px`
    : `${paddingY.lg * 8}px ${paddingX.lg * 8}px`;

  return (
    <Box
      component={animate ? motion.div : 'div'}
      variants={animate ? containerVariants : undefined}
      initial={animate ? 'initial' : undefined}
      animate={animate ? 'animate' : undefined}
      sx={{
        width: '100%',
        height: fullHeight ? '100%' : 'auto',
        minHeight: fullHeight ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9fafb',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',

        // Mobile
        '@media (max-width: 600px)': {
          padding: `${paddingY.xs * 8}px ${paddingX.xs * 8}px`,
        },
        
        // Tablet
        '@media (min-width: 601px) and (max-width: 900px)': {
          padding: `${paddingY.sm * 8}px ${paddingX.sm * 8}px`,
        },
        
        // Desktop
        '@media (min-width: 901px)': {
          padding: `${paddingY.lg * 8}px ${paddingX.lg * 8}px`,
        },
      }}
    >
      <Container
        maxWidth={maxWidth}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          
          // Responsive max-width fallback
          '@media (max-width: 600px)': {
            maxWidth: '100% !important',
            paddingLeft: '0 !important',
            paddingRight: '0 !important',
          },
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

// Mobile-first responsive wrapper
export const MobileFirstWrapper = ({ children, minHeight = '100vh' }) => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: minHeight,
        display: 'flex',
        flexDirection: 'column',
        
        // Base mobile styles
        fontSize: '0.9rem',
        lineHeight: 1.5,
        
        // Responsive text sizing
        '@media (min-width: 600px)': {
          fontSize: '0.95rem',
          lineHeight: 1.6,
        },
        
        '@media (min-width: 900px)': {
          fontSize: '1rem',
          lineHeight: 1.6,
        },

        '@media (min-width: 1200px)': {
          fontSize: '1.05rem',
          lineHeight: 1.7,
        },
      }}
    >
      {children}
    </Box>
  );
};

// Full screen responsive wrapper
export const FullScreenResponsive = ({ children }) => {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
};

export default ResponsivePageLayout;
