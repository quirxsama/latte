import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
// import anime from 'animejs/lib/anime.es.js';
import { UI_CONFIG, ANIMATION_CONFIG } from '../../constants/spotify';
// import { create3DCardEffect } from '../../utils/animations';
import Button from '../common/Button';

const CardContainer = styled.div`
  position: relative;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 16px;
  padding: ${UI_CONFIG.SPACING.LG};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(29, 185, 84, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(29, 185, 84, 0.1) 50%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.MD};
    border-radius: 12px;
  }
`;

const AlbumArt = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: ${UI_CONFIG.SPACING.MD};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const PlayButton = styled(Button)`
  position: absolute;
  bottom: ${UI_CONFIG.SPACING.MD};
  right: ${UI_CONFIG.SPACING.MD};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  padding: 0;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 2;

  ${CardContainer}:hover & {
    opacity: 1;
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${UI_CONFIG.SPACING.XS};
`;

const TrackName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${UI_CONFIG.COLORS.WHITE};
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 1rem;
  }
`;

const ArtistName = styled.p`
  font-size: 0.9rem;
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 0.85rem;
  }
`;

const AlbumName = styled.p`
  font-size: 0.8rem;
  color: ${UI_CONFIG.COLORS.SPOTIFY_GRAY};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const TrackMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${UI_CONFIG.SPACING.SM};
  font-size: 0.75rem;
  color: ${UI_CONFIG.COLORS.SPOTIFY_GRAY};
`;

const Duration = styled.span`
  font-variant-numeric: tabular-nums;
`;

const Popularity = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.XS};
`;

const PopularityBar = styled.div`
  width: 40px;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.popularity}%;
    background: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    border-radius: 2px;
    transition: width 0.3s ease;
  }
`;

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const TrackCard = ({
  track,
  onPlay,
  isPlaying = false,
  className,
  animationDelay = 0
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      // Simple fade-in animation without anime.js
      cardRef.current.style.opacity = '0';
      cardRef.current.style.transform = 'translateY(30px)';

      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = 'all 0.5s ease-out';
          cardRef.current.style.opacity = '1';
          cardRef.current.style.transform = 'translateY(0)';
        }
      }, animationDelay);
    }
  }, [animationDelay]);

  const handleCardClick = () => {
    if (onPlay) {
      onPlay(track);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(track);
    }
  };

  if (!track) return null;

  const artists = track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist';
  const albumName = track.album?.name || 'Unknown Album';
  const imageUrl = track.album?.images?.[0]?.url || 'https://via.placeholder.com/300x300/191414/1DB954?text=No+Image';
  const duration = formatDuration(track.duration_ms);
  const popularity = track.popularity || 0;

  return (
    <CardContainer 
      ref={cardRef}
      className={className}
      onClick={handleCardClick}
    >
      <AlbumArt>
        <img 
          src={imageUrl} 
          alt={`${track.name} by ${artists}`}
          loading="lazy"
        />
        <PlayButton
          variant="primary"
          onClick={handlePlayClick}
          aria-label={`Play ${track.name}`}
        >
          <PlayIcon />
        </PlayButton>
      </AlbumArt>
      
      <TrackInfo>
        <TrackName title={track.name}>
          {track.name}
        </TrackName>
        <ArtistName title={artists}>
          {artists}
        </ArtistName>
        <AlbumName title={albumName}>
          {albumName}
        </AlbumName>
      </TrackInfo>

      <TrackMeta>
        <Duration>{duration}</Duration>
        <Popularity>
          <PopularityBar popularity={popularity} />
          <span>{popularity}%</span>
        </Popularity>
      </TrackMeta>
    </CardContainer>
  );
};

export default TrackCard;
