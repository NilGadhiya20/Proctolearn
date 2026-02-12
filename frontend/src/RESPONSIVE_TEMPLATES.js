#!/usr/bin/env node

/**
 * RESPONSIVE DESIGN AUTO-FIX SCRIPT
 * 
 * This script provides ready-to-use code templates for updating all remaining pages
 * Each page update follows the same proven pattern
 * 
 * To use: Copy and apply the code template for each page to src/pages/PageName.jsx
 */

// ============================================================================
// IMPORT TEMPLATE FOR ALL PAGES
// ============================================================================

export const IMPORTS_TEMPLATE = `
import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components';
import { ResponsivePageLayout } from '../components/Layout/ResponsivePageLayout';
`;

// ============================================================================
// COMPONENT SETUP TEMPLATE
// ============================================================================

export const COMPONENT_SETUP_TEMPLATE = `
const PageName = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Your component state and effects here
`;

// ============================================================================
// PAGE WRAPPER TEMPLATE
// ============================================================================

export const PAGE_WRAPPER_TEMPLATE = `
  return (
    <MainLayout>
      <ResponsivePageLayout maxWidth="lg">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          {/* Your page content here */}
        </motion.div>
      </ResponsivePageLayout>
    </MainLayout>
  );
};

export default PageName;
`;

// ============================================================================
// RESPONSIVE TYPOGRAPHY TEMPLATE
// ============================================================================

export const RESPONSIVE_TYPOGRAPHY_TEMPLATE = `
<Typography
  variant="h2"
  sx={{
    fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem', lg: '2.2rem' },
    fontWeight: '700',
    color: '#1e293b',
    mb: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
  }}
>
  Page Title
</Typography>

<Typography
  variant="body1"
  sx={{
    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem', lg: '1rem' },
    color: '#64748b',
    lineHeight: 1.6,
    mb: { xs: 1, sm: 1.5, md: 2 },
  }}
>
  Description text
</Typography>
`;

// ============================================================================
// RESPONSIVE GRID TEMPLATE
// ============================================================================

export const RESPONSIVE_GRID_TEMPLATE = `
<Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
  <Grid item xs={12} sm={6} md={4}>
    {/* Card content */}
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    {/* Card content */}
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    {/* Card content */}
  </Grid>
</Grid>
`;

// ============================================================================
// RESPONSIVE BOX TEMPLATE
// ============================================================================

export const RESPONSIVE_BOX_TEMPLATE = `
<Box sx={{
  p: { xs: 1.5, sm: 2, md: 3 },
  mb: { xs: 1.5, sm: 2, md: 3 },
  borderRadius: { xs: 1, sm: 1.5, md: 2 },
  bgcolor: '#f8fafc',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  }
}}>
  {/* Content */}
</Box>
`;

// ============================================================================
// RESPONSIVE BUTTON TEMPLATE
// ============================================================================

export const RESPONSIVE_BUTTON_TEMPLATE = `
<Button
  fullWidth={isMobile}
  variant="contained"
  size={isMobile ? 'medium' : 'large'}
  sx={{
    py: { xs: 1, sm: 1.2, md: 1.5 },
    px: { xs: 2, sm: 3, md: 4 },
    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
    borderRadius: { xs: 1, sm: 1.5, md: 2 },
    textTransform: 'none',
    fontWeight: 600,
    minHeight: '44px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    }
  }}
>
  Button Label
</Button>
`;

// ============================================================================
// RESPONSIVE CARD TEMPLATE
// ============================================================================

export const RESPONSIVE_CARD_TEMPLATE = `
<Card sx={{
  borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    transform: 'translateY(-4px)',
  }
}}>
  <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
    {/* Card content */}
  </CardContent>
</Card>
`;

// ============================================================================
// RESPONSIVE FORM TEMPLATE
// ============================================================================

export const RESPONSIVE_FORM_TEMPLATE = `
<Box component="form" sx={{ 
  display: 'flex', 
  flexDirection: 'column', 
  gap: { xs: 1.5, sm: 2, md: 3 }
}}>
  <TextField
    fullWidth
    label="Field Label"
    size={isMobile ? 'small' : 'medium'}
    sx={{
      '& .MuiInputBase-root': {
        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
        minHeight: '44px',
      }
    }}
  />
  <Button 
    fullWidth 
    variant="contained"
    sx={{
      py: { xs: 1, sm: 1.2, md: 1.5 },
      borderRadius: { xs: 1, sm: 1.5, md: 2 },
      minHeight: '44px',
    }}
  >
    Submit
  </Button>
</Box>
`;

