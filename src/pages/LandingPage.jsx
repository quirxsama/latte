import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { UI_CONFIG } from '../constants/spotify';
import Button from '../components/common/Button';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import ThemeToggle from '../components/common/ThemeToggle';

const LandingContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: var(--color-gradient-primary);
  background-attachment: fixed;
  background-size: cover;
  overflow-x: hidden;
  position: relative;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: ${UI_CONFIG.SPACING.LG} ${UI_CONFIG.SPACING.XL};
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.MD};
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.SM};
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: var(--color-primary);
    transform: translateY(-2px);
  }
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  background: var(--color-gradient-accent);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-background);
  font-weight: 900;
  font-size: 1.2rem;
  box-shadow: var(--shadow-glow);
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.MD};
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    gap: ${UI_CONFIG.SPACING.SM};
  }
`;

const HeroSection = styled.section`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${UI_CONFIG.SPACING.XXL} ${UI_CONFIG.SPACING.XL};
  text-align: center;
  position: relative;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.XL} ${UI_CONFIG.SPACING.MD};
    min-height: calc(100vh - 80px);
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  z-index: 2;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  color: var(--color-text);
  margin-bottom: ${UI_CONFIG.SPACING.LG};
  line-height: 1.1;
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s ease-out;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: ${UI_CONFIG.SPACING.XXL};
  line-height: 1.6;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 1.1rem;
    margin-bottom: ${UI_CONFIG.SPACING.XL};
  }
`;

const CTAButton = styled(Button)`
  font-size: 1.1rem;
  padding: ${UI_CONFIG.SPACING.LG} ${UI_CONFIG.SPACING.XXL};
  border-radius: 50px;
  box-shadow: var(--shadow-glow);
  opacity: 0;
  transform: translateY(20px) scale(0.9);
  transition: all 0.8s ease-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(29, 185, 84, 0.4);
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 1rem;
    padding: ${UI_CONFIG.SPACING.MD} ${UI_CONFIG.SPACING.XL};
  }
`;

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
`;

const FloatingNote = styled.div`
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  color: var(--color-primary);
  animation: float 6s ease-in-out infinite;
  
  &:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
  &:nth-child(2) { top: 60%; right: 15%; animation-delay: 2s; }
  &:nth-child(3) { top: 80%; left: 20%; animation-delay: 4s; }
  &:nth-child(4) { top: 30%; right: 25%; animation-delay: 1s; }
  &:nth-child(5) { top: 70%; left: 60%; animation-delay: 3s; }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
`;

const FeaturesSection = styled.section`
  width: 100%;
  padding: ${UI_CONFIG.SPACING.XXL} ${UI_CONFIG.SPACING.XL};
  background: var(--color-background-secondary);

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.XL} ${UI_CONFIG.SPACING.MD};
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text);
  text-align: center;
  margin-bottom: ${UI_CONFIG.SPACING.XXL};
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 2rem;
    margin-bottom: ${UI_CONFIG.SPACING.XL};
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${UI_CONFIG.SPACING.XL};
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    grid-template-columns: 1fr;
    gap: ${UI_CONFIG.SPACING.LG};
  }
`;

const FeatureCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: ${UI_CONFIG.SPACING.XL};
  text-align: center;
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.6s ease-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-large);
    border-color: var(--color-primary);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${UI_CONFIG.SPACING.LG};
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: ${UI_CONFIG.SPACING.MD};
`;

const FeatureDescription = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
`;

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    // Simple CSS-based animations
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroCta = document.querySelector('.hero-cta');

    if (heroTitle) {
      setTimeout(() => heroTitle.style.opacity = '1', 300);
    }
    if (heroSubtitle) {
      setTimeout(() => heroSubtitle.style.opacity = '1', 600);
    }
    if (heroCta) {
      setTimeout(() => heroCta.style.opacity = '1', 900);
    }

    // Features animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cards = document.querySelectorAll('.feature-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, index * 200);
          });
        }
      });
    }, { threshold: 0.1 });

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, [isAuthenticated, navigate]);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: '🎵',
      title: t('landing.features.topTracks.title'),
      description: t('landing.features.topTracks.description')
    },
    {
      icon: '📊',
      title: t('landing.features.analytics.title'),
      description: t('landing.features.analytics.description')
    },
    {
      icon: '📱',
      title: t('landing.features.responsive.title'),
      description: t('landing.features.responsive.description')
    }
  ];

  return (
    <LandingContainer>
      <Header>
        <HeaderContent>
          <Logo onClick={() => navigate('/')}>
            <LogoIcon>L</LogoIcon>
            Latte
          </Logo>
          <HeaderControls>
            <ThemeToggle />
            <LanguageSwitcher />
          </HeaderControls>
        </HeaderContent>
      </Header>

      <HeroSection ref={heroRef}>
        <FloatingElements>
          <FloatingNote>🎵</FloatingNote>
          <FloatingNote>🎶</FloatingNote>
          <FloatingNote>🎼</FloatingNote>
          <FloatingNote>🎤</FloatingNote>
          <FloatingNote>🎧</FloatingNote>
        </FloatingElements>
        
        <HeroContent>
          <HeroTitle className="hero-title">
            {t('landing.hero.title')}
          </HeroTitle>
          <HeroSubtitle className="hero-subtitle">
            {t('landing.hero.subtitle')}
          </HeroSubtitle>
          <CTAButton 
            className="hero-cta"
            variant="primary" 
            size="large"
            onClick={handleGetStarted}
          >
            {t('landing.hero.cta')}
          </CTAButton>
        </HeroContent>
      </HeroSection>

      <FeaturesSection ref={featuresRef}>
        <SectionTitle>{t('landing.features.title')}</SectionTitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index} className="feature-card">
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>
    </LandingContainer>
  );
};

export default LandingPage;
