import { UI_CONFIG } from '../constants/spotify';

// Breakpoint utilities
export const breakpoints = {
  mobile: parseInt(UI_CONFIG.BREAKPOINTS.MOBILE),
  tablet: parseInt(UI_CONFIG.BREAKPOINTS.TABLET),
  desktop: parseInt(UI_CONFIG.BREAKPOINTS.DESKTOP),
};

// Media query helpers
export const mediaQueries = {
  mobile: `(max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE})`,
  tablet: `(max-width: ${UI_CONFIG.BREAKPOINTS.TABLET})`,
  desktop: `(min-width: ${UI_CONFIG.BREAKPOINTS.DESKTOP})`,
  mobileOnly: `(max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE})`,
  tabletOnly: `(min-width: ${parseInt(UI_CONFIG.BREAKPOINTS.MOBILE) + 1}px) and (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET})`,
  desktopOnly: `(min-width: ${parseInt(UI_CONFIG.BREAKPOINTS.TABLET) + 1}px)`,
};

// Device detection
export const getDeviceType = () => {
  const width = window.innerWidth;
  
  if (width <= breakpoints.mobile) {
    return 'mobile';
  } else if (width <= breakpoints.tablet) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

// Touch device detection
export const isTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

// Viewport utilities
export const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

// Responsive value calculator
export const getResponsiveValue = (mobileValue, tabletValue, desktopValue) => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return mobileValue;
    case 'tablet':
      return tabletValue || mobileValue;
    case 'desktop':
      return desktopValue || tabletValue || mobileValue;
    default:
      return mobileValue;
  }
};

// Responsive spacing
export const getResponsiveSpacing = (size = 'md') => {
  const spacing = {
    xs: getResponsiveValue('2px', '3px', '4px'),
    sm: getResponsiveValue('4px', '6px', '8px'),
    md: getResponsiveValue('8px', '12px', '16px'),
    lg: getResponsiveValue('16px', '20px', '24px'),
    xl: getResponsiveValue('24px', '28px', '32px'),
    xxl: getResponsiveValue('32px', '40px', '48px'),
  };
  
  return spacing[size] || spacing.md;
};

// Responsive font sizes
export const getResponsiveFontSize = (size = 'base') => {
  const fontSizes = {
    xs: getResponsiveValue('0.7rem', '0.75rem', '0.8rem'),
    sm: getResponsiveValue('0.8rem', '0.85rem', '0.9rem'),
    base: getResponsiveValue('0.9rem', '0.95rem', '1rem'),
    lg: getResponsiveValue('1rem', '1.1rem', '1.125rem'),
    xl: getResponsiveValue('1.125rem', '1.25rem', '1.375rem'),
    '2xl': getResponsiveValue('1.25rem', '1.5rem', '1.75rem'),
    '3xl': getResponsiveValue('1.5rem', '2rem', '2.5rem'),
    '4xl': getResponsiveValue('2rem', '2.5rem', '3rem'),
  };
  
  return fontSizes[size] || fontSizes.base;
};

// Grid utilities
export const getResponsiveGridColumns = (mobileColumns = 1, tabletColumns = 2, desktopColumns = 3) => {
  return getResponsiveValue(
    `repeat(${mobileColumns}, 1fr)`,
    `repeat(${tabletColumns}, 1fr)`,
    `repeat(${desktopColumns}, 1fr)`
  );
};

// Container max-width
export const getResponsiveContainerWidth = () => {
  return getResponsiveValue('100%', '100%', '1400px');
};

// Responsive padding
export const getResponsiveContainerPadding = () => {
  return getResponsiveValue(
    UI_CONFIG.SPACING.SM,
    UI_CONFIG.SPACING.MD,
    UI_CONFIG.SPACING.MD
  );
};

// Hook for responsive behavior (requires React import in consuming component)
export const createResponsiveHook = (React) => {
  return () => {
    const [deviceType, setDeviceType] = React.useState(getDeviceType());
    const [viewportSize, setViewportSize] = React.useState(getViewportSize());
    const [isTouchScreen, setIsTouchScreen] = React.useState(isTouchDevice());

    React.useEffect(() => {
      const handleResize = () => {
        setDeviceType(getDeviceType());
        setViewportSize(getViewportSize());
      };

      const handleTouchStart = () => {
        setIsTouchScreen(true);
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('touchstart', handleTouchStart, { once: true });

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('touchstart', handleTouchStart);
      };
    }, []);

    return {
      deviceType,
      viewportSize,
      isTouchScreen,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      isSmallScreen: deviceType === 'mobile' || deviceType === 'tablet',
    };
  };
};

// Responsive animation duration
export const getResponsiveAnimationDuration = (baseDuration = 300) => {
  const deviceType = getDeviceType();
  const isTouchScreen = isTouchDevice();
  
  // Reduce animation duration on mobile/touch devices for better performance
  if (deviceType === 'mobile' || isTouchScreen) {
    return Math.max(baseDuration * 0.7, 200);
  }
  
  return baseDuration;
};

// Responsive gesture thresholds
export const getGestureThresholds = () => {
  const deviceType = getDeviceType();
  
  return {
    swipeThreshold: deviceType === 'mobile' ? 50 : 75,
    swipeVelocity: deviceType === 'mobile' ? 0.3 : 0.5,
    tapThreshold: 10,
    longPressThreshold: 500,
  };
};

// CSS-in-JS responsive helpers
export const responsive = {
  mobile: (styles) => `
    @media ${mediaQueries.mobile} {
      ${styles}
    }
  `,
  tablet: (styles) => `
    @media ${mediaQueries.tablet} {
      ${styles}
    }
  `,
  desktop: (styles) => `
    @media ${mediaQueries.desktop} {
      ${styles}
    }
  `,
  mobileOnly: (styles) => `
    @media ${mediaQueries.mobileOnly} {
      ${styles}
    }
  `,
  tabletOnly: (styles) => `
    @media ${mediaQueries.tabletOnly} {
      ${styles}
    }
  `,
  desktopOnly: (styles) => `
    @media ${mediaQueries.desktopOnly} {
      ${styles}
    }
  `,
};

// Performance optimization for mobile
export const shouldReduceMotion = () => {
  // Check for user preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }
  
  // Reduce motion on low-end devices
  const deviceType = getDeviceType();
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (deviceType === 'mobile' && connection && connection.effectiveType === 'slow-2g') {
    return true;
  }
  
  return false;
};