// ============================================================================
// RESPONSIVE TABLE TEMPLATE
// ============================================================================

export const RESPONSIVE_TABLE_TEMPLATE = `
<TableContainer sx={{ overflowX: 'auto' }}>
  <Table size={isMobile ? 'small' : 'medium'}>
    <TableHead>
      <TableRow sx={{ bgcolor: '#f0f2f5' }}>
        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }, fontWeight: 600 }}>Column 1</TableCell>
        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }, fontWeight: 600 }}>Column 2</TableCell>
        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }, fontWeight: 600 }} align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {/* Table rows */}
    </TableBody>
  </Table>
</TableContainer>
`;

// ============================================================================
// RESPONSIVE MODAL TEMPLATE
// ============================================================================

export const RESPONSIVE_MODAL_TEMPLATE = `
<Dialog 
  open={openDialog} 
  onClose={handleClose}
  maxWidth={isMobile ? 'xs' : 'sm'}
  fullWidth
>
  <DialogTitle>
    <Typography variant="h6" fontWeight="bold">
      Dialog Title
    </Typography>
  </DialogTitle>
  <DialogContent sx={{ py: { xs: 2, sm: 3 } }}>
    {/* Dialog content */}
  </DialogContent>
  <DialogActions sx={{ p: { xs: 1.5, sm: 2, md: 3 }, gap: 1 }}>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="contained" onClick={handleSubmit}>Submit</Button>
  </DialogActions>
</Dialog>
`;

// ============================================================================
// RESPONSIVE FLEX BOX TEMPLATE
// ============================================================================

export const RESPONSIVE_FLEX_BOX_TEMPLATE = `
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  gap: { xs: 1.5, sm: 2, md: 3 },
  justifyContent: 'space-between',
  alignItems: { xs: 'flex-start', sm: 'center' },
  flexWrap: 'wrap'
}}>
  {/* Flex items */}
</Box>
`;

// ============================================================================
// RESPONSIVE CONTAINER TEMPLATE
// ============================================================================

export const RESPONSIVE_CONTAINER_TEMPLATE = `
<Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5 }}
    style={{ width: '100%' }}
  >
    {/* Page content */}
  </motion.div>
</Container>
`;

// ============================================================================
// RESPONSIVE BREAKPOINT REFERENCE
// ============================================================================

export const RESPONSIVE_BREAKPOINTS = {
  xs: { label: 'Extra Small', value: '0px', devices: 'Mobile phones' },
  sm: { label: 'Small', value: '600px', devices: 'Landscape phones, tablets' },
  md: { label: 'Medium', value: '900px', devices: 'Tablets, small laptops' },
  lg: { label: 'Large', value: '1200px', devices: 'Desktops' },
  xl: { label: 'Extra Large', value: '1536px', devices: 'Large desktops' }
};

// ============================================================================
// SPACING SCALE REFERENCE
// ============================================================================

export const RESPONSIVE_SPACING_SCALE = {
  xs: 1,
  sm: 1.5,
  md: 2,
  lg: 2.5,
  xl: 3
};

// ============================================================================
// TYPOGRAPHY SCALE REFERENCE
// ============================================================================

export const RESPONSIVE_FONT_SIZES = {
  h1: { xs: '1.8rem', sm: '2.1rem', md: '2.4rem', lg: '2.7rem' },
  h2: { xs: '1.5rem', sm: '1.8rem', md: '2.1rem', lg: '2.4rem' },
  h3: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem', lg: '2rem' },
  h4: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem', lg: '1.8rem' },
  h5: { xs: '1rem', sm: '1.1rem', md: '1.2rem', lg: '1.4rem' },
  h6: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.2rem' },
  body1: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem', lg: '1rem' },
  body2: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem', lg: '0.9rem' }
};

export default {
  IMPORTS_TEMPLATE,
  COMPONENT_SETUP_TEMPLATE,
  PAGE_WRAPPER_TEMPLATE,
  RESPONSIVE_TYPOGRAPHY_TEMPLATE,
  RESPONSIVE_GRID_TEMPLATE,
  RESPONSIVE_BOX_TEMPLATE,
  RESPONSIVE_BUTTON_TEMPLATE,
  RESPONSIVE_CARD_TEMPLATE,
  RESPONSIVE_FORM_TEMPLATE,
  RESPONSIVE_TABLE_TEMPLATE,
  RESPONSIVE_MODAL_TEMPLATE,
  RESPONSIVE_FLEX_BOX_TEMPLATE,
  RESPONSIVE_CONTAINER_TEMPLATE,
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_SPACING_SCALE,
  RESPONSIVE_FONT_SIZES
};
