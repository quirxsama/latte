const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const sqliteDB = require('../config/sqlite');

// GET /api/search/users?q=searchTerm - Search users
router.get('/users', auth, async (req, res) => {
  try {
    const { q: searchTerm, limit = 10 } = req.query;
    const currentUserId = req.userId;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        message: 'Search term must be at least 2 characters long'
      });
    }

    // Search users using SQLite
    const users = sqliteDB.searchUsers(searchTerm, currentUserId, parseInt(limit));

    // Filter only users with public profiles
    const usersWithStatus = users
      .filter(user => user.privacy?.showProfile)
      .map(user => ({
        id: user.id,
        displayName: user.displayName,
        profileImage: user.profileImage,
        spotifyId: user.spotifyId,
        country: user.country,
        followers: user.followers,
        relationshipStatus: user.relationshipStatus
      }));

    res.json({
      success: true,
      users: usersWithStatus,
      count: usersWithStatus.length,
      searchTerm
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      message: 'Failed to search users',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/search/tracks?q=searchTerm - Search user's tracks
router.get('/tracks', auth, async (req, res) => {
  try {
    const { q: searchTerm, timeRange = 'medium_term' } = req.query;
    const currentUserId = req.userId;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Search term must be at least 2 characters long' 
      });
    }

    const user = sqliteDB.getUserById(currentUserId);

    if (!user || !user.musicStats?.topTracks) {
      return res.json({
        success: true,
        tracks: [],
        count: 0,
        searchTerm
      });
    }

    // Filter tracks by search term and time range
    const filteredTracks = user.musicStats.topTracks.filter(track => {
      const matchesTimeRange = !timeRange || track.timeRange === timeRange;
      const matchesSearch = 
        track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artists.some(artist => 
          artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      return matchesTimeRange && matchesSearch;
    });

    // Sort by play count (if available) or by name
    filteredTracks.sort((a, b) => {
      if (a.playCount && b.playCount) {
        return b.playCount - a.playCount;
      }
      return a.name.localeCompare(b.name);
    });

    res.json({
      success: true,
      tracks: filteredTracks,
      count: filteredTracks.length,
      searchTerm,
      timeRange
    });

  } catch (error) {
    console.error('Search tracks error:', error);
    res.status(500).json({ 
      message: 'Failed to search tracks',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/search/artists?q=searchTerm - Search user's artists
router.get('/artists', auth, async (req, res) => {
  try {
    const { q: searchTerm, timeRange = 'medium_term' } = req.query;
    const currentUserId = req.userId;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Search term must be at least 2 characters long' 
      });
    }

    const user = sqliteDB.getUserById(currentUserId);
    
    if (!user || !user.musicStats.topArtists) {
      return res.json({
        success: true,
        artists: [],
        count: 0,
        searchTerm
      });
    }

    // Filter artists by search term and time range
    const filteredArtists = user.musicStats.topArtists.filter(artist => {
      const matchesTimeRange = !timeRange || artist.timeRange === timeRange;
      const matchesSearch = 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artist.genres && artist.genres.some(genre => 
          genre.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      return matchesTimeRange && matchesSearch;
    });

    // Sort by play count (if available) or by name
    filteredArtists.sort((a, b) => {
      if (a.playCount && b.playCount) {
        return b.playCount - a.playCount;
      }
      return a.name.localeCompare(b.name);
    });

    res.json({
      success: true,
      artists: filteredArtists,
      count: filteredArtists.length,
      searchTerm,
      timeRange
    });

  } catch (error) {
    console.error('Search artists error:', error);
    res.status(500).json({ 
      message: 'Failed to search artists',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', auth, async (req, res) => {
  try {
    const currentUserId = req.userId;

    const user = sqliteDB.getUserById(currentUserId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const suggestions = {
      recentTracks: [],
      topArtists: [],
      topGenres: []
    };

    // Get recent tracks (last 10)
    if (user.musicStats.topTracks) {
      suggestions.recentTracks = user.musicStats.topTracks
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
        .slice(0, 10)
        .map(track => track.name);
    }

    // Get top artists (last 10)
    if (user.musicStats.topArtists) {
      suggestions.topArtists = user.musicStats.topArtists
        .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
        .slice(0, 10)
        .map(artist => artist.name);
    }

    // Get top genres
    if (user.musicStats.topGenres) {
      suggestions.topGenres = user.musicStats.topGenres
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 10)
        .map(genre => genre.name);
    }

    res.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({ 
      message: 'Failed to get search suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
