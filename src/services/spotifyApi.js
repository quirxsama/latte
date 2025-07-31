import axios from 'axios';
import { SPOTIFY_CONFIG, SPOTIFY_ENDPOINTS } from '../constants/spotify';
import { RateLimiter, SimpleCache } from '../utils/performance';
import spotifyAuth from './spotifyAuth';

class SpotifyApiService {
  constructor() {
    this.api = axios.create({
      baseURL: SPOTIFY_CONFIG.API_BASE_URL,
      timeout: 10000,
    });

    // Initialize rate limiter and cache
    this.rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
    this.cache = new SimpleCache(50, 300000); // 50 items, 5 minutes TTL

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await spotifyAuth.getValidAccessToken();
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        } catch (error) {
          console.error('Failed to get access token:', error);
          return Promise.reject(error);
        }
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          try {
            await spotifyAuth.refreshAccessToken();
            // Retry the original request
            const originalRequest = error.config;
            const token = await spotifyAuth.getValidAccessToken();
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            spotifyAuth.logout();
            window.location.href = '/';
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 429) {
          // Rate limited
          const retryAfter = error.response.headers['retry-after'];
          console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
          
          // You could implement retry logic here
          return Promise.reject(new Error(`Rate limited. Please try again in ${retryAfter} seconds.`));
        }

