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

const FriendProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendProfile, setFriendProfile] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('medium_term');

  useEffect(() => {
    loadFriendProfile();
  }, [userId]);

  const loadFriendProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getFriendProfile(userId);
      setFriendProfile(response.profile);
    } catch (error) {
      console.error('Load friend profile error:', error);
      setError(error.message || 'Failed to load friend profile');
    } finally {
      setLoading(false);
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
            ← Back to Friends
          </BackButton>
          <ErrorContainer>
            <h3>❌ Error Loading Profile</h3>
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
            ← Back to Friends
          </BackButton>
          <ErrorContainer>
            <h3>👤 Profile Not Found</h3>
            <p>This user's profile could not be found.</p>
          </ErrorContainer>
        </MainContent>
        <Footer />
      </PageContainer>
    );
  }

  const musicStats = friendProfile.musicStats || {};
  const topTracks = musicStats.topTracks || [];
  const topArtists = musicStats.topArtists || [];
  const genreStats = musicStats.genreStats || [];

  return (
    <PageContainer>
      <Header />
      <MainContent>
        <BackButton onClick={handleBack}>
          ← Back to Friends
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
            {friendProfile.followers > 0 && ` • ${friendProfile.followers} followers`}
          </ProfileInfo>
        </ProfileHeader>

        {/* Time Range Filter */}
        <TimeRangeFilter
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
          showDescription={true}
        />

        {/* Genre Statistics */}
        {genreStats.length > 0 && (
          <MusicSection>
            <SectionTitle>🎵 Music Genres</SectionTitle>
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
            <SectionTitle>🔥 Top Tracks - {getTimeRangeTitle()}</SectionTitle>
            <TrackList
              tracks={topTracks}
              loading={false}
              error={null}
              title={`${friendProfile.displayName}'s Top Tracks`}
              subtitle={`${topTracks.length} tracks`}
            />
          </MusicSection>
        )}

        {/* No Music Data */}
        {topTracks.length === 0 && genreStats.length === 0 && (
          <ErrorContainer>
            <h3>🎵 No Music Data</h3>
            <p>{friendProfile.displayName} hasn't shared their music statistics yet.</p>
          </ErrorContainer>
        )}
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default FriendProfilePage;
