import apiClient from './apiClient';

class FriendsAPI {
  // Get user's friends list
  async getFriends() {
    try {
      const response = await apiClient.get('/friends');
      return response.data;
    } catch (error) {
      console.error('Get friends error:', error);
      throw error;
    }
  }

  // Send friend request
  async sendFriendRequest(userId) {
    try {
      const response = await apiClient.post(`/friends/request/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Send friend request error:', error);
      throw error;
    }
  }

  // Get friend requests (sent and received)
  async getFriendRequests() {
    try {
      const response = await apiClient.get('/friends/requests');
      return response.data;
    } catch (error) {
      console.error('Get friend requests error:', error);
      throw error;
    }
  }

  // Accept friend request
  async acceptFriendRequest(userId) {
    try {
      const response = await apiClient.post(`/friends/accept/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Accept friend request error:', error);
      throw error;
    }
  }

  // Reject friend request
  async rejectFriendRequest(userId) {
    try {
      const response = await apiClient.delete(`/friends/reject/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Reject friend request error:', error);
      throw error;
    }
  }

  // Remove friend
  async removeFriend(userId) {
    try {
      const response = await apiClient.delete(`/friends/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Remove friend error:', error);
      throw error;
    }
  }

  // Get friend's music data (for comparison)
  async getFriendMusicData(userId, timeRange = 'medium_term') {
    try {
      const response = await apiClient.get(`/users/${userId}/music-data`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Get friend music data error:', error);
      throw error;
    }
  }
}

const friendsApi = new FriendsAPI();
export default friendsApi;
