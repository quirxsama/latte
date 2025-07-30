import styled, { createGlobalStyle } from 'styled-components';
import { UI_CONFIG } from '../constants/spotify';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Circular', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    background: linear-gradient(135deg, ${UI_CONFIG.COLORS.SPOTIFY_BLACK} 0%, ${UI_CONFIG.COLORS.SPOTIFY_DARK_GRAY} 100%);
    color: ${UI_CONFIG.COLORS.WHITE};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin: 0 auto;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${UI_CONFIG.COLORS.SPOTIFY_DARK_GRAY};
  }

  ::-webkit-scrollbar-thumb {
    background: ${UI_CONFIG.COLORS.SPOTIFY_GRAY};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  }

  /* Focus styles */
  button:focus,
  a:focus {
    outline: 2px solid ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    outline-offset: 2px;
  }

  /* Responsive typography */
  h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    line-height: 1.2;
  }

  h2 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 600;
    line-height: 1.3;
  }

  h3 {
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 600;
    line-height: 1.4;
  }

  p {
    font-size: clamp(0.875rem, 2vw, 1rem);
    line-height: 1.6;
  }

  /* Animation utilities */
  .fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  .slide-up {
    animation: slideUp 0.6s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Media queries */
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    html {
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    html {
      font-size: 13px;
    }
  }
`;

// Common styled components
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${UI_CONFIG.SPACING.MD};
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: 0 ${UI_CONFIG.SPACING.SM};
  }
`;

export const FlexCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const FlexBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Grid = styled.div`
  display: grid;
  gap: ${props => props.gap || UI_CONFIG.SPACING.MD};
  grid-template-columns: ${props => props.columns || 'repeat(auto-fit, minmax(300px, 1fr))'};
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
    gap: ${UI_CONFIG.SPACING.SM};
  }
`;
