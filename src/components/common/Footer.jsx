import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { UI_CONFIG } from '../../constants/spotify';

const FooterContainer = styled.footer`
  background: var(--color-background-secondary);
  backdrop-filter: blur(15px);
  border-top: 1px solid var(--color-border);
  padding: ${UI_CONFIG.SPACING.LG} 0;
  width: 100%;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${UI_CONFIG.SPACING.LG};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${UI_CONFIG.SPACING.LG};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET}) {
    flex-direction: column;
    text-align: center;
    gap: ${UI_CONFIG.SPACING.MD};
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: 0 ${UI_CONFIG.SPACING.MD};
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${UI_CONFIG.SPACING.MD};
`;

const FooterTitle = styled.h3`
  color: ${UI_CONFIG.COLORS.WHITE};
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: ${UI_CONFIG.SPACING.SM};
`;

const FooterText = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: ${UI_CONFIG.SPACING.SM};
`;

const FooterLink = styled.a`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.SM};

  &:hover {
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    transform: translateX(4px);
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: ${UI_CONFIG.SPACING.XL};
  padding-top: ${UI_CONFIG.SPACING.LG};
  text-align: center;
`;

const FooterBottomText = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_GRAY};
  font-size: 0.8rem;
  margin-bottom: ${UI_CONFIG.SPACING.SM};
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: ${UI_CONFIG.SPACING.MD};
  margin-top: ${UI_CONFIG.SPACING.MD};
`;

const SocialLink = styled.a`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    transform: translateY(-2px);
  }
`;

const Footer = () => {
  const { t } = useTranslation();

  return (
    <FooterContainer>
      <FooterContent>
        <div>
          <FooterText>
            © 2024 Latte Music • {t('footer.madeWith')} ❤️ {t('footer.by')} quirxsama
          </FooterText>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <FooterLink href="https://github.com/quirxsama" target="_blank" rel="noopener noreferrer">
            GitHub - quirxsama
          </FooterLink>
          <FooterLink href="https://github.com/quirxsama/latte" target="_blank" rel="noopener noreferrer">
            {t('footer.projectRepo', 'Proje Deposu')}
          </FooterLink>
          <FooterLink href="/privacy" onClick={(e) => e.preventDefault()}>
            {t('footer.privacy', 'Gizlilik')}
          </FooterLink>
          <FooterLink href="/terms" onClick={(e) => e.preventDefault()}>
            {t('footer.terms', 'Şartlar')}
          </FooterLink>
        </div>

        <div>
          <FooterText>
            {t('footer.version', 'v1.0.0')} • Spotify API
          </FooterText>
        </div>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
