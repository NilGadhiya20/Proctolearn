import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AlertCircle } from 'lucide-react';

const ErrorComponent = ({ message = 'An error occurred', onRetry }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca',
        p: 3,
      }}
    >
      <AlertCircle color="#dc2626" size={48} style={{ marginBottom: '16px' }} />
      <Typography variant="h6" sx={{ mb: 1, color: '#7f1d1d' }}>
        Error
      </Typography>
      <Typography sx={{ mb: 2, color: '#991b1b', textAlign: 'center' }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" onClick={onRetry} sx={{ backgroundColor: '#dc2626' }}>
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorComponent;
