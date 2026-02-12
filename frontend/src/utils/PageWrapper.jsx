/**
 * Page Wrapper Utility
 * Automatically applies responsive settings to all pages
 */
import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

export const PageWrapper = ({ children, title, maxWidth = 1400, sx, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4 }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={pageVariants.transition}
      style={{ width: '100%' }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', md: maxWidth, lg: maxWidth, xl: maxWidth },
          mx: 'auto',
          px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
          py: { xs: 1.5, sm: 2, md: 3, lg: 4 },
          ...sx,
        }}
        {...props}
      >
        {title && (
          <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                fontWeight: '700',
                color: '#16a34a',
                margin: 0,
              }}
            >
              {title}
            </motion.h1>
          </Box>
        )}
        {children}
      </Box>
    </motion.div>
  );
};

export default PageWrapper;
