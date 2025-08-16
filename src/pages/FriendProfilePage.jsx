import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import TimeRangeFilter from '../components/common/TimeRangeFilter';
import GenreStats from '../components/genre/GenreStats';
import TrackList from '../components/track/TrackList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Footer from '../components/common/Footer';
import apiService from '../services/api';
import { SPACING, BREAKPOINTS } from '../constants/themes';

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: var(--color-gradient-primary);
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: ${SPACING.XL};
  width: 100%;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    padding: ${SPACING.LG};
  }

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: ${SPACING.MD};
  }
`;

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: ${SPACING.XXL};
  background: var(--color-surface);
  border-radius: 20px;
  padding: ${SPACING.XL};
  border: 1px solid var(--color-border);
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--color-primary);
  margin-bottom: ${SPACING.MD};
  object-fit: cover;
`;

const ProfileName = styled.h1`
  color: var(--color-text);
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 ${SPACING.SM} 0;
  background: linear-gradient(135deg, var(--color-primary), #1ed760);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ProfileInfo = styled.div`
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin-bottom: ${SPACING.MD};
`;

const BackButton = styled.button`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: ${SPACING.SM} ${SPACING.MD};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  margin-bottom: ${SPACING.LG};

  &:hover {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${SPACING.XXL};
  color: var(--color-error);
  background: var(--color-surface);
  border-radius: 16px;
  border: 1px solid var(--color-border);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const MusicSection = styled.div`
  margin-bottom: ${SPACING.XL};
`;

const SectionTitle = styled.h2`
  color: var(--color-text);
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: ${SPACING.LG};
  text-align: center;
`;

const ComparisonSection = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 16px;
  padding: ${SPACING.XL};
  margin-bottom: ${SPACING.XL};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CompatibilityScore = styled.div`
  text-align: center;
  margin-bottom: ${SPACING.LG};
`;

const ScoreCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 auto ${SPACING.MD};
  box-shadow: 0 8px 32px rgba(29, 185, 84, 0.3);
`;

const ScoreLabel = styled.p`
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin: 0;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${SPACING.LG};
  margin-top: ${SPACING.LG};
`;

const ComparisonCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: ${SPACING.LG};
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardTitle = styled.h3`
  color: var(--color-text);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: ${SPACING.MD};
  display: flex;
  align-items: center;
  gap: ${SPACING.SM};
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.SM} 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
`;

const StatValue = styled.span`
  color: var(--color-text);
  font-weight: 600;
`;

const CommonItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SM};
  max-height: 200px;
  overflow-y: auto;
`;

const CommonItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.SM};
  padding: ${SPACING.SM};
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
`;

const FriendProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('medium_term');
  const [topTracks, setTopTracks] = useState([]);
  const [genreStats, setGenreStats] = useState([]);
  const [musicLoading, setMusicLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);

  useEffect(() => {
    loadFriendProfile();
  }, [userId]);

  useEffect(() => {
    if (friendProfile) {
      loadFriendMusicData();
      loadComparison();
    }
  }, [friendProfile, selectedTimeRange]);

  const loadFriendProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getFriendProfile(userId);
      setFriendProfile(response.profile);
    } catch (error) {
      console.error('Load friend profile error:', error);
      setError(error.message || t('errors.failedToLoadProfile'));
    } finally {
      setLoading(false);
    }
  };

  const loadFriendMusicData = async () => {
    if (!friendProfile) return;

    setMusicLoading(true);
    try {
      // Get friend's music data for the selected time range
      const musicStats = friendProfile.musicStats || {};

      // If we have cached data for this time range, use it
      if (musicStats[selectedTimeRange]) {
        const timeRangeData = musicStats[selectedTimeRange];
        setTopTracks(timeRangeData.topTracks || []);
        setGenreStats(timeRangeData.genreStats || []);
      } else {
        // Otherwise use the default musicStats data
        setTopTracks(musicStats.topTracks || []);
        setGenreStats(musicStats.genreStats || []);
      }
    } catch (error) {
      console.error('Load friend music data error:', error);
    } finally {
      setMusicLoading(false);
    }
  };

  const loadComparison = async () => {
    if (!friendProfile) return;

    setComparisonLoading(true);
    setComparisonError(null);
    try {
      const response = await apiService.compareWithUser(friendProfile.id);
      setComparison(response.comparison);
    } catch (error) {
      console.error('Load comparison error:', error);
      setComparisonError(error.message || t('errors.failedToLoadComparison'));
    } finally {
      setComparisonLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/friends');
  };

  const getTimeRangeTitle = () => {
    switch (selectedTimeRange) {
      case 'short_term':
        return t('timeRange.lastMonth');
      case 'medium_term':
        return t('timeRange.last6Months');
      case 'long_term':
        return t('timeRange.allTime');
      default:
        return t('timeRange.last6Months');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <BackButton onClick={handleBack}>
            ← {t('common.back')} {t('navigation.friends')}
          </BackButton>
          <ErrorContainer>
            <h3>❌ {t('errors.loadingProfile')}</h3>
            <p>{error}</p>
          </ErrorContainer>
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  if (!friendProfile) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <BackButton onClick={handleBack}>
            ← {t('common.back')} {t('navigation.friends')}
          </BackButton>
          <ErrorContainer>
            <h3>👤 {t('errors.profileNotFound')}</h3>
            <p>{t('errors.profileNotFoundDescription')}</p>
          </ErrorContainer>
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <BackButton onClick={handleBack}>
          ← {t('common.back')} {t('navigation.friends')}
        </BackButton>

        <ProfileHeader>
          <ProfileImage
            src={friendProfile.profileImage || '/default-avatar.png'}
            alt={friendProfile.displayName}
            onError={(e) => {
              e.target.src = `https://dummyimage.com/120x120/1DB954/191414.png&text=${friendProfile.displayName?.[0] || 'U'}`;
            }}
          />
          <ProfileName>{friendProfile.displayName}</ProfileName>
          <ProfileInfo>
            {friendProfile.country && `📍 ${friendProfile.country}`}
            {friendProfile.followers > 0 && ` • ${friendProfile.followers} ${t('profile.followers')}`}
          </ProfileInfo>
        </ProfileHeader>

        {/* Music Comparison */}
        {comparison && (
          <ComparisonSection>
            <SectionTitle>🎯 {t('comparison.title')}</SectionTitle>

            <CompatibilityScore>
              <ScoreCircle>{comparison.similarity}%</ScoreCircle>
              <ScoreLabel>{t('friends.compatibility')}</ScoreLabel>
            </CompatibilityScore>

            <ComparisonGrid>
              <ComparisonCard>
                <CardTitle>
                  🎵 {t('comparison.commonTracks')}
                </CardTitle>
                <StatItem>
                  <StatLabel>{t('comparison.sharedItems')}</StatLabel>
                  <StatValue>{comparison.details.sharedTracks}</StatValue>
                </StatItem>
                {comparison.commonItems?.tracks?.length > 0 && (
                  <CommonItemsList>
                    {comparison.commonItems.tracks.slice(0, 5).map((track, index) => (
                      <CommonItem key={index}>
                        🎵 {track.name} - {track.artists?.[0]?.name}
                      </CommonItem>
                    ))}
                  </CommonItemsList>
                )}
              </ComparisonCard>

              <ComparisonCard>
                <CardTitle>
                  🎤 {t('comparison.commonArtists')}
                </CardTitle>
                <StatItem>
                  <StatLabel>{t('comparison.sharedItems')}</StatLabel>
                  <StatValue>{comparison.details.sharedArtists}</StatValue>
                </StatItem>
                {comparison.commonItems?.artists?.length > 0 && (
                  <CommonItemsList>
                    {comparison.commonItems.artists.slice(0, 5).map((artist, index) => (
                      <CommonItem key={index}>
                        🎤 {artist.name}
                      </CommonItem>
                    ))}
                  </CommonItemsList>
                )}
              </ComparisonCard>

              <ComparisonCard>
                <CardTitle>
                  🎼 {t('comparison.commonGenres')}
                </CardTitle>
                <StatItem>
                  <StatLabel>{t('comparison.sharedItems')}</StatLabel>
                  <StatValue>{comparison.details.sharedGenres}</StatValue>
                </StatItem>
                {comparison.commonItems?.genres?.length > 0 && (
                  <CommonItemsList>
                    {comparison.commonItems.genres.slice(0, 5).map((genre, index) => (
                      <CommonItem key={index}>
                        🎼 {genre}
                      </CommonItem>
                    ))}
                  </CommonItemsList>
                )}
              </ComparisonCard>
            </ComparisonGrid>
          </ComparisonSection>
        )}

        {comparisonLoading && (
          <ComparisonSection>
            <SectionTitle>🎯 {t('comparison.title')}</SectionTitle>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <LoadingSpinner size="medium" text={t('comparison.loading')} />
            </div>
          </ComparisonSection>
        )}

        {comparisonError && (
          <ComparisonSection>
            <SectionTitle>🎯 {t('comparison.title')}</SectionTitle>
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-error)' }}>
              <p>{comparisonError}</p>
            </div>
          </ComparisonSection>
        )}

        {/* Time Range Filter */}
        <TimeRangeFilter
          selectedRange={selectedTimeRange}
          onRangeChange={setSelectedTimeRange}
          showDescription={true}
        />

        {/* Genre Statistics */}
        {genreStats.length > 0 && (
          <MusicSection>
            <SectionTitle>🎵 {t('music.genres')}</SectionTitle>
            <GenreStats
              genreStats={genreStats}
              totalTracks={topTracks.length}
              allGenres={genreStats.map(g => g.name)}
            />
          </MusicSection>
        )}

        {/* Top Tracks */}
        {topTracks.length > 0 && (
          <MusicSection>
            <SectionTitle>🔥 {t('music.topTracks')} - {getTimeRangeTitle()}</SectionTitle>
            <TrackList
              tracks={topTracks}
              loading={musicLoading}
              error={null}
              title={t('friends.userTopTracks', { name: friendProfile.displayName })}
              subtitle={t('music.tracksCount', { count: topTracks.length })}
            />
          </MusicSection>
        )}

        {/* No Music Data */}
        {topTracks.length === 0 && genreStats.length === 0 && !musicLoading && (
          <ErrorContainer>
            <h3>🎵 {t('music.noData')}</h3>
            <p>{t('friends.noMusicDataShared', { name: friendProfile.displayName })}</p>
          </ErrorContainer>
        )}
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default FriendProfilePage;
