import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { UI_CONFIG } from '../../constants/spotify';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const HeaderContainer = styled.header`
  position: static;
  top: 0;
  z-index: 100;
  background: var(--color-background-secondary);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--color-border);
  padding: ${UI_CONFIG.SPACING.LG} ${UI_CONFIG.SPACING.XL};
  box-shadow: var(--shadow-medium);
  border-radius: 0 0 24px 24px;
  margin: 0 ${UI_CONFIG.SPACING.MD};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    margin: 0;
    border-radius: 0;
    padding: ${UI_CONFIG.SPACING.MD} ${UI_CONFIG.SPACING.SM};
    box-shadow: var(--shadow-small);
  }

  @media (max-width: 480px) {
    padding: ${UI_CONFIG.SPACING.SM};
  }

  transition: all 0.3s ease;

  &:hover {
    border-bottom-color: var(--color-primary);
    box-shadow: var(--shadow-large);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: ${UI_CONFIG.SPACING.LG};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    gap: ${UI_CONFIG.SPACING.SM};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.MD};
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: var(--color-primary);
    transform: translateY(-2px);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--color-gradient-accent);
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 1.4rem;
    gap: ${UI_CONFIG.SPACING.SM};
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: var(--color-gradient-accent);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-background);
  font-weight: 900;
  font-size: 1.4rem;
  box-shadow: var(--shadow-glow);
  transition: all 0.3s ease;

  ${Logo}:hover & {
    transform: rotate(5deg) scale(1.1);
    box-shadow: var(--shadow-glow);
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    width: 36px;
    height: 36px;
    font-size: 1.2rem;
  }
`;



const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.MD};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    gap: ${UI_CONFIG.SPACING.SM};
    flex-shrink: 0;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.MD};
  color: var(--color-text);
  padding: ${UI_CONFIG.SPACING.SM} ${UI_CONFIG.SPACING.MD};
  border-radius: 25px;
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: var(--color-surface-hover);
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.SM} ${UI_CONFIG.SPACING.MD};
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: ${UI_CONFIG.SPACING.XS} ${UI_CONFIG.SPACING.SM};
    border-radius: 16px;
    min-width: auto;
  }
`;

const UserAvatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  object-fit: cover;
  box-shadow: var(--shadow-glow);
  transition: all 0.3s ease;

  ${UserInfo}:hover & {
    border-color: var(--color-primary-hover);
    box-shadow: var(--shadow-glow);
    transform: scale(1.05);
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    width: 36px;
    height: 36px;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    display: none;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text);
  line-height: 1.2;
`;

const UserStatus = styled.span`
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '●';
    color: var(--color-primary);
    font-size: 0.6rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 1.2rem;
  cursor: pointer;
  padding: ${UI_CONFIG.SPACING.SM};
  border-radius: 12px;
  transition: all 0.3s ease;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-primary);
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    display: flex;
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
    padding: ${UI_CONFIG.SPACING.XS};
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-background-secondary);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  border-top: 1px solid var(--color-border);
  padding: ${UI_CONFIG.SPACING.LG};
  box-shadow: var(--shadow-large);
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    display: block;
    padding: ${UI_CONFIG.SPACING.MD};
  }

  @media (max-width: 480px) {
    padding: ${UI_CONFIG.SPACING.SM};
  }
`;

const MobileNavItem = styled.button`
  display: block;
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: ${UI_CONFIG.SPACING.MD};
  text-align: left;
  border-radius: 12px;
  margin-bottom: ${UI_CONFIG.SPACING.SM};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.SM};

  &:hover {
    color: var(--color-text);
    background: var(--color-surface-hover);
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }

  &.active {
    color: var(--color-primary);
    background: var(--color-surface-active);
    border-color: var(--color-primary);
  }

  @media (max-width: 480px) {
    padding: ${UI_CONFIG.SPACING.SM};
    font-size: 0.9rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${UI_CONFIG.SPACING.SM};
  align-items: center;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    gap: ${UI_CONFIG.SPACING.XS};
  }
`;

const AccountMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--color-background-secondary);
  backdrop-filter: blur(15px);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-large);
  z-index: 1000;
  min-width: 200px;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
  transition: all 0.3s ease;
  transform-origin: top right;
`;

const AccountMenuItem = styled.div`
  padding: 16px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 8px;

  &:first-child {
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
    border-bottom: none;
  }

  &:only-child {
    border-radius: 12px;
    border-bottom: none;
  }

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }

  &.danger {
    color: var(--color-error);

    &:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--color-error);
    }
  }
`;

const UserInfoContainer = styled.div`
  position: relative;
  cursor: pointer;
`;



const Header = () => {
  const { isAuthenticated, user, logout, login, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAccountMenuOpen && !event.target.closest('[data-account-menu]')) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isAccountMenuOpen]);

  const getFollowerCount = () => {
    return user?.followers?.total || 0;
  };

  const formatFollowerCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <HeaderContainer>
        <HeaderContent>
          <Logo onClick={handleLogoClick}>
            <LogoIcon>L</LogoIcon>
            Latte
          </Logo>
          <div>Loading...</div>
        </HeaderContent>
      </HeaderContainer>
    );
  }

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo onClick={handleLogoClick}>
          <LogoIcon>L</LogoIcon>
          Latte
        </Logo>



        <UserSection>
          <ThemeToggle />
          <LanguageSwitcher />

          {isAuthenticated && user ? (
            <>
              <UserInfoContainer
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                data-account-menu
              >
                <UserInfo>
                  {user.images && user.images.length > 0 ? (
                    <UserAvatar
                      src={user.images[0].url}
                      alt={user.display_name || 'User'}
                    />
                  ) : (
                    <UserAvatar
                      src="https://via.placeholder.com/44x44/1DB954/191414?text=U"
                      alt="User"
                    />
                  )}
                  <UserDetails>
                    <UserName>
                      {user.display_name || 'Spotify User'}
                    </UserName>
                    <UserStatus>
                      {formatFollowerCount(getFollowerCount())} followers
                    </UserStatus>
                  </UserDetails>
                </UserInfo>

                <AccountMenu isOpen={isAccountMenuOpen}>
                  <AccountMenuItem onClick={() => {
                    setIsAccountMenuOpen(false);
                    // Navigate to profile settings
                  }}>
                    ⚙️ Account Settings
                  </AccountMenuItem>
                  <AccountMenuItem onClick={() => {
                    setIsAccountMenuOpen(false);
                    // Navigate to privacy settings
                  }}>
                    🔒 Privacy Settings
                  </AccountMenuItem>
                  <AccountMenuItem onClick={() => {
                    setIsAccountMenuOpen(false);
                    // Show about/help
                  }}>
                    ❓ Help & Support
                  </AccountMenuItem>
                  <AccountMenuItem
                    className="danger"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      logout();
                    }}
                  >
                    🚪 {t('navigation.logout')}
                  </AccountMenuItem>
                </AccountMenu>
              </UserInfoContainer>

              <MobileMenuButton onClick={toggleMobileMenu}>
                ☰
              </MobileMenuButton>
            </>
          ) : (
            <ButtonGroup>
              <Button
                variant="primary"
                size="small"
                onClick={login}
              >
                {t('navigation.login')}
              </Button>
            </ButtonGroup>
          )}
        </UserSection>
      </HeaderContent>

      {isAuthenticated && (
        <MobileMenu isOpen={isMobileMenuOpen}>
          <MobileNavItem
            className={isActivePage('/dashboard') ? 'active' : ''}
            onClick={() => handleNavigation('/dashboard')}
          >
            🏠 {t('navigation.dashboard')}
          </MobileNavItem>
          <MobileNavItem
            className={isActivePage('/quiz') ? 'active' : ''}
            onClick={() => handleNavigation('/quiz')}
          >
            🎵 {t('navigation.quiz')}
          </MobileNavItem>
        </MobileMenu>
      )}
    </HeaderContainer>
  );
};

export default Header;
