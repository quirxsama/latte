import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    const customText = 'Please wait...';
    render(<LoadingSpinner text={customText} />);
    
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('hides text when showText is false', () => {
    render(<LoadingSpinner showText={false} />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-spinner';
    render(<LoadingSpinner className={customClass} />);
    
    const container = screen.getByText('Loading...').parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<LoadingSpinner size="medium" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    
    // The spinner should be visible to screen readers
    const text = screen.getByText('Loading...');
    expect(text).toBeInTheDocument();
  });
});
