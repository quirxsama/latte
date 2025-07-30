import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { UI_CONFIG } from '../../constants/spotify';
import { useSpotifyPlayer } from '../../hooks/useSpotifyPlayer';
import Button from '../common/Button';

const PlayerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(25, 20, 20, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${UI_CONFIG.SPACING.MD};
  z-index: 1000;
  transform: translateY(${props => props.isVisible ? '0' : '100%'});
  transition: transform 0.3s ease;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    padding: ${UI_CONFIG.SPACING.SM};
  }
`;

const PlayerContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: ${UI_CONFIG.SPACING.MD};
  align-items: center;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
    gap: ${UI_CONFIG.SPACING.SM};
    text-align: center;
  }
`;

const TrackInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.MD};
  min-width: 0;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET}) {
    justify-content: center;
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    gap: ${UI_CONFIG.SPACING.SM};
  }
`;

const AlbumArt = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    width: 48px;
    height: 48px;
  }
`;

const TrackDetails = styled.div`
  min-width: 0;
  flex: 1;
`;

const TrackName = styled.div`
  color: ${UI_CONFIG.COLORS.WHITE};
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 0.85rem;
  }
`;

const ArtistName = styled.div`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 0.75rem;
  }
`;

const PlayerControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.SM};
`;

const ControlButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.SM};
`;

const ControlButton = styled(Button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &.play-button {
    width: 48px;
    height: 48px;
  }

  svg {
    width: 20px;
    height: 20px;
  }

  &.play-button svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    width: 36px;
    height: 36px;

    &.play-button {
      width: 44px;
      height: 44px;
    }

    svg {
      width: 18px;
      height: 18px;
    }

    &.play-button svg {
      width: 22px;
      height: 22px;
    }
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.SM};
  width: 100%;
  max-width: 500px;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    max-width: 300px;
  }
`;

const TimeDisplay = styled.span`
  color: ${UI_CONFIG.COLORS.SPOTIFY_LIGHT_GRAY};
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  min-width: 40px;
  text-align: center;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    font-size: 0.7rem;
    min-width: 35px;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  position: relative;

  &:hover {
    height: 6px;
  }
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
  border-radius: 2px;
  width: ${props => props.progress}%;
  transition: width 0.1s ease;
`;

const VolumeSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${UI_CONFIG.SPACING.SM};
  justify-self: end;

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.TABLET}) {
    justify-self: center;
  }
`;

const VolumeSlider = styled.input`
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: ${UI_CONFIG.COLORS.SPOTIFY_GREEN};
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  @media (max-width: ${UI_CONFIG.BREAKPOINTS.MOBILE}) {
    width: 80px;
  }
`;

// Icons
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const SkipPreviousIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
  </svg>
);

const SkipNextIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
  </svg>
);

const VolumeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

const formatTime = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const MusicPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    isReady,
    error,
    togglePlayback,
    skipToNext,
    skipToPrevious,
    setPlayerVolume,
    seekToPosition,
  } = useSpotifyPlayer();

  const [localVolume, setLocalVolume] = useState(volume);

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setLocalVolume(newVolume);
    setPlayerVolume(newVolume);
  };

  const handleProgressClick = (e) => {
    if (!duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newPosition = percentage * duration;
    
    seekToPosition(newPosition);
  };

  const progress = duration ? (position / duration) * 100 : 0;

  if (!currentTrack || !isReady) {
    return null;
  }

  return (
    <PlayerContainer isVisible={!!currentTrack}>
      <PlayerContent>
        <TrackInfo>
          <AlbumArt 
            src={currentTrack.album?.images?.[0]?.url || 'https://via.placeholder.com/56x56/191414/1DB954?text=♪'}
            alt={currentTrack.name}
          />
          <TrackDetails>
            <TrackName title={currentTrack.name}>
              {currentTrack.name}
            </TrackName>
            <ArtistName title={currentTrack.artists?.map(a => a.name).join(', ')}>
              {currentTrack.artists?.map(a => a.name).join(', ')}
            </ArtistName>
          </TrackDetails>
        </TrackInfo>

        <PlayerControls>
          <ControlButtons>
            <ControlButton
              variant="ghost"
              onClick={skipToPrevious}
              aria-label="Previous track"
            >
              <SkipPreviousIcon />
            </ControlButton>
            
            <ControlButton
              variant="primary"
              className="play-button"
              onClick={togglePlayback}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </ControlButton>
            
            <ControlButton
              variant="ghost"
              onClick={skipToNext}
              aria-label="Next track"
            >
              <SkipNextIcon />
            </ControlButton>
          </ControlButtons>

          <ProgressContainer>
            <TimeDisplay>{formatTime(position)}</TimeDisplay>
            <ProgressBar onClick={handleProgressClick}>
              <ProgressFill progress={progress} />
            </ProgressBar>
            <TimeDisplay>{formatTime(duration)}</TimeDisplay>
          </ProgressContainer>
        </PlayerControls>

        <VolumeSection>
          <VolumeIcon />
          <VolumeSlider
            type="range"
            min="0"
            max="100"
            value={localVolume}
            onChange={handleVolumeChange}
            aria-label="Volume"
          />
        </VolumeSection>
      </PlayerContent>

      {error && (
        <div style={{ 
          color: '#ff4757', 
          fontSize: '0.8rem', 
          textAlign: 'center', 
          marginTop: '8px' 
        }}>
          {error}
        </div>
      )}
    </PlayerContainer>
  );
};

export default MusicPlayer;
