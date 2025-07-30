import { useState, useEffect, useCallback } from 'react';
import spotifyApi from '../services/spotifyApi';

export const useSpotifyPlayer = () => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        // Wait for Spotify Web Playback SDK to load
        if (!window.Spotify || !window.SpotifySDKReady) {
          // Wait for SDK to be ready
          const handleSDKReady = () => {
            initializePlayer();
          };

          if (!window.SpotifySDKReady) {
            window.addEventListener('SpotifySDKReady', handleSDKReady, { once: true });
            return;
          }
        }

        // Get token from auth service
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          setError('No access token available');
          return;
        }

        const spotifyPlayer = new window.Spotify.Player({
          name: 'Latte Music Player',
          getOAuthToken: (cb) => {
            const currentToken = localStorage.getItem('spotify_access_token');
            cb(currentToken);
          },
          volume: volume / 100,
        });

        // Error handling
        spotifyPlayer.addListener('initialization_error', ({ message }) => {
          console.error('Initialization Error:', message);
          setError(`Initialization Error: ${message}`);
        });

        spotifyPlayer.addListener('authentication_error', ({ message }) => {
          console.error('Authentication Error:', message);
          setError(`Authentication Error: ${message}`);
        });

        spotifyPlayer.addListener('account_error', ({ message }) => {
          console.error('Account Error:', message);
          setError(`Account Error: ${message}`);
        });

        spotifyPlayer.addListener('playback_error', ({ message }) => {
          console.error('Playback Error:', message);
          setError(`Playback Error: ${message}`);
        });

        // Playback status updates
        spotifyPlayer.addListener('player_state_changed', (state) => {
          if (!state) return;

          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
          setPosition(state.position);
          setDuration(state.duration);
        });

        // Ready
        spotifyPlayer.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
          setIsReady(true);
          setError(null);
        });

        // Not Ready
        spotifyPlayer.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
          setIsReady(false);
        });

        // Connect to the player
        const connected = await spotifyPlayer.connect();
        if (connected) {
          setPlayer(spotifyPlayer);
        } else {
          setError('Failed to connect to Spotify player');
        }

      } catch (error) {
        console.error('Error initializing player:', error);
        setError('Failed to initialize player');
      }
    };

    initializePlayer();

    // Cleanup
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  // Play track
  const playTrack = useCallback(async (trackUri, contextUri = null) => {
    try {
      if (!deviceId) {
        throw new Error('No device available');
      }

      const playOptions = {
        device_id: deviceId,
      };

      if (contextUri) {
        playOptions.context_uri = contextUri;
        playOptions.offset = { uri: trackUri };
      } else {
        playOptions.uris = [trackUri];
      }

      await spotifyApi.startPlayback(deviceId, contextUri, contextUri ? null : [trackUri]);
      setError(null);
    } catch (error) {
      console.error('Error playing track:', error);
      setError('Failed to play track');
    }
  }, [deviceId]);

  // Toggle play/pause
  const togglePlayback = useCallback(async () => {
    try {
      if (!deviceId) {
        throw new Error('No device available');
      }

      if (isPlaying) {
        await spotifyApi.pausePlayback(deviceId);
      } else {
        await spotifyApi.startPlayback(deviceId);
      }
      setError(null);
    } catch (error) {
      console.error('Error toggling playback:', error);
      setError('Failed to toggle playback');
    }
  }, [deviceId, isPlaying]);

  // Skip to next track
  const skipToNext = useCallback(async () => {
    try {
      if (!deviceId) {
        throw new Error('No device available');
      }

      await spotifyApi.skipToNext(deviceId);
      setError(null);
    } catch (error) {
      console.error('Error skipping to next:', error);
      setError('Failed to skip to next track');
    }
  }, [deviceId]);

  // Skip to previous track
  const skipToPrevious = useCallback(async () => {
    try {
      if (!deviceId) {
        throw new Error('No device available');
      }

      await spotifyApi.skipToPrevious(deviceId);
      setError(null);
    } catch (error) {
      console.error('Error skipping to previous:', error);
      setError('Failed to skip to previous track');
    }
  }, [deviceId]);

  // Set volume
  const setPlayerVolume = useCallback(async (newVolume) => {
    try {
      if (!deviceId) {
        throw new Error('No device available');
      }

      const volumePercent = Math.max(0, Math.min(100, newVolume));
      await spotifyApi.setVolume(volumePercent, deviceId);
      setVolume(volumePercent);
      
      // Also update the player volume
      if (player) {
        await player.setVolume(volumePercent / 100);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error setting volume:', error);
      setError('Failed to set volume');
    }
  }, [deviceId, player]);

  // Seek to position
  const seekToPosition = useCallback(async (positionMs) => {
    try {
      if (!player) {
        throw new Error('Player not available');
      }

      await player.seek(positionMs);
      setPosition(positionMs);
      setError(null);
    } catch (error) {
      console.error('Error seeking:', error);
      setError('Failed to seek to position');
    }
  }, [player]);

  return {
    player,
    deviceId,
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    isReady,
    error,
    playTrack,
    togglePlayback,
    skipToNext,
    skipToPrevious,
    setPlayerVolume,
    seekToPosition,
  };
};