        return Promise.reject(error);
      }
    );
  }

  // Get user's profile
  async getUserProfile() {
    try {
      const response = await this.api.get('/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  // Get user's top tracks with caching and rate limiting
  async getTopTracks(timeRange = 'medium_term', limit = 30, offset = 0) {
    const cacheKey = `top_tracks_${timeRange}_${limit}_${offset}`;

    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Check rate limit
      this.rateLimiter.makeRequest();

      const response = await this.api.get('/me/top/tracks', {
        params: {
          time_range: timeRange, // short_term, medium_term, long_term
          limit: Math.min(limit, 50), // Spotify API limit is 50
          offset: offset,
          market: 'from_token', // Use user's market for better preview availability
        },
      });

      // Cache the response
      this.cache.set(cacheKey, response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        headers: error.config?.headers
      });

      // More specific error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access forbidden. This feature requires Spotify Premium or additional permissions.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (error.response?.status === 404) {
        throw new Error('Spotify API endpoint not found.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection.');
      }

      throw new Error(`Failed to fetch top tracks: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Get user's saved tracks (liked songs)
  async getCurrentUserSavedTracks(options = {}) {
    const { limit = 20, offset = 0, market = 'from_token' } = options;
    const cacheKey = `saved_tracks_${limit}_${offset}`;

    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Check rate limit
      this.rateLimiter.makeRequest();

      const response = await this.api.get('/me/tracks', {
        params: {
          limit: Math.min(limit, 50),
          offset: offset,
          market: market,
        },
      });

      // Cache the result
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw await this.makeRequest(() => this.api.get('/me/tracks', {
        params: {
          limit: Math.min(limit, 50),
          offset: offset,
          market: market,
        },
      }));
    }
  }

  // Get user's top artists
  async getTopArtists(timeRange = 'medium_term', limit = 30, offset = 0) {
    const cacheKey = `top_artists_${timeRange}_${limit}_${offset}`;

    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Check rate limit
      this.rateLimiter.makeRequest();

      const response = await this.api.get('/me/top/artists', {
        params: {
          time_range: timeRange,
          limit: Math.min(limit, 50),
          offset: offset,
        },
      });

      // Cache the response
      this.cache.set(cacheKey, response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching top artists:', error);
      throw new Error('Failed to fetch top artists');
    }
  }

  // Get multiple artists by IDs
  async getArtists(artistIds) {
    if (!artistIds || artistIds.length === 0) {
      return { artists: [] };
    }

    const cacheKey = `artists_${artistIds.sort().join(',')}`;

    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Check rate limit
      this.rateLimiter.makeRequest();

      const response = await this.api.get('/artists', {
        params: {
          ids: artistIds.slice(0, 50).join(','), // Spotify API limit is 50
        },
      });

      // Cache the response
      this.cache.set(cacheKey, response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching artists:', error);
      throw new Error('Failed to fetch artists');
    }
  }

  // Get track details
  async getTrack(trackId) {
    try {
      const response = await this.api.get(`/tracks/${trackId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching track:', error);
      throw new Error('Failed to fetch track details');
    }
  }

  // Get multiple tracks
  async getTracks(trackIds) {
    try {
      const response = await this.api.get('/tracks', {
        params: {
          ids: trackIds.join(','),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tracks:', error);
      throw new Error('Failed to fetch tracks');
    }
  }

  // Get user's current playback state
  async getCurrentPlayback() {
    try {
      const response = await this.api.get('/me/player');
      return response.data;
    } catch (error) {
      if (error.response?.status === 204) {
        // No active device
        return null;
      }
      console.error('Error fetching current playback:', error);
      throw new Error('Failed to fetch current playback state');
    }
  }

  // Start/Resume playback
  async startPlayback(deviceId = null, contextUri = null, uris = null, offset = null) {
    try {
      const data = {};
      if (contextUri) data.context_uri = contextUri;
      if (uris) data.uris = uris;
      if (offset) data.offset = offset;

      const params = deviceId ? { device_id: deviceId } : {};

      await this.api.put('/me/player/play', data, { params });
    } catch (error) {
      console.error('Error starting playback:', error);
      throw new Error('Failed to start playback');
    }
  }

  // Pause playback
  async pausePlayback(deviceId = null) {
    try {
      const params = deviceId ? { device_id: deviceId } : {};
      await this.api.put('/me/player/pause', {}, { params });
    } catch (error) {
      console.error('Error pausing playback:', error);
      throw new Error('Failed to pause playback');
    }
  }

  // Skip to next track
  async skipToNext(deviceId = null) {
    try {
      const params = deviceId ? { device_id: deviceId } : {};
      await this.api.post('/me/player/next', {}, { params });
    } catch (error) {
      console.error('Error skipping to next:', error);
      throw new Error('Failed to skip to next track');
    }
  }

  // Skip to previous track
  async skipToPrevious(deviceId = null) {
    try {
      const params = deviceId ? { device_id: deviceId } : {};
      await this.api.post('/me/player/previous', {}, { params });
    } catch (error) {
      console.error('Error skipping to previous:', error);
      throw new Error('Failed to skip to previous track');
    }
  }

  // Set volume
  async setVolume(volumePercent, deviceId = null) {
    try {
      const params = { 
        volume_percent: Math.max(0, Math.min(100, volumePercent))
      };
      if (deviceId) params.device_id = deviceId;

      await this.api.put('/me/player/volume', {}, { params });
    } catch (error) {
      console.error('Error setting volume:', error);
      throw new Error('Failed to set volume');
    }
  }

  // Get user's playlists
  async getUserPlaylists(userId, options = {}) {
    try {
      const params = {
        limit: options.limit || 20,
        offset: options.offset || 0
      };

      const response = await this.api.get(`/users/${userId}/playlists`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      throw new Error('Failed to fetch user playlists');
    }
  }

  // Get current user's playlists
  async getCurrentUserPlaylists(options = {}) {
    try {
      const params = {
        limit: options.limit || 20,
        offset: options.offset || 0
      };

      const response = await this.api.get('/me/playlists', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching current user playlists:', error);
      throw new Error('Failed to fetch current user playlists');
    }
  }

  // Get available devices
  async getDevices() {
    try {
      const response = await this.api.get('/me/player/devices');
      return response.data;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw new Error('Failed to fetch devices');
    }
  }

  // Transfer playback to device
  async transferPlayback(deviceIds, play = false) {
    try {
      await this.api.put('/me/player', {
        device_ids: deviceIds,
        play: play,
      });
    } catch (error) {
      console.error('Error transferring playback:', error);
      throw new Error('Failed to transfer playback');
    }
  }
}

export default new SpotifyApiService();
