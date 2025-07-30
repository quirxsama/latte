import apiClient from './apiClient';

class SearchAPI {
  // Search users
  async searchUsers(searchTerm, limit = 10) {
    try {
      const response = await apiClient.get('/search/users', {
        params: { q: searchTerm, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  // Search user's tracks
  async searchTracks(searchTerm, timeRange = 'medium_term') {
    try {
      const response = await apiClient.get('/search/tracks', {
        params: { q: searchTerm, timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Search tracks error:', error);
      throw error;
    }
  }

  // Search user's artists
  async searchArtists(searchTerm, timeRange = 'medium_term') {
    try {
      const response = await apiClient.get('/search/artists', {
        params: { q: searchTerm, timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Search artists error:', error);
      throw error;
    }
  }

  // Get search suggestions
  async getSearchSuggestions() {
    try {
      const response = await apiClient.get('/search/suggestions');
      return response.data;
    } catch (error) {
      console.error('Get search suggestions error:', error);
      throw error;
    }
  }
}

const searchApi = new SearchAPI();
export default searchApi;
