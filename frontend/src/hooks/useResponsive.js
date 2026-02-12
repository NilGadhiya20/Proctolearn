import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Custom hook for responsive design
 * Provides boolean values for screen size checks
 */
export const useResponsive = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isXLDesktop = useMediaQuery(theme.breakpoints.up('xl'));
  
  const isSmallMobile = useMediaQuery('(max-width: 374px)');
  const isMediumMobile = useMediaQuery('(min-width: 375px) and (max-width: 424px)');
  const isLargeMobile = useMediaQuery('(min-width: 425px) and (max-width: 599px)');
  
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');

  return {
    // Standard breakpoints
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isXLDesktop,
    
    // Mobile sizes
    isSmallMobile,
    isMediumMobile,
    isLargeMobile,
    
    // Orientation
    isPortrait,
    isLandscape,
    
    // Logical helpers
    isSmallScreen: isMobile,
    isMediumScreen: isTablet && !isMobile,
    isLargeScreen: isDesktop,
    
    // Device detection helpers
    isMobileOrTablet: isMobile || (isTablet && !isDesktop),
    isDesktopOrLarger: isDesktop,
  };
};

export default useResponsive;
