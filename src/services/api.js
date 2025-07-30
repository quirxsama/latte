import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('latte_auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('latte_auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async authenticateWithSpotify(userData) {
    try {
      const response = await this.api.post('/auth/spotify', userData);
      if (response.data.token) {
        localStorage.setItem('latte_auth_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Spotify auth error:', error);
      throw new Error(error.response?.data?.message || 'Authentication failed');
    }
  }

  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }

  async updateProfile(updates) {
    try {
      const response = await this.api.put('/auth/profile', updates);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async updateMusicStats(musicData) {
    try {
      const response = await this.api.post('/auth/music-stats', musicData);
      return response.data;
    } catch (error) {
      console.error('Update music stats error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update music stats');
    }
  }

  // User endpoints
  async searchUsers(query, limit = 10) {
    try {
      const response = await this.api.get('/users/search', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search users');
    }
  }

  async getSimilarUsers(limit = 10) {
    try {
      const response = await this.api.get('/users/similar', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get similar users error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get similar users');
    }
  }

  async getPublicProfile(userId) {
    try {
      const response = await this.api.get(`/users/${userId}/public`);
      return response.data;
    } catch (error) {
      console.error('Get public profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get user profile');
    }
  }

  // Comparison endpoints
  async compareWithUser(userId) {
    try {
      const response = await this.api.post(`/comparison/compare/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Compare users error:', error);
      throw new Error(error.response?.data?.message || 'Failed to compare users');
    }
  }

  async getComparisonHistory(page = 1, limit = 10) {
    try {
      const response = await this.api.get('/comparison/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get comparison history error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get comparison history');
    }
  }

  async getComparisonLeaderboard() {
    try {
      const response = await this.api.get('/comparison/leaderboard');
      return response.data;
    } catch (error) {
      console.error('Get comparison leaderboard error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get leaderboard');
    }
  }

  // Quiz endpoints
  async submitQuizScore(score, totalQuestions = 10) {
    try {
      const response = await this.api.post('/quiz/score', {
        score,
        totalQuestions
      });
      return response.data;
    } catch (error) {
      console.error('Submit quiz score error:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit quiz score');
    }
  }

  async getQuizStats() {
    try {
      const response = await this.api.get('/quiz/stats');
      return response.data;
    } catch (error) {
      console.error('Get quiz stats error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get quiz stats');
    }
  }

  async getQuizLeaderboard(type = 'average', limit = 10) {
    try {
      const response = await this.api.get('/quiz/leaderboard', {
        params: { type, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get quiz leaderboard error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get quiz leaderboard');
    }
  }

  async getQuizAchievements() {
    try {
      const response = await this.api.get('/quiz/achievements');
      return response.data;
    } catch (error) {
      console.error('Get quiz achievements error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get achievements');
    }
  }

  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem('latte_auth_token');
  }

  logout() {
    localStorage.removeItem('latte_auth_token');
  }

  getAuthToken() {
    return localStorage.getItem('latte_auth_token');
  }
}

export default new ApiService();
