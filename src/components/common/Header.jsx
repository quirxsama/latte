import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UI_CONFIG } from '../../constants/spotify';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(25, 20, 20, 0.95);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(29, 185, 84, 0.2);
  padding: ${UI_CONFIG.SPACING.LG} 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    border-bottom-color: rgba(29, 185, 84, 0.4);
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${UI_CONFIG.SPACING.LG};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.LG};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: 0 ${UI_CONFIG.SPACING.MD};
    flex-direction: column;
    gap: ${UI_CONFIG.SPACING.MD};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.MD};
  font-size: 1.75rem;
  font-weight: 800;
  color: ${UI_CONFIG.COLORS.WHITE};
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    transform: translateY(-2px);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, ${UI_CONFIG.COLORS.SPOTIFY_GREEN}, #1ed760);
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 1.5rem;
    gap: ${UI_CONFIG.SPACING.SM};
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${UI_CONFIG.COLORS.SPOTIFY_GREEN} 0%, #1ed760 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${UI_CONFIG.COLORS.SPOTIFY_BLACK};
  font-weight: 900;
  font-size: 1.4rem;
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3);
  transition: all 0.3s ease;

  ${Logo}:hover & {
    transform: rotate(5deg) scale(1.1);
    box-shadow: 0 6px 20px rgba(29, 185, 84, 0.5);
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    width: 36px;
    height: 36px;
    font-size: 1.2rem;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.LG};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET}) {
    display: none;
  }
`;

const NavItem = styled.button`
  background: none;
  border: none;
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: ${UI_CONFIG.SPACING.SM} ${UI_CONFIG.SPACING.MD};
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: ${UI_CONFIG.COLORS.WHITE};
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  &.active {
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    background: rgba(29, 185, 84, 0.1);
  }

  &.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    border-radius: 1px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.MD};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    flex-direction: column;
    gap: ${UI_CONFIG.SPACING.SM};
    width: 100%;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.MD};
  color: ${UI_CONFIG.COLORS.WHITE};
  padding: ${UI_CONFIG.SPACING.SM} ${UI_CONFIG.SPACING.MD};
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(29, 185, 84, 0.3);
    transform: translateY(-1px);
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    justify-content: center;
    padding: ${UI_CONFIG.SPACING.SM};
  }
`;

const UserAvatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
  transition: all 0.3s ease;

  ${UserInfo}:hover & {
    border-color: #1ed760;
    box-shadow: 0 6px 16px rgba(29, 185, 84, 0.5);
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
  color: ${UI_CONFIG.COLORS.WHITE};
  line-height: 1.2;
`;

const UserStatus = styled.span`
  font-size: 0.8rem;
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '●';
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    font-size: 0.6rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${UI_CONFIG.COLORS.WHITE};
  font-size: 1.5rem;
  cursor: pointer;
  padding: ${UI_CONFIG.SPACING.SM};
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET}) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(25, 20, 20, 0.98);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(29, 185, 84, 0.2);
  padding: ${UI_CONFIG.SPACING.LG};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  &.open {
    display: block;
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET}) {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const MobileNavItem = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  padding: ${UI_CONFIG.SPACING.MD};
  text-align: left;
  border-radius: 8px;
  margin-bottom: ${UI_CONFIG.SPACING.SM};
  transition: all 0.3s ease;

  &:hover {
    color: ${UI_CONFIG.COLORS.WHITE};
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    background: rgba(29, 185, 84, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${UI_CONFIG.SPACING.SM};

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    width: 100%;
    justify-content: center;
  }
`;

const Header = () => {
  const { isAuthenticated, user, logout, login, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
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

        {isAuthenticated && (
          <Navigation>
            <NavItem
              className={isActivePage('/') ? 'active' : ''}
              onClick={() => handleNavigation('/')}
            >
              Dashboard
            </NavItem>
            <NavItem
              className={isActivePage('/') ? 'active' : ''}
              onClick={() => handleNavigation('/')}
            >
              Top Tracks
            </NavItem>
            <NavItem
              className={isActivePage('/quiz') ? 'active' : ''}
              onClick={() => handleNavigation('/quiz')}
            >
              Quiz
            </NavItem>
            <NavItem>Compare</NavItem>
          </Navigation>
        )}

        <UserSection>
          {isAuthenticated && user ? (
            <>
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
              <MobileMenuButton onClick={toggleMobileMenu}>
                ☰
              </MobileMenuButton>
              <ButtonGroup>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={logout}
                >
                  Logout
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <ButtonGroup>
              <Button
                variant="primary"
                size="small"
                onClick={login}
              >
                Login with Spotify
              </Button>
            </ButtonGroup>
          )}
        </UserSection>
      </HeaderContent>

      {isAuthenticated && (
        <MobileMenu isOpen={isMobileMenuOpen}>
          <MobileNavItem
            className={isActivePage('/') ? 'active' : ''}
            onClick={() => handleNavigation('/')}
          >
            🏠 Dashboard
          </MobileNavItem>
          <MobileNavItem
            className={isActivePage('/') ? 'active' : ''}
            onClick={() => handleNavigation('/')}
          >
            🎵 Top Tracks
          </MobileNavItem>
          <MobileNavItem
            className={isActivePage('/quiz') ? 'active' : ''}
            onClick={() => handleNavigation('/quiz')}
          >
            🎮 Quiz
          </MobileNavItem>
          <MobileNavItem>📊 Compare</MobileNavItem>
        </MobileMenu>
      )}
    </HeaderContainer>
  );
};

export default Header;
