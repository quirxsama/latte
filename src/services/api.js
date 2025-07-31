import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001/api';

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
      if (response.data.user?.id) {
        localStorage.setItem('userId', response.data.user.id.toString());
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

  // Friends endpoints
  async getFriends() {
    try {
      const response = await this.api.get('/friends');
      return response.data;
    } catch (error) {
      console.error('Get friends error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get friends');
    }
  }

  async searchUsers(query, limit = 20) {
    try {
      const response = await this.api.get('/friends/search', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search users');
    }
  }

  async getPendingFriendRequests() {
    try {
      const response = await this.api.get('/friends/requests/pending');
      return response.data;
    } catch (error) {
      console.error('Get pending requests error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get pending requests');
    }
  }

  async getSentFriendRequests() {
    try {
      const response = await this.api.get('/friends/requests/sent');
      return response.data;
    } catch (error) {
      console.error('Get sent requests error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get sent requests');
    }
  }

  async sendFriendRequest(userId) {
    try {
      const response = await this.api.post('/friends/request', { userId });
      return response.data;
    } catch (error) {
      console.error('Send friend request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send friend request');
    }
  }

  async acceptFriendRequest(requestId) {
    try {
      const response = await this.api.post(`/friends/request/${requestId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Accept friend request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to accept friend request');
    }
  }

  async declineFriendRequest(requestId) {
    try {
      const response = await this.api.post(`/friends/request/${requestId}/decline`);
      return response.data;
    } catch (error) {
      console.error('Decline friend request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to decline friend request');
    }
  }

  async removeFriend(friendId) {
    try {
      const response = await this.api.delete(`/friends/${friendId}`);
      return response.data;
    } catch (error) {
      console.error('Remove friend error:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove friend');
    }
  }

  async getFriendProfile(friendId) {
    try {
      const response = await this.api.get(`/friends/${friendId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Get friend profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get friend profile');
    }
  }

  async updatePrivacySettings(settings) {
    try {
      const response = await this.api.put('/users/privacy', settings);
      return response.data;
    } catch (error) {
      console.error('Update privacy settings error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update privacy settings');
    }
  }

  async searchUsers(query) {
    try {
      const response = await this.api.get('/auth/search-users', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search users');
    }
  }

  async sendFriendRequest(userId) {
    try {
      const response = await this.api.post('/auth/send-friend-request', {
        userId
      });

      return response.data;
    } catch (error) {
      console.error('Send friend request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send friend request');
    }
  }

  async getFriendRequests() {
    try {
      const response = await this.api.get('/auth/friend-requests');
      return response.data;
    } catch (error) {
      console.error('Get friend requests error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get friend requests');
    }
  }

  async acceptFriendRequest(requestId) {
    try {
      const response = await this.api.post('/auth/accept-friend-request', {
        requestId
      });
      return response.data;
    } catch (error) {
      console.error('Accept friend request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to accept friend request');
    }
  }

  async rejectFriendRequest(requestId) {
    try {
      const response = await this.api.post('/auth/reject-friend-request', {
        requestId
      });
      return response.data;
    } catch (error) {
      console.error('Reject friend request error:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject friend request');
    }
  }

  // Get privacy settings
  async getPrivacySettings() {
    try {
      const response = await this.api.get('/auth/privacy-settings');
      return response.data;
    } catch (error) {
      console.error('Get privacy settings error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get privacy settings');
    }
  }

  // Update privacy settings
  async updatePrivacySettings(privacySettings) {
    try {
      const response = await this.api.put('/auth/privacy-settings', { privacySettings });
      return response.data;
    } catch (error) {
      console.error('Update privacy settings error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update privacy settings');
    }
  }

  // Get friend's profile
  async getFriendProfile(userId) {
    try {
      const response = await this.api.get(`/auth/user/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Get friend profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get friend profile');
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
