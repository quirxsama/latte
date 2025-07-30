import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { UI_CONFIG } from '../constants/spotify';
import Header from '../components/common/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import spotifyApi from '../services/spotifyApi';

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: var(--color-gradient-primary);
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${UI_CONFIG.SPACING.XL};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.MD};
  }
`;

const AccountContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: ${UI_CONFIG.SPACING.XL};
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
    gap: ${UI_CONFIG.SPACING.LG};
  }
`;

const ProfileCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: ${UI_CONFIG.SPACING.XL};
  text-align: center;
  height: fit-content;
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.LG};
  }
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: ${UI_CONFIG.SPACING.LG};
  border: 3px solid var(--color-primary);
  object-fit: cover;
`;

const ProfileName = styled.h1`
  color: var(--color-text);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: ${UI_CONFIG.SPACING.SM};
`;

const ProfileEmail = styled.p`
  color: var(--color-text-secondary);
  margin-bottom: ${UI_CONFIG.SPACING.MD};
`;

const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${UI_CONFIG.SPACING.MD};
  margin-bottom: ${UI_CONFIG.SPACING.LG};
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${UI_CONFIG.SPACING.MD};
  background: var(--color-background-secondary);
  border-radius: 12px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: ${UI_CONFIG.SPACING.XS};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const SettingsCard = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: ${UI_CONFIG.SPACING.XL};
  
  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.LG};
  }
`;

const SectionTitle = styled.h2`
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: ${UI_CONFIG.SPACING.LG};
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.SM};
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${UI_CONFIG.SPACING.MD} 0;
  border-bottom: 1px solid var(--color-border);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  color: var(--color-text);
  font-weight: 500;
`;

const SettingDescription = styled.div`
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-top: ${UI_CONFIG.SPACING.XS};
`;

const DangerZone = styled.div`
  margin-top: ${UI_CONFIG.SPACING.XL};
  padding: ${UI_CONFIG.SPACING.LG};
  border: 1px solid #ff4757;
  border-radius: 12px;
  background: rgba(255, 71, 87, 0.1);
`;

const DangerTitle = styled.h3`
  color: #ff4757;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: ${UI_CONFIG.SPACING.MD};
`;

const AccountPage = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [error, setError] = useState(null);

  // Test mode check
  const isDevelopment = import.meta.env.DEV;
  const allowTestAccess = isDevelopment && localStorage.getItem('latte_test_mode') === 'true';

  useEffect(() => {
    if ((!isAuthenticated || !user) && !allowTestAccess) return;

    const fetchUserStats = async () => {
      try {
        setLoading(true);

        if (allowTestAccess && !isAuthenticated) {
          // Mock data for test mode
          setUserStats({
            totalPlaylists: 8,
            followers: 42
          });
        } else {
          // Fetch user's playlists for stats
          const playlists = await spotifyApi.getCurrentUserPlaylists({ limit: 50 });

          setUserStats({
            totalPlaylists: playlists.items.length,
            followers: user.followers?.total || 0
          });
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
  };

  const clearLocalData = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (loading) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <LoadingSpinner size="large" text={t('account.loading')} />
        </MainContent>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: '#ff4757', marginBottom: '1rem' }}>
              {t('account.error')}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
          </div>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <AccountContainer>
          <ProfileCard>
            <ProfileImage
              src={user?.images?.[0]?.url || '/default-avatar.png'}
              alt={user?.display_name || t('account.userAvatar')}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzMzIiByeD0iNjAiLz4KPHN2ZyB4PSIzMCIgeT0iMzAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNjY2Ij4KPHA+VXNlcjwvcD4KPHN2Zz4=';
              }}
            />
            <ProfileName>
              {user?.display_name || (allowTestAccess ? 'Test User' : t('account.unknownUser'))}
            </ProfileName>
            <ProfileEmail>
              {user?.email || (allowTestAccess ? 'test@example.com' : t('account.noEmail'))}
            </ProfileEmail>
            
            {userStats && (
              <ProfileStats>
                <StatItem>
                  <StatValue>{userStats.totalPlaylists}</StatValue>
                  <StatLabel>{t('account.stats.playlists')}</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{userStats.followers}</StatValue>
                  <StatLabel>{t('account.stats.followers')}</StatLabel>
                </StatItem>
              </ProfileStats>
            )}
          </ProfileCard>

          <SettingsCard>
            <SectionTitle>
              ⚙️ {t('account.settings.title')}
            </SectionTitle>
            
            <SettingItem>
              <div>
                <SettingLabel>{t('account.settings.language')}</SettingLabel>
                <SettingDescription>{t('account.settings.languageDesc')}</SettingDescription>
              </div>
            </SettingItem>
            
            <SettingItem>
              <div>
                <SettingLabel>{t('account.settings.theme')}</SettingLabel>
                <SettingDescription>{t('account.settings.themeDesc')}</SettingDescription>
              </div>
            </SettingItem>
            
            <SettingItem>
              <div>
                <SettingLabel>{t('account.settings.privacy')}</SettingLabel>
                <SettingDescription>{t('account.settings.privacyDesc')}</SettingDescription>
              </div>
              <Button variant="ghost" size="small">
                {t('account.settings.manage')}
              </Button>
            </SettingItem>

            <SettingItem>
              <div>
                <SettingLabel>{t('account.settings.friends')}</SettingLabel>
                <SettingDescription>{t('account.settings.friendsDesc')}</SettingDescription>
              </div>
              <Button variant="ghost" size="small" disabled>
                {t('account.settings.comingSoon')}
              </Button>
            </SettingItem>

            <DangerZone>
              <DangerTitle>⚠️ {t('account.dangerZone.title')}</DangerTitle>
              
              <SettingItem>
                <div>
                  <SettingLabel>{t('account.dangerZone.clearData')}</SettingLabel>
                  <SettingDescription>{t('account.dangerZone.clearDataDesc')}</SettingDescription>
                </div>
                <Button variant="ghost" size="small" onClick={clearLocalData}>
                  {t('account.dangerZone.clear')}
                </Button>
              </SettingItem>
              
              <SettingItem>
                <div>
                  <SettingLabel>{t('account.dangerZone.logout')}</SettingLabel>
                  <SettingDescription>{t('account.dangerZone.logoutDesc')}</SettingDescription>
                </div>
                <Button variant="danger" size="small" onClick={handleLogout}>
                  {t('account.dangerZone.logoutButton')}
                </Button>
              </SettingItem>
            </DangerZone>
          </SettingsCard>
        </AccountContainer>
      </MainContent>
    </PageContainer>
  );
};

export default AccountPage;
