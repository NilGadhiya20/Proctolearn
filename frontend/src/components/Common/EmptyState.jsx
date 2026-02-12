import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CheckCircle } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, message, action, actionLabel }) => {
  const IconComponent = Icon || CheckCircle;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        p: 3,
      }}
    >
      <IconComponent color="#9ca3af" size={64} style={{ marginBottom: '16px' }} />
      <Typography variant="h6" sx={{ mb: 1, color: '#1f2937', fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography sx={{ mb: 3, color: '#6b7280', textAlign: 'center', maxWidth: '400px' }}>
        {message}
      </Typography>
      {action && (
        <Button variant="contained" onClick={action} sx={{ backgroundColor: '#3b82f6' }}>
          {actionLabel || 'Get Started'}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
