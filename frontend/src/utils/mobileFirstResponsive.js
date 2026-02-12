/**
 * Mobile-First Responsive Utilities
 * Apply to ALL pages automatically
 * Ensures 100% device and screen compatibility
 */

/**
 * Responsive text sizing - Auto-adjusts on all devices
 */
export const responsiveText = {
  h1: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem', lg: '2.5rem', xl: '3rem' },
  h2: { xs: '1.3rem', sm: '1.6rem', md: '1.9rem', lg: '2.2rem', xl: '2.5rem' },
  h3: { xs: '1.1rem', sm: '1.4rem', md: '1.7rem', lg: '2rem', xl: '2.2rem' },
  h4: { xs: '1rem', sm: '1.2rem', md: '1.5rem', lg: '1.8rem', xl: '2rem' },
  h5: { xs: '0.95rem', sm: '1.1rem', md: '1.3rem', lg: '1.5rem', xl: '1.7rem' },
  h6: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.3rem', xl: '1.5rem' },
  body1: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem', lg: '1rem', xl: '1.05rem' },
  body2: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem', lg: '0.95rem', xl: '1rem' },
  caption: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem', lg: '0.85rem', xl: '0.9rem' },
};

/**
 * Responsive spacing - Auto-adjusts on all devices
 */
export const responsiveSpacing = {
  xs: { xs: '8px', sm: '10px', md: '12px', lg: '16px', xl: '20px' },
  sm: { xs: '12px', sm: '14px', md: '16px', lg: '20px', xl: '24px' },
  md: { xs: '16px', sm: '18px', md: '20px', lg: '24px', xl: '28px' },
  lg: { xs: '20px', sm: '24px', md: '28px', lg: '32px', xl: '36px' },
  xl: { xs: '24px', sm: '28px', md: '32px', lg: '40px', xl: '48px' },
  // Container spacing
  containerPadding: { xs: 1.5, sm: 2, md: 3, lg: 4, xl: 5 },
  // Grid spacing
  gridSpacing: { xs: 1, sm: 1.5, md: 2, lg: 3, xl: 4 },
  // Section margins
  sectionMargin: { xs: 2, sm: 2.5, md: 3, lg: 4, xl: 5 },
};

/**
 * Button sizing - Ensures 44px minimum touch target
 */
export const responsiveButton = {
  small: {
    px: { xs: 1.5, sm: 2, md: 2.5 },
    py: { xs: 0.75, sm: 0.85, md: 1 },
    fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
    minHeight: '40px',
  },
  medium: {
    px: { xs: 2, sm: 2.5, md: 3 },
    py: { xs: 1, sm: 1.1, md: 1.25 },
    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
    minHeight: '44px',
  },
  large: {
    px: { xs: 2.5, sm: 3, md: 4 },
    py: { xs: 1.25, sm: 1.4, md: 1.5 },
    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1.1rem' },
    minHeight: '48px',
  },
};

/**
 * Input sizing - Mobile-accessible
 */
export const responsiveInput = {
  fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
  minHeight: { xs: '44px', sm: '44px', md: '48px' },
  px: { xs: 1.5, sm: 2, md: 2.5 },
  py: { xs: 1, sm: 1.1, md: 1.25 },
};

/**
 * Card sizing - Responsive padding and borders
 */
export const responsiveCard = {
  padding: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
  borderRadius: { xs: '8px', sm: '10px', md: '12px', lg: '14px' },
  boxShadow: {
    xs: '0 1px 3px rgba(0,0,0,0.1)',
    sm: '0 2px 4px rgba(0,0,0,0.1)',
    md: '0 4px 8px rgba(0,0,0,0.1)',
    lg: '0 6px 12px rgba(0,0,0,0.1)',
  },
};

/**
 * Icon sizing - Scales with screen
 */
export const responsiveIcon = {
  small: { xs: '16px', sm: '18px', md: '20px', lg: '24px' },
  medium: { xs: '20px', sm: '22px', md: '24px', lg: '28px' },
  large: { xs: '24px', sm: '28px', md: '32px', lg: '40px' },
};

/**
 * Grid column count - Auto-adjusts
 */
export const responsiveGrid = {
  fullWidth: { xs: 12 },
  twoColumn: { xs: 12, sm: 6 },
  threeColumn: { xs: 12, sm: 6, md: 4 },
  fourColumn: { xs: 12, sm: 6, md: 4, lg: 3 },
};

/**
 * Common responsive container
 */
export const responsiveContainer = {
  width: '100%',
  maxWidth: '100%',
  px: { xs: 1.5, sm: 2, md: 3, lg: 4 },
  py: { xs: 2, sm: 2.5, md: 3, lg: 4 },
  mx: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

/**
 * Create responsive styles for any component
 */
export const createResponsiveStyles = (baseStyles, responsiveOverrides = {}) => {
  return {
    ...baseStyles,
    ...responsiveOverrides,
  };
};

/**
 * Breakpoint utilities
 */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

/**
 * Media query strings
 */
export const mediaQueries = {
  xs: '@media (max-width: 599px)',
  sm: '@media (min-width: 600px)',
  md: '@media (min-width: 900px)',
  lg: '@media (min-width: 1200px)',
  xl: '@media (min-width: 1536px)',
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  touchDevice: '@media (hover: none) and (pointer: coarse)',
};

export default {
  responsiveText,
  responsiveSpacing,
  responsiveButton,
  responsiveInput,
  responsiveCard,
  responsiveIcon,
  responsiveGrid,
  responsiveContainer,
  createResponsiveStyles,
  breakpoints,
  mediaQueries,
};
