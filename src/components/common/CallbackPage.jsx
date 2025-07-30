import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UI_CONFIG } from '../../constants/spotify';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const CallbackContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gradient-primary);
  padding: ${UI_CONFIG.SPACING.MD};
`;

const CallbackCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: ${UI_CONFIG.SPACING.XXL};
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.XL};
    border-radius: 16px;
  }
`;

const StatusMessage = styled.div`
  margin-top: ${UI_CONFIG.SPACING.LG};
  color: ${UI_CONFIG.COLORS.WHITE};
  font-size: 1.125rem;
  line-height: 1.6;
`;

const ErrorMessage = styled.div`
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 8px;
  padding: ${UI_CONFIG.SPACING.MD};
  margin-top: ${UI_CONFIG.SPACING.LG};
  color: #ff4757;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const SuccessMessage = styled.div`
  background: rgba(29, 185, 84, 0.1);
  border: 1px solid rgba(29, 185, 84, 0.3);
  border-radius: 8px;
  padding: ${UI_CONFIG.SPACING.MD};
  margin-top: ${UI_CONFIG.SPACING.LG};
  color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
  font-size: 0.9rem;
  line-height: 1.4;
`;

const CallbackPage = () => {
  const navigate = useNavigate();
  const { handleCallback } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      // Prevent duplicate processing
      if (processed) return;
      setProcessed(true);
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('Callback URL params:', { code: !!code, state, error });

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authorization code or state parameter');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        setMessage('Processing authentication...');

        // Handle the callback
        const success = await handleCallback(code, state);

        if (success) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          setTimeout(() => navigate('/'), 2000);
        } else {
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          setTimeout(() => navigate('/'), 3000);
        }

      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication.');

        // Clear any stored auth data on error
        localStorage.removeItem('spotify_state');
        localStorage.removeItem('spotify_code_verifier');
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('latte_auth_token');

        setTimeout(() => navigate('/'), 3000);
      }
    };

    processCallback();
  }, [handleCallback, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <LoadingSpinner 
              size="large" 
              text="Authenticating with Spotify..." 
            />
            <StatusMessage>{message}</StatusMessage>
          </>
        );

      case 'success':
        return (
          <>
            <LoadingSpinner 
              size="large" 
              text="Success!" 
            />
            <SuccessMessage>{message}</SuccessMessage>
          </>
        );

      case 'error':
        return (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <ErrorMessage>{message}</ErrorMessage>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <CallbackContainer>
      <CallbackCard>
        {renderContent()}
      </CallbackCard>
    </CallbackContainer>
  );
};

export default CallbackPage;
