/**
 * Responsive Utility Functions
 * Provides reusable responsive design patterns and breakpoint helpers
 */

// Breakpoint values (matching Material-UI defaults)
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// Common responsive spacing patterns
export const responsiveSpacing = {
  page: { xs: 1.5, sm: 2, md: 3, lg: 4 },
  section: { xs: 2, sm: 3, md: 4, lg: 5 },
  element: { xs: 1, sm: 1.5, md: 2, lg: 2.5 },
};

// Common responsive font sizes
export const responsiveFontSizes = {
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

// Common responsive grid columns
export const responsiveGridCols = {
  auto: { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  auto3: { xs: 1, sm: 2, md: 3, lg: 4, xl: 6 },
  auto2: { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  dashboard: { xs: 1, sm: 2, md: 3, lg: 4 },
};

// Common responsive padding/margin pairs
export const responsivePadding = {
  card: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
  container: { xs: 1, sm: 1.5, md: 2, lg: 3 },
  section: { xs: 2, sm: 3, md: 4, lg: 5 },
};

// Helper function to check if screen is mobile
export const getResponsiveValue = (values) => values;

// Media query helpers
export const mediaQueries = {
  mobile: '@media (max-width: 599px)',
  tablet: '@media (min-width: 600px) and (max-width: 899px)',
  desktop: '@media (min-width: 900px)',
  largeDesktop: '@media (min-width: 1200px)',
  xl: '@media (min-width: 1536px)',
};

// Common responsive sx props
export const responsiveSx = {
  fullWidth: {
    width: '100%',
  },
  container: {
    maxWidth: { xs: '100%', md: 1200, lg: 1400, xl: 1600 },
    mx: 'auto',
    px: responsiveSpacing.page,
  },
  card: {
    p: responsivePadding.card,
    borderRadius: { xs: '8px', md: '12px' },
    transition: 'all 0.3s ease-in-out',
  },
  button: {
    minHeight: { xs: '40px', md: '44px' },
    minWidth: { xs: '40px', md: '44px' },
    fontSize: { xs: '0.85rem', md: '0.95rem' },
    px: { xs: 1.5, md: 3 },
  },
  input: {
    minHeight: { xs: '40px', md: '44px' },
    fontSize: { xs: '0.85rem', md: '0.95rem' },
  },
  grid: {
    spacing: { xs: 1.5, sm: 2, md: 3 },
  },
};

// Automatic responsive typography
export const responsiveTypography = {
  h1: { fontSize: responsiveFontSizes.h1, fontWeight: 700 },
  h2: { fontSize: responsiveFontSizes.h2, fontWeight: 700 },
  h3: { fontSize: responsiveFontSizes.h3, fontWeight: 700 },
  h4: { fontSize: responsiveFontSizes.h4, fontWeight: 700 },
  h5: { fontSize: responsiveFontSizes.h5, fontWeight: 600 },
  h6: { fontSize: responsiveFontSizes.h6, fontWeight: 600 },
  body1: { fontSize: responsiveFontSizes.body1 },
  body2: { fontSize: responsiveFontSizes.body2 },
  caption: { fontSize: responsiveFontSizes.caption },
};

export default {
  breakpoints,
  responsiveSpacing,
  responsiveFontSizes,
  responsiveGridCols,
  responsivePadding,
  responsiveSx,
  responsiveTypography,
  mediaQueries,
};
