import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { UI_CONFIG } from '../../constants/spotify';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import LanguageSwitcher from './LanguageSwitcher';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gradient-primary);
  padding: 16px;
`;

const LoginCard = styled.div`
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-large);
  position: relative;

  @media (max-width: 768px) {
    padding: 32px;
    border-radius: 16px;
  }
`;

const LanguageSwitcherContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${UI_CONFIG.SPACING.MD};
  margin-bottom: ${UI_CONFIG.SPACING.XL};
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${UI_CONFIG.COLORS.SPOTIFY_GREEN} 0%, #1ed760 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${UI_CONFIG.COLORS.SPOTIFY_BLACK};
  font-weight: 900;
  font-size: 2rem;
  box-shadow: 0 8px 32px rgba(29, 185, 84, 0.3);

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
`;

const LogoText = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${UI_CONFIG.COLORS.WHITE};
  margin: 0;
  background: linear-gradient(135deg, ${UI_CONFIG.COLORS.WHITE} 0%, ${UI_CONFIG.COLORS.SPOTIFY_GREEN} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 2rem;
  }
`;

const Title = styled.h2`
  color: ${UI_CONFIG.COLORS.WHITE};
  margin-bottom: ${UI_CONFIG.SPACING.MD};
  font-size: 1.75rem;
  font-weight: 600;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 1.5rem;
  }
`;

const Description = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: ${UI_CONFIG.SPACING.XL};
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 1rem;
  }
`;

const Features = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${UI_CONFIG.SPACING.XL} 0;
  text-align: left;
`;

const Feature = styled.li`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  margin-bottom: ${UI_CONFIG.SPACING.SM};
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.SM};
  font-size: 0.95rem;

  &::before {
    content: '✓';
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  font-size: 1.125rem;
  padding: ${UI_CONFIG.SPACING.LG} ${UI_CONFIG.SPACING.XL};
  margin-bottom: ${UI_CONFIG.SPACING.MD};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 1rem;
    padding: ${UI_CONFIG.SPACING.MD} ${UI_CONFIG.SPACING.LG};
  }
`;

const Disclaimer = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_GRAY};
  font-size: 0.8rem;
  line-height: 1.4;
  margin-top: ${UI_CONFIG.SPACING.MD};
`;

const ErrorMessage = styled.div`
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 8px;
  padding: ${UI_CONFIG.SPACING.MD};
  margin-bottom: ${UI_CONFIG.SPACING.MD};
  color: #ff4757;
  font-size: 0.9rem;
`;

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const { t, i18n } = useTranslation();

  // Auto-detect language on mount
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'tr' && i18n.language !== 'tr') {
      i18n.changeLanguage('tr');
    } else if (browserLang === 'en' && i18n.language !== 'en') {
      i18n.changeLanguage('en');
    }
  }, [i18n]);

  const handleLogin = () => {
    login();
  };

  const clearStorage = () => {
    localStorage.removeItem('spotify_state');
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('latte_auth_token');
    console.log('LocalStorage cleared');
    alert('LocalStorage cleared! You can now try logging in again.');
  };

  if (loading) {
    return (
      <LoginContainer>
        <LoadingSpinner
          size="large"
          text={t('login.connecting')}
        />
      </LoginContainer>
    );
  }

  return (
    <LoginContainer>
      <LoginCard>
        {/* Language Switcher */}
        <LanguageSwitcherContainer>
          <LanguageSwitcher />
        </LanguageSwitcherContainer>

        <Logo>
          <LogoIcon>L</LogoIcon>
          <LogoText>Latte</LogoText>
        </Logo>

        <Title>{t('login.title')}</Title>
        <Description>
          {t('login.description')}
        </Description>

        <Features>
          <Feature>{t('login.features.topTracks')}</Feature>
          <Feature>{t('login.features.analytics')}</Feature>
          <Feature>{t('login.features.responsive')}</Feature>
        </Features>

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}

        <LoginButton
          variant="primary"
          onClick={handleLogin}
          disabled={loading}
        >
          {t('login.connectButton')}
        </LoginButton>

        <Disclaimer>
          {t('login.disclaimer')}
        </Disclaimer>

        {process.env.NODE_ENV === 'development' && (
          <Button
            variant="ghost"
            size="small"
            onClick={clearStorage}
            style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}
          >
            🔧 {t('login.clearStorage')}
          </Button>
        )}
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
