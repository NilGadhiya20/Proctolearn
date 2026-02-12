import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1f2937',
        color: '#d1d5db',
        py: 3,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid #374151',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2">
        &copy; {currentYear} ProctoLearn - Proctored Quiz System. All rights reserved.
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#6b7280' }}>
        Ensuring academic integrity through advanced proctoring technology
      </Typography>
    </Box>
  );
};

export default Footer;
