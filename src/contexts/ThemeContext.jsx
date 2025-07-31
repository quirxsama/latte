import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentTheme } from '../constants/themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or detect system preference
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('latte_theme');
    if (saved) {
      return saved === 'dark';
    }
    // Auto-detect system theme preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Get current theme object
  const theme = getCurrentTheme(isDark);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('latte_theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  // Set theme function
  const setTheme = (themeName) => {
    const newIsDark = themeName === 'dark';
    setIsDark(newIsDark);
    localStorage.setItem('latte_theme', themeName);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-update if user hasn't manually set a preference
      const saved = localStorage.getItem('latte_theme');
      if (!saved) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const colors = theme.colors;
    const shadows = theme.shadows;

    // Set CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });

    Object.entries(shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Set theme class on body
    document.body.className = `theme-${theme.name}`;
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.background);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = colors.background;
      document.head.appendChild(meta);
    }

  }, [theme]);

  const value = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    colors: theme.colors,
    shadows: theme.shadows
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
