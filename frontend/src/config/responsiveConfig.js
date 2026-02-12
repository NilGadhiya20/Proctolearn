/**
 * Responsive Design Configuration
 * Centralized configuration for all responsive behavior
 */

export const RESPONSIVE_CONFIG = {
  // Breakpoints (matching Material-UI)
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },

  // Device sizes for reference
  devices: {
    smallPhone: { min: 320, max: 374 },
    mediumPhone: { min: 375, max: 424 },
    largePhone: { min: 425, max: 599 },
    smallTablet: { min: 600, max: 749 },
    mediumTablet: { min: 750, max: 899 },
    smallDesktop: { min: 900, max: 1199 },
    mediumDesktop: { min: 1200, max: 1535 },
    largeDesktop: { min: 1536, max: Infinity },
  },

  // Touch target sizes (in pixels)
  touchTargets: {
    small: 32,
    medium: 40,
    large: 44,
    recommended: 44, // WCAG AA standard
  },

  // Spacing scale
  spacing: {
    xs: 4, // 0.25rem
    sm: 8, // 0.5rem
    md: 16, // 1rem
    lg: 24, // 1.5rem
    xl: 32, // 2rem
    '2xl': 48, // 3rem
  },

  // Responsive spacing values
  responsiveSpacing: {
    pageHorizontal: { xs: 12, sm: 16, md: 24, lg: 32 },
    pageVertical: { xs: 12, sm: 16, md: 24, lg: 32 },
    sectionGap: { xs: 16, sm: 24, md: 32, lg: 40 },
    elementGap: { xs: 8, sm: 12, md: 16, lg: 20 },
    cardPadding: { xs: 12, sm: 16, md: 20, lg: 24 },
  },

  // Font sizes
  fontSizes: {
    h1: { xs: 28, sm: 32, md: 40, lg: 48 },
    h2: { xs: 24, sm: 28, md: 32, lg: 40 },
    h3: { xs: 20, sm: 24, md: 28, lg: 32 },
    h4: { xs: 18, sm: 20, md: 24, lg: 28 },
    h5: { xs: 16, sm: 18, md: 20, lg: 24 },
    h6: { xs: 15, sm: 16, md: 18, lg: 20 },
    body1: { xs: 14, sm: 15, md: 16, lg: 18 },
    body2: { xs: 13, sm: 14, md: 15, lg: 16 },
    caption: { xs: 12, sm: 13, md: 14, lg: 15 },
    button: { xs: 13, sm: 14, md: 15, lg: 16 },
  },

  // Grid configurations
  grid: {
    columns: {
      // Auto responsive: 1, 2, 3, 4, 4
      auto: { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
      // Auto responsive: 1, 2, 2, 3, 3
      auto2: { xs: 1, sm: 2, md: 2, lg: 3, xl: 3 },
      // Auto responsive: 1, 2, 3, 4, 6
      auto3: { xs: 1, sm: 2, md: 3, lg: 4, xl: 6 },
      // Always 1 column on mobile, 2 on desktop
      twoCol: { xs: 1, md: 2 },
      // Always 1 column on mobile, 3 on desktop
      threeCol: { xs: 1, md: 3 },
      // Dashboard: 1 col mobile, 2 tablet, 3 desktop, 4 large
      dashboard: { xs: 1, sm: 2, md: 3, lg: 4 },
    },
  },

  // Animation durations
  animations: {
    fast: 150,
    base: 300,
    slow: 500,
  },

  // Transition styles
  transitions: {
    fast: 'all 150ms ease-in-out',
    base: 'all 300ms ease-in-out',
    slow: 'all 500ms ease-in-out',
  },

  // Colors
  colors: {
    primary: '#16a34a',
    primaryLight: '#22c55e',
    primaryDark: '#15803d',
    secondary: '#059669',
    background: '#f9fafb',
    surface: '#ffffff',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#0ea5e9',
    border: '#e2e8f0',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#cbd5e1',
    },
  },

  // Border radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  // Shadow
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },

  // Z-index scale
  zIndex: {
    backdrop: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },

  // Content max-widths
  maxWidths: {
    xs: '100%',
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1400,
    '2xl': 1600,
    full: '100%',
  },

  // Responsive features
  features: {
    autoSpacing: true,
    autoFontScaling: true,
    autoGridCols: true,
    autoTouchTargets: true,
    smoothTransitions: true,
    scrollBehavior: 'smooth',
  },

  // Media query helpers
  mediaQueries: {
    mobile: '(max-width: 599px)',
    tablet: '(min-width: 600px) and (max-width: 899px)',
    desktop: '(min-width: 900px)',
    largeDesktop: '(min-width: 1200px)',
    xl: '(min-width: 1536px)',
    landscape: '(orientation: landscape)',
    portrait: '(orientation: portrait)',
    touchDevice: '(hover: none)',
    notchSupport: 'env(safe-area-inset-top)',
  },

  // Accessibility
  accessibility: {
    minTouchTarget: 44,
    minTouchGap: 8,
    minContrastRatio: 4.5,
    focusOutlineWidth: 2,
    focusOutlineColor: '#16a34a',
  },
};

export default RESPONSIVE_CONFIG;
