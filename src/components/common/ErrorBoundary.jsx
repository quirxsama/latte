import React from 'react';
import styled from 'styled-components';
import { UI_CONFIG } from '../../constants/spotify';
import Button from './Button';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: ${UI_CONFIG.SPACING.XL};
  text-align: center;
  background: rgba(255, 71, 87, 0.05);
  border: 1px solid rgba(255, 71, 87, 0.2);
  border-radius: 16px;
  margin: ${UI_CONFIG.SPACING.XL};
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${UI_CONFIG.SPACING.LG};
  opacity: 0.7;
`;

const ErrorTitle = styled.h2`
  color: #ff4757;
  margin-bottom: ${UI_CONFIG.SPACING.MD};
  font-size: 1.5rem;
`;

const ErrorMessage = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 1rem;
  line-height: 1.6;
  max-width: 500px;
  margin-bottom: ${UI_CONFIG.SPACING.XL};
`;

const ErrorDetails = styled.details`
  margin-top: ${UI_CONFIG.SPACING.MD};
  max-width: 600px;
  width: 100%;
  
  summary {
    color: ${UI_CONFIG.COLORS.SPOTIFY_GRAY};
    cursor: pointer;
    font-size: 0.9rem;
    margin-bottom: ${UI_CONFIG.SPACING.SM};
    
    &:hover {
      color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
    }
  }
`;

const ErrorStack = styled.pre`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: ${UI_CONFIG.SPACING.MD};
  font-size: 0.8rem;
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      // If a custom fallback component is provided, use it
      if (Fallback) {
        return (
          <Fallback 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
          />
        );
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            We're sorry, but something unexpected happened. 
            You can try refreshing the page or going back to the previous page.
          </ErrorMessage>
          
          <div style={{ display: 'flex', gap: UI_CONFIG.SPACING.MD, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="primary" 
              onClick={this.handleRetry}
            >
              Try Again
            </Button>
            <Button 
              variant="secondary" 
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <ErrorDetails>
              <summary>Error Details (Development)</summary>
              <ErrorStack>
                <strong>Error:</strong> {this.state.error.toString()}
                {this.state.errorInfo && (
                  <>
                    <br /><br />
                    <strong>Component Stack:</strong>
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </ErrorStack>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
