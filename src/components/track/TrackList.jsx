import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
// import anime from 'animejs/lib/anime.es.js';
import { UI_CONFIG, ANIMATION_CONFIG } from '../../constants/spotify';
import TrackCard from './TrackCard';
import LoadingSpinner from '../common/LoadingSpinner';

const ListContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: ${UI_CONFIG.SPACING.XL} 0;
`;

const ListHeader = styled.div`
  text-align: center;
  margin-bottom: ${UI_CONFIG.SPACING.XXL};
`;

const Title = styled.h1`
  color: ${UI_CONFIG.COLORS.WHITE};
  margin-bottom: ${UI_CONFIG.SPACING.MD};
  background: linear-gradient(135deg, ${UI_CONFIG.COLORS.WHITE} 0%, ${UI_CONFIG.COLORS.SPOTIFY_GREEN} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TracksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${UI_CONFIG.SPACING.LG};
  padding: 0 ${UI_CONFIG.SPACING.MD};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET}) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: ${UI_CONFIG.SPACING.MD};
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: ${UI_CONFIG.SPACING.SM};
    padding: 0 ${UI_CONFIG.SPACING.SM};
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: ${UI_CONFIG.SPACING.MD};
  }
`;

const ScrollContainer = styled.div`
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #1ed760;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${UI_CONFIG.SPACING.XXL};
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};

  h3 {
    color: ${UI_CONFIG.COLORS.WHITE};
    margin-bottom: ${UI_CONFIG.SPACING.MD};
  }

  p {
    font-size: 1.125rem;
    line-height: 1.6;
  }
`;

const ErrorState = styled(EmptyState)`
  color: #ff4757;

  h3 {
    color: #ff4757;
  }
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: ${UI_CONFIG.SPACING.XL} auto 0;
  padding: ${UI_CONFIG.SPACING.MD} ${UI_CONFIG.SPACING.XL};
  background: transparent;
  border: 2px solid ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
  color: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    color: ${UI_CONFIG.COLORS.SPOTIFY_BLACK};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TrackList = ({
  tracks = [],
  loading = false,
  error = null,
  onTrackPlay,
  currentTrack = null,
  title,
  subtitle,
  onLoadMore = null,
  hasMore = false,
  loadingMore = false
}) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [visibleTracks, setVisibleTracks] = useState([]);

  useEffect(() => {
    if (tracks.length > 0) {
      // Simple animation without anime.js
      setVisibleTracks(tracks);

      if (containerRef.current) {
        const trackCards = containerRef.current.querySelectorAll('[data-track-card]');

        trackCards.forEach((card, index) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(50px)';

          setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 200 + (index * 100));
        });
      }
    }
  }, [tracks]);

  const handleTrackPlay = (track) => {
    if (onTrackPlay) {
      onTrackPlay(track);
    }
  };

  const isTrackPlaying = (track) => {
    return currentTrack && currentTrack.id === track.id;
  };

  if (loading && tracks.length === 0) {
    return (
      <ListContainer>
        <LoadingSpinner 
          size="large" 
          text="Loading your top tracks..." 
        />
      </ListContainer>
    );
  }

  if (error) {
    return (
      <ListContainer>
        <ErrorState>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
        </ErrorState>
      </ListContainer>
    );
  }

  if (!loading && tracks.length === 0) {
    return (
      <ListContainer>
        <EmptyState>
          <h3>No tracks found</h3>
          <p>We couldn't find any tracks in your listening history. Start listening to some music on Spotify!</p>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer ref={containerRef}>
      <ListHeader>
        <Title>{title || t('tracks.yourTopTracks')}</Title>
        <Subtitle>{subtitle || t('tracks.discoverMusic')}</Subtitle>
      </ListHeader>

      <ScrollContainer>
        <TracksGrid>
          {visibleTracks.map((track, index) => (
            <TrackCard
              key={track.id}
              track={track}
              onPlay={handleTrackPlay}
              isPlaying={isTrackPlaying(track)}
              animationDelay={index * 50}
              data-track-card
            />
          ))}
        </TracksGrid>

        {onLoadMore && hasMore && (
          <LoadMoreButton
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? t('common.loading') : t('tracks.loadMore')}
          </LoadMoreButton>
        )}

        {loadingMore && (
          <LoadingSpinner 
            size="medium" 
            text={t('tracks.loading')}
          />
        )}
      </ScrollContainer>
    </ListContainer>
  );
};

export default TrackList;
