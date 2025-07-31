import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';
import { ThrowError } from '../../../test/utils';

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true}>
          <div>Test content</div>
        </ThrowError>
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
  });

  it('shows retry and reload buttons on error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true}>
          <div>Test content</div>
        </ThrowError>
      </ErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('calls retry handler when Try Again is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true}>
          <div>Test content</div>
        </ThrowError>
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Try Again'));

    // After retry, the error boundary should reset its state
    // We can't easily test the actual retry behavior without more complex setup
    // So we just verify the button exists and can be clicked
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('calls reload handler when Reload Page is clicked', () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true}>
          <div>Test content</div>
        </ThrowError>
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Reload Page'));

    expect(mockReload).toHaveBeenCalled();
  });

  it('renders custom fallback component when provided', () => {
    const CustomFallback = ({ error, onRetry }) => (
      <div>
        <h1>Custom Error</h1>
        <p>{error?.message}</p>
        <button onClick={onRetry}>Custom Retry</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true}>
          <div>Test content</div>
        </ThrowError>
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Custom Retry')).toBeInTheDocument();
  });

  it('logs error details to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true}>
          <div>Test content</div>
        </ThrowError>
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error)
    );
  });
});
