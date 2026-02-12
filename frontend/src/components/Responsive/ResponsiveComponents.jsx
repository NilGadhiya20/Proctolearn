import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

/**
 * ResponsiveContainer Component
 * Automatically handles responsive layout, spacing, and sizing
 */
export const ResponsiveContainer = ({ children, maxWidth = 1400, sx, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: maxWidth, md: maxWidth, lg: maxWidth, xl: maxWidth },
        mx: 'auto',
        px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
        py: { xs: 1.5, sm: 2, md: 3, lg: 4 },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * ResponsiveGrid Component
 * Auto-responsive grid layout based on screen size
 */
export const ResponsiveGrid = ({ children, columns, spacing, sx, ...props }) => {
  const theme = useTheme();

  const getColumns = () => {
    if (columns === 'auto') {
      return { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 };
    } else if (columns === 'auto2') {
      return { xs: 1, sm: 2, md: 2, lg: 3, xl: 3 };
    } else if (columns === 'auto3') {
      return { xs: 1, sm: 2, md: 3, lg: 4, xl: 6 };
    }
    return { xs: 1, ...columns };
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${getColumns().xs}, 1fr)`,
          sm: `repeat(${getColumns().sm}, 1fr)`,
          md: `repeat(${getColumns().md}, 1fr)`,
          lg: `repeat(${getColumns().lg}, 1fr)`,
          xl: `repeat(${getColumns().xl}, 1fr)`,
        },
        gap: spacing || { xs: 1.5, sm: 2, md: 3 },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * ResponsiveBox Component
 * Auto-responsive spacing and sizing
 */
export const ResponsiveBox = ({ children, sx, ...props }) => {
  return (
    <Box
      sx={{
        width: '100%',
        transition: 'all 0.3s ease-in-out',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * ResponsiveText Component
 * Auto-responsive font sizes
 */
export const ResponsiveText = ({ variant = 'body1', children, sx, ...props }) => {
  const fontSizes = {
    h1: { xs: '1.8rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
    h2: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
    h3: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
    h4: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' },
    h5: { xs: '1rem', sm: '1.125rem', md: '1.25rem', lg: '1.5rem' },
    h6: { xs: '0.95rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' },
    body1: { xs: '0.9rem', sm: '0.95rem', md: '1rem', lg: '1.1rem' },
    body2: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem', lg: '1rem' },
    caption: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem', lg: '0.9rem' },
  };

  return (
    <Box
      component="span"
      sx={{
        fontSize: fontSizes[variant] || fontSizes.body1,
        transition: 'font-size 0.3s ease-in-out',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * ResponsiveSection Component
 * Full-width responsive section with auto-spacing
 */
export const ResponsiveSection = ({ children, title, sx, ...props }) => {
  return (
    <Box
      sx={{
        width: '100%',
        py: { xs: 2, sm: 3, md: 4, lg: 5 },
        px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
        borderRadius: { xs: '8px', md: '12px' },
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        ...sx,
      }}
      {...props}
    >
      {title && (
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <ResponsiveText variant="h4" sx={{ fontWeight: '700', color: '#16a34a' }}>
            {title}
          </ResponsiveText>
        </Box>
      )}
      {children}
    </Box>
  );
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveBox,
  ResponsiveText,
  ResponsiveSection,
};
