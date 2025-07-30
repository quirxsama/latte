// Theme System for Latte Music

export const THEMES = {
  DARK: {
    name: 'dark',
    colors: {
      // Primary colors
      primary: '#1DB954', // Spotify Green
      primaryHover: '#1ed760',
      primaryDark: '#169c46',
      
      // Background colors
      background: '#0a0a0a', // Pure dark, no brown
      backgroundSecondary: '#1a1a1a', // Slightly lighter
      backgroundTertiary: '#2a2a2a', // Cards, modals
      
      // Surface colors
      surface: '#1e1e1e',
      surfaceHover: '#2e2e2e',
      surfaceActive: '#3e3e3e',
      
      // Text colors
      text: '#ffffff',
      textSecondary: '#b3b3b3',
      textMuted: '#6b6b6b',
      textDisabled: '#404040',
      
      // Border colors
      border: '#333333',
      borderLight: '#404040',
      borderHover: '#555555',
      
      // Status colors
      success: '#1DB954',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Accent colors
      accent: '#8b5cf6',
      accentHover: '#a78bfa',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      gradientSecondary: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      gradientAccent: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)'
    },
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.4)',
      large: '0 8px 32px rgba(0, 0, 0, 0.5)',
      glow: '0 0 20px rgba(29, 185, 84, 0.3)'
    }
  },
  
  LIGHT: {
    name: 'light',
    colors: {
      // Primary colors
      primary: '#1DB954',
      primaryHover: '#169c46',
      primaryDark: '#0f7a34',
      
      // Background colors
      background: '#ffffff',
      backgroundSecondary: '#f8f9fa',
      backgroundTertiary: '#f1f3f4',
      
      // Surface colors
      surface: '#ffffff',
      surfaceHover: '#f5f5f5',
      surfaceActive: '#e5e5e5',
      
      // Text colors
      text: '#1a1a1a',
      textSecondary: '#4a4a4a',
      textMuted: '#6b6b6b',
      textDisabled: '#9ca3af',
      
      // Border colors
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      borderHover: '#d1d5db',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Accent colors
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      gradientSecondary: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)',
      gradientAccent: 'linear-gradient(135deg, #1DB954 0%, #169c46 100%)'
    },
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
      large: '0 8px 32px rgba(0, 0, 0, 0.2)',
      glow: '0 0 20px rgba(29, 185, 84, 0.2)'
    }
  }
};

// Breakpoints (same for both themes)
export const BREAKPOINTS = {
  MOBILE: '768px',
  TABLET: '1024px',
  DESKTOP: '1200px'
};

// Spacing (same for both themes)
export const SPACING = {
  XS: '4px',
  SM: '8px',
  MD: '16px',
  LG: '24px',
  XL: '32px',
  XXL: '48px'
};

// Animation constants
export const ANIMATIONS = {
  DURATION: {
    FAST: '200ms',
    NORMAL: '300ms',
    SLOW: '500ms'
  },
  EASING: {
    EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    EASE_IN: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    EASE_IN_OUT: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

// Helper function to get current theme
export const getCurrentTheme = (isDark = true) => {
  return isDark ? THEMES.DARK : THEMES.LIGHT;
};

// Helper function to get theme colors
export const getThemeColors = (isDark = true) => {
  return getCurrentTheme(isDark).colors;
};

// Helper function to get theme shadows
export const getThemeShadows = (isDark = true) => {
  return getCurrentTheme(isDark).shadows;
};
