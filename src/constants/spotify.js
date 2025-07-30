// Spotify API Configuration
export const SPOTIFY_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback',
  SCOPES: [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing'
  ].join(' '),
  API_BASE_URL: 'https://api.spotify.com/v1',
  ACCOUNTS_BASE_URL: 'https://accounts.spotify.com'
};

// API Endpoints
export const SPOTIFY_ENDPOINTS = {
  AUTHORIZE: `${SPOTIFY_CONFIG.ACCOUNTS_BASE_URL}/authorize`,
  TOKEN: `${SPOTIFY_CONFIG.ACCOUNTS_BASE_URL}/api/token`,
  TOP_TRACKS: `${SPOTIFY_CONFIG.API_BASE_URL}/me/top/tracks`,
  USER_PROFILE: `${SPOTIFY_CONFIG.API_BASE_URL}/me`,
  PLAYER: `${SPOTIFY_CONFIG.API_BASE_URL}/me/player`
};

// Animation Constants
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 300,
    NORMAL: 500,
    SLOW: 800
  },
  EASING: {
    EASE_OUT: 'easeOutCubic',
    EASE_IN: 'easeInCubic',
    EASE_IN_OUT: 'easeInOutCubic',
    ELASTIC: 'easeOutElastic'
  },
  TRANSFORMS: {
    SCALE_HOVER: 1.05,
    SCALE_ACTIVE: 0.95,
    ROTATE_3D: 15,
    TRANSLATE_Y: -10
  }
};

// UI Constants
export const UI_CONFIG = {
  BREAKPOINTS: {
    MOBILE: '768px',
    TABLET: '1024px',
    DESKTOP: '1200px'
  },
  COLORS: {
    SPOTIFY_GREEN: '#1DB954',
    SPOTIFY_BLACK: '#191414',
    SPOTIFY_DARK_GRAY: '#121212',
    SPOTIFY_GRAY: '#535353',
    SPOTIFY_LIGHT_GRAY: '#B3B3B3',
    WHITE: '#FFFFFF'
  },
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '16px',
    LG: '24px',
    XL: '32px',
    XXL: '48px'
  }
};
