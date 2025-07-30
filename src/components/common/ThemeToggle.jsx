import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

const ToggleContainer = styled.button`
  position: relative;
  width: 60px;
  height: 30px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  background: ${props => props.isDark ? 
    'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' : 
    'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'
  };
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  padding: 3px;
  box-shadow: ${props => props.isDark ? 
    'inset 0 2px 4px rgba(0, 0, 0, 0.3)' : 
    'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ToggleThumb = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.isDark ? 
    'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)' : 
    'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
  };
  transform: translateX(${props => props.isDark ? '30px' : '0px'});
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;

  &::before {
    content: '${props => props.isDark ? '🌙' : '☀️'}';
    position: absolute;
    transition: all 0.3s ease;
  }
`;

const ToggleLabel = styled.span`
  position: absolute;
  left: ${props => props.isDark ? '8px' : 'auto'};
  right: ${props => props.isDark ? 'auto' : '8px'};
  font-size: 10px;
  font-weight: 600;
  color: ${props => props.isDark ? '#666' : '#888'};
  transition: all 0.3s ease;
  opacity: 0.7;
`;

const ThemeToggle = ({ className }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <ToggleContainer 
      onClick={toggleTheme}
      isDark={isDark}
      className={className}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <ToggleLabel isDark={isDark}>
        {isDark ? 'DARK' : 'LIGHT'}
      </ToggleLabel>
      <ToggleThumb isDark={isDark} />
    </ToggleContainer>
  );
};

export default ThemeToggle;
