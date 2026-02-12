/**
 * Universal Page Wrapper
 * Wraps all pages with responsive, device-compatible styling
 * Ensures consistency across all screen sizes and devices
 */

import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

export const UniversalPageWrapper = ({ children, sx, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeInOut' }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="page-wrapper"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageVariants.transition}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            width: '100%',
            height: '100%',
            px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
            py: { xs: 1.5, sm: 2, md: 3, lg: 4 },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            ...sx,
          }}
          {...props}
        >
          {children}
        </Container>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Responsive Grid Wrapper
 * Auto-responsive grid for page content
 */
export const ResponsivePageGrid = ({ children, spacing, columns, sx, ...props }) => {
  const theme = useTheme();

  const getGridTemplate = () => {
    if (columns === 'auto') {
      return {
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
        xl: 'repeat(4, 1fr)',
      };
    }
    if (columns === 'two') {
      return {
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
        lg: 'repeat(2, 1fr)',
      };
    }
    if (columns === 'three') {
      return {
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(3, 1fr)',
      };
    }
    return {
      xs: 'repeat(1, 1fr)',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)',
      lg: 'repeat(4, 1fr)',
    };
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: getGridTemplate(),
        gap: spacing || { xs: 1.5, sm: 2, md: 3, lg: 4 },
        width: '100%',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default {
  UniversalPageWrapper,
  ResponsivePageGrid,
};
