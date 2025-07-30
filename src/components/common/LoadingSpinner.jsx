import React from 'react';
import styled, { keyframes } from 'styled-components';
import { UI_CONFIG } from '../../constants/spotify';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${UI_CONFIG.SPACING.MD};
  padding: ${UI_CONFIG.SPACING.XL};
`;

const Spinner = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'small': return '24px';
      case 'large': return '64px';
      default: return '40px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '24px';
      case 'large': return '64px';
      default: return '40px';
    }
  }};
  border: ${props => {
    const width = props.size === 'small' ? '2px' : props.size === 'large' ? '4px' : '3px';
    return `${width} solid ${UI_CONFIG.COLORS.SPOTIFY_GRAY}`;
  }};
  border-top: ${props => {
    const width = props.size === 'small' ? '2px' : props.size === 'large' ? '4px' : '3px';
    return `${width} solid ${UI_CONFIG.COLORS.SPOTIFY_GREEN}`;
  }};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};
  animation: ${pulse} 2s ease-in-out infinite;
  text-align: center;
`;

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  showText = true,
  className 
}) => {
  return (
    <SpinnerContainer className={className}>
      <Spinner size={size} />
      {showText && <LoadingText size={size}>{text}</LoadingText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
