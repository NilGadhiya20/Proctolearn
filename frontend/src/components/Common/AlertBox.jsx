import React from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const AlertBox = ({ type = 'info', title, message, onClose }) => {
  const getIcon = () => {
    const iconProps = { size: 20, style: { marginRight: '8px' } };
    switch (type) {
      case 'success':
        return <CheckCircle color="#10b981" {...iconProps} />;
      case 'error':
        return <AlertCircle color="#ef4444" {...iconProps} />;
      case 'warning':
        return <AlertCircle color="#f59e0b" {...iconProps} />;
      default:
        return <Info color="#3b82f6" {...iconProps} />;
    }
  };

  const getColor = () => {
    const colors = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return colors[type] || 'info';
  };

  return (
    <Alert
      severity={getColor()}
      onClose={onClose}
      icon={getIcon()}
      sx={{
        mb: 2,
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};

export default AlertBox;
