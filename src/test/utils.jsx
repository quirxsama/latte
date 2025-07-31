import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { vi } from 'vitest';

// Mock data
export const mockUser = {
  id: 'test-user-id',
  display_name: 'Test User',
  email: 'test@example.com',
  images: [{ url: 'https://example.com/avatar.jpg' }],
  country: 'TR',
  followers: { total: 100 },
  external_urls: { spotify: 'https://open.spotify.com/user/test' }
};

export const mockTrack = {
  id: 'test-track-id',
  name: 'Test Track',
  artists: [{ name: 'Test Artist', id: 'test-artist-id' }],
  album: {
    name: 'Test Album',
    images: [{ url: 'https://example.com/album.jpg' }]
  },
  duration_ms: 180000,
  popularity: 75,
  preview_url: 'https://example.com/preview.mp3',
  external_urls: { spotify: 'https://open.spotify.com/track/test' }
};

export const mockTracks = Array.from({ length: 10 }, (_, i) => ({
  ...mockTrack,
  id: `test-track-${i}`,
  name: `Test Track ${i + 1}`,
}));

export const mockArtist = {
  id: 'test-artist-id',
  name: 'Test Artist',
  genres: ['pop', 'rock'],
  popularity: 80,
  images: [{ url: 'https://example.com/artist.jpg' }],
  followers: { total: 1000000 },
  external_urls: { spotify: 'https://open.spotify.com/artist/test' }
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialEntries = ['/'],
    authValue = {
      isAuthenticated: true,
      user: mockUser,
      loading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      handleCallback: vi.fn(),
      refreshAuth: vi.fn(),
      checkAuthStatus: vi.fn(),
    },
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider value={authValue}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock API responses
export const mockApiResponses = {
  topTracks: {
    items: mockTracks,
    total: 50,
    limit: 20,
    offset: 0,
    href: 'https://api.spotify.com/v1/me/top/tracks',
    next: null,
    previous: null
  },
  
  topArtists: {
    items: Array.from({ length: 10 }, (_, i) => ({
      ...mockArtist,
      id: `test-artist-${i}`,
      name: `Test Artist ${i + 1}`,
    })),
    total: 50,
    limit: 20,
    offset: 0,
    href: 'https://api.spotify.com/v1/me/top/artists',
    next: null,
    previous: null
  },

  userProfile: mockUser,

  searchResults: {
    tracks: {
      items: mockTracks.slice(0, 5),
      total: 100
    },
    artists: {
      items: [mockArtist],
      total: 50
    }
  }
};

// Mock localStorage helpers
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock axios responses
export const createMockAxiosResponse = (data, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

// Test helpers
export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved } = await import('@testing-library/react');
  await waitForElementToBeRemoved(() => document.querySelector('[data-testid="loading-spinner"]'), {
    timeout: 3000
  });
};

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
  window.IntersectionObserverEntry = vi.fn();
};

// Mock fetch
export const mockFetch = (response, ok = true) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  );
};

// Error boundary test helper
export const ThrowError = ({ shouldThrow, children }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return children;
};

// Animation mock helper
export const mockAnimations = () => {
  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
  global.cancelAnimationFrame = vi.fn(id => clearTimeout(id));
  
  // Mock CSS animations
  Element.prototype.animate = vi.fn(() => ({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
  }));
};

// Cleanup helper
export const cleanup = () => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
};
