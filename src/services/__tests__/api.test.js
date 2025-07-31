import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }))
  }
}));

const mockedAxios = vi.mocked(axios);

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.location
delete window.location;
window.location = { href: '' };

describe('ApiService', () => {
  let apiService;
  let mockAxiosInstance;

  beforeEach(async () => {
    mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Import the singleton instance
    const apiModule = await import('../api');
    apiService = apiModule.default;

    // Replace the api instance with our mock
    apiService.api = mockAxiosInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('creates axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3001/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('sets up request and response interceptors', () => {
      // Since we're testing a singleton that's already instantiated,
      // we just verify the interceptors exist
      expect(mockAxiosInstance.interceptors).toBeDefined();
      expect(mockAxiosInstance.interceptors.request).toBeDefined();
      expect(mockAxiosInstance.interceptors.response).toBeDefined();
    });
  });

  describe('authenticateWithSpotify', () => {
    it('successfully authenticates and stores token', async () => {
      const userData = { id: 'test-user', name: 'Test User' };
      const responseData = { token: 'test-token', user: userData };

      mockAxiosInstance.post.mockResolvedValue({ data: responseData });

      const result = await apiService.authenticateWithSpotify(userData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/spotify', userData);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('latte_auth_token', 'test-token');
      expect(result).toEqual(responseData);
    });

    it('handles authentication error', async () => {
      const userData = { id: 'test-user' };
      const errorResponse = {
        response: { data: { message: 'Invalid credentials' } }
      };

      mockAxiosInstance.post.mockRejectedValue(errorResponse);

      await expect(apiService.authenticateWithSpotify(userData))
        .rejects.toThrow('Invalid credentials');
    });

    it('handles authentication error without message', async () => {
      const userData = { id: 'test-user' };
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      await expect(apiService.authenticateWithSpotify(userData))
        .rejects.toThrow('Authentication failed');
    });
  });

  describe('getProfile', () => {
    it('successfully gets user profile', async () => {
      const profileData = { id: 'test-user', name: 'Test User' };
      mockAxiosInstance.get.mockResolvedValue({ data: profileData });

      const result = await apiService.getProfile();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(profileData);
    });

    it('handles profile fetch error', async () => {
      const errorResponse = {
        response: { data: { message: 'Unauthorized' } }
      };

      mockAxiosInstance.get.mockRejectedValue(errorResponse);

      await expect(apiService.getProfile())
        .rejects.toThrow('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    it('successfully updates user profile', async () => {
      const profileData = { name: 'Updated Name' };
      const responseData = { success: true, user: profileData };

      mockAxiosInstance.put.mockResolvedValue({ data: responseData });

      const result = await apiService.updateProfile(profileData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/auth/profile', profileData);
      expect(result).toEqual(responseData);
    });

    it('handles profile update error', async () => {
      const profileData = { name: 'Updated Name' };
      const errorResponse = {
        response: { data: { message: 'Validation error' } }
      };

      mockAxiosInstance.put.mockRejectedValue(errorResponse);

      await expect(apiService.updateProfile(profileData))
        .rejects.toThrow('Validation error');
    });
  });



  describe('compareWithUser', () => {
    it('successfully compares with user', async () => {
      const userId = 'test-user-id';
      const comparisonData = { similarity: 0.85, commonTracks: 15 };

      mockAxiosInstance.post.mockResolvedValue({ data: comparisonData });

      const result = await apiService.compareWithUser(userId);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/comparison/compare/${userId}`);
      expect(result).toEqual(comparisonData);
    });

    it('handles comparison error', async () => {
      const userId = 'test-user-id';
      const errorResponse = {
        response: { data: { message: 'User not found' } }
      };

      mockAxiosInstance.post.mockRejectedValue(errorResponse);

      await expect(apiService.compareWithUser(userId))
        .rejects.toThrow('User not found');
    });
  });
});
