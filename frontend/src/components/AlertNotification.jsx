import { useEffect, useState } from 'react';
import { Box, Snackbar, Alert as MuiAlert, Slide } from '@mui/material';

function Transition(props) {
  return <Slide {...props} direction="up" />;
}

export default function AlertNotification({ alerts, open, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alerts.length > 0) {
      setVisible(true);
    }
  }, [alerts.length]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const latestAlert = alerts[0];

  return (
    <Snackbar
      open={visible && alerts.length > 0}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionComponent={Transition}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MuiAlert
        onClose={handleClose}
        severity={latestAlert?.severity === 'critical' ? 'error' : latestAlert?.severity === 'high' ? 'warning' : 'info'}
        sx={{ width: '100%', minWidth: 300 }}
      >
        <Box sx={{ fontWeight: 600, mb: 0.5 }}>
          {latestAlert?.alertType || 'Activity Alert'}
        </Box>
        <Box sx={{ fontSize: '0.9rem' }}>
          {latestAlert?.activity} - Risk Score: {latestAlert?.score}%
        </Box>
      </MuiAlert>
    </Snackbar>
  );
}
