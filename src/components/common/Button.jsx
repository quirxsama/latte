import React from 'react';
import styled, { css } from 'styled-components';
import { SPACING } from '../../constants/themes';

const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'loading', 'fullWidth'].includes(prop),
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px 16px';
      case 'large': return '24px 32px';
      default: return '16px 24px';
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
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Variant styles */
  ${props => {
    switch (props.variant) {
      case 'primary':
        return css`
          background: var(--color-primary);
          color: var(--color-background);

          &:hover:not(:disabled) {
            background: var(--color-primary-hover);
            transform: translateY(-2px);
            box-shadow: var(--shadow-glow);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      
      case 'secondary':
        return css`
          background: transparent;
          color: var(--color-text);
          border: 2px solid var(--color-border);

          &:hover:not(:disabled) {
            border-color: var(--color-text);
            background: var(--color-surface-hover);
            transform: translateY(-2px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      
      case 'ghost':
        return css`
          background: transparent;
          color: var(--color-text-secondary);

          &:hover:not(:disabled) {
            color: var(--color-text);
            background: var(--color-surface-hover);
          }
        `;
      
      case 'danger':
        return css`
          background: var(--color-error);
          color: var(--color-text);

          &:hover:not(:disabled) {
            background: #ff4757;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      
      default:
        return css`
          background: var(--color-surface);
          color: var(--color-text);

          &:hover:not(:disabled) {
            background: var(--color-surface-hover);
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
  @media (max-width: 768px) {
    padding: ${props => {
      switch (props.size) {
        case 'small': return '4px 8px';
        case 'large': return '16px 24px';
        default: return '8px 16px';
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
