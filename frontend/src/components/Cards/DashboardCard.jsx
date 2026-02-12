import React from 'react';
import { Card, CardContent, CardHeader, Box } from '@mui/material';

const DashboardCard = ({ title, children, action, sx = {} }) => {
  return (
    <Card
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        ...sx,
      }}
    >
      {title && (
        <CardHeader
          title={title}
          action={action}
          sx={{
            borderBottom: '1px solid #e5e7eb',
            '& .MuiTypography-root': {
              fontWeight: 'bold',
              color: '#1f2937',
            },
          }}
        />
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default DashboardCard;
