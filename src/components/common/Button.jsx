import React from 'react';
import styled, { css } from 'styled-components';
import { UI_CONFIG } from '../../constants/spotify';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${UI_CONFIG.SPACING.SM};
  padding: ${props => {
    switch (props.size) {
      case 'small': return `${UI_CONFIG.SPACING.SM} ${UI_CONFIG.SPACING.MD}`;
      case 'large': return `${UI_CONFIG.SPACING.LG} ${UI_CONFIG.SPACING.XL}`;
      default: return `${UI_CONFIG.SPACING.MD} ${UI_CONFIG.SPACING.LG}`;
    }
  }};
  border: none;
  border-radius: 50px;
  font-family: inherit;
  font-weight: 600;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    outline-offset: 2px;
  }

  /* Variant styles */
  ${props => {
    switch (props.variant) {
      case 'primary':
        return css`
          background: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
          color: ${UI_CONFIG.COLORS.SPOTIFY_BLACK};
          
          &:hover:not(:disabled) {
            background: #1ed760;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(29, 185, 84, 0.3);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      
      case 'secondary':
        return css`
          background: transparent;
          color: ${UI_CONFIG.COLORS.WHITE};
          border: 2px solid ${UI_CONFIG.COLORS.SPOTIFY_GRAY};
          
          &:hover:not(:disabled) {
            border-color: ${UI_CONFIG.COLORS.WHITE};
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      
      case 'ghost':
        return css`
          background: transparent;
          color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
          
          &:hover:not(:disabled) {
            color: ${UI_CONFIG.COLORS.WHITE};
            background: rgba(255, 255, 255, 0.1);
          }
        `;
      
      case 'danger':
        return css`
          background: #e22134;
          color: ${UI_CONFIG.COLORS.WHITE};
          
          &:hover:not(:disabled) {
            background: #ff4757;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(226, 33, 52, 0.3);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      
      default:
        return css`
          background: ${UI_CONFIG.COLORS.SPOTIFY_GRAY};
          color: ${UI_CONFIG.COLORS.WHITE};
          
          &:hover:not(:disabled) {
            background: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
            transform: translateY(-2px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
    }
  }}

  /* Loading state */
  ${props => props.loading && css`
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  `}

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive */
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${props => {
      switch (props.size) {
        case 'small': return `${UI_CONFIG.SPACING.XS} ${UI_CONFIG.SPACING.SM}`;
        case 'large': return `${UI_CONFIG.SPACING.MD} ${UI_CONFIG.SPACING.LG}`;
        default: return `${UI_CONFIG.SPACING.SM} ${UI_CONFIG.SPACING.MD}`;
      }
    }};
    font-size: ${props => {
      switch (props.size) {
        case 'small': return '0.8rem';
        case 'large': return '1rem';
        default: return '0.9rem';
      }
    }};
  }
`;

const Button = ({ 
  children, 
  variant = 'default', 
  size = 'medium', 
  loading = false, 
  disabled = false,
  onClick,
  type = 'button',
  className,
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={className}
      {...props}
    >
      {loading ? '' : children}
    </StyledButton>
  );
};

export default Button;
