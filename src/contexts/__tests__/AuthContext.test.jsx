import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { mockUser, mockApiResponses } from '../../test/utils';

// Mock the services
vi.mock('../../services/spotifyAuth', () => ({
  default: {
    isAuthenticated: vi.fn(),
    redirectToSpotifyAuth: vi.fn(),
    handleCallback: vi.fn(),
    logout: vi.fn(),
    refreshAccessToken: vi.fn(),
  }
}));

vi.mock('../../services/spotifyApi', () => ({
  default: {
    getUserProfile: vi.fn(),
  }
}));

vi.mock('../../services/api', () => ({
  default: {
    authenticateWithSpotify: vi.fn(),
    getProfile: vi.fn(),
    getAuthToken: vi.fn(),
  }
}));

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{auth.user ? auth.user.displayName : 'no-user'}</div>
      <div data-testid="error">{auth.error || 'no-error'}</div>
      <button onClick={auth.login} data-testid="login-btn">Login</button>
      <button onClick={auth.logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  let spotifyAuth, spotifyApi, apiService;

  beforeEach(async () => {
    // Import mocked modules
    spotifyAuth = (await import('../../services/spotifyAuth')).default;
    spotifyApi = (await import('../../services/spotifyApi')).default;
    apiService = (await import('../../services/api')).default;

    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    spotifyAuth.isAuthenticated.mockReturnValue(false);
    apiService.getAuthToken.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('provides auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('handles backend authentication on mount', async () => {
    const mockBackendUser = {
      user: {
        id: 1,
        displayName: 'Backend User',
        email: 'backend@test.com'
      }
    };

    apiService.getAuthToken.mockReturnValue('valid-backend-token');
    apiService.getProfile.mockResolvedValue(mockBackendUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Backend User');
    expect(apiService.getProfile).toHaveBeenCalled();
  });

  it('falls back to Spotify auth when backend fails', async () => {
    const mockSpotifyUser = {
      id: 'spotify-123',
      display_name: 'Spotify User',
      email: 'spotify@test.com'
    };

    apiService.getAuthToken.mockReturnValue('invalid-backend-token');
    apiService.getProfile.mockRejectedValue(new Error('Backend auth failed'));
    spotifyAuth.isAuthenticated.mockReturnValue(true);
    spotifyApi.getUserProfile.mockResolvedValue(mockSpotifyUser);
    apiService.authenticateWithSpotify.mockRejectedValue(new Error('Backend sync failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Spotify User');
    expect(spotifyApi.getUserProfile).toHaveBeenCalled();
  });

  it('handles successful backend sync with Spotify', async () => {
    const mockSpotifyUser = {
      id: 'spotify-123',
      display_name: 'Spotify User',
      email: 'spotify@test.com',
      images: [{ url: 'https://example.com/avatar.jpg' }],
      country: 'TR',
      followers: { total: 100 }
    };

    const mockBackendResponse = {
      user: {
        id: 1,
        displayName: 'Synced User',
        email: 'synced@test.com',
        settings: { language: 'en', theme: 'dark' }
      }
    };

    apiService.getAuthToken.mockReturnValue(null);
    spotifyAuth.isAuthenticated.mockReturnValue(true);
    spotifyApi.getUserProfile.mockResolvedValue(mockSpotifyUser);
    apiService.authenticateWithSpotify.mockResolvedValue(mockBackendResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Synced User');
    expect(apiService.authenticateWithSpotify).toHaveBeenCalledWith({
      spotifyId: 'spotify-123',
      email: 'spotify@test.com',
      displayName: 'Spotify User',
      profileImage: 'https://example.com/avatar.jpg',
      country: 'TR',
      followers: 100
    });
  });

  it('handles authentication errors gracefully', async () => {
    apiService.getAuthToken.mockReturnValue(null);
    spotifyAuth.isAuthenticated.mockReturnValue(true);
    spotifyApi.getUserProfile.mockRejectedValue(new Error('Spotify API error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Authentication check failed');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('clears both tokens on logout', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutBtn = screen.getByTestId('logout-btn');
    logoutBtn.click();

    expect(spotifyAuth.logout).toHaveBeenCalled();
    expect(localStorage.removeItem).toHaveBeenCalledWith('latte_auth_token');
  });
});
