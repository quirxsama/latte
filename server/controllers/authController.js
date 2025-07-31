const sqliteDB = require('../config/sqlite');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  });
};

// Register or login user with Spotify data
const spotifyAuth = async (req, res) => {
  try {
    const { 
      spotifyId, 
      email, 
      displayName, 
      profileImage, 
      country, 
      followers 
    } = req.body;

    if (!spotifyId || !email || !displayName) {
      return res.status(400).json({ 
        message: 'Missing required Spotify user data' 
      });
    }

    // Check if user already exists
    let user = sqliteDB.getUserBySpotifyId(spotifyId);

    if (user) {
      // Update existing user data
      user = sqliteDB.updateUser(user.id, {
        email,
        displayName,
        profileImage,
        country,
        followers: followers || 0,
        lastLogin: new Date().toISOString()
      });
    } else {
      // Create new user
      user = sqliteDB.createUser({
        spotifyId,
        email,
        displayName,
        profileImage,
        country,
        followers: followers || 0
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        spotifyId: user.spotifyId,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        country: user.country,
        followers: user.followers,
        privacy: user.privacy,
        settings: user.settings,

        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Spotify auth error:', error);
    res.status(500).json({ 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = sqliteDB.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        spotifyId: user.spotifyId,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        country: user.country,
        followers: user.followers,
        privacy: user.privacy,
        settings: user.settings,
        musicStats: user.musicStats,

        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['displayName', 'privacy', 'settings'];
    
    // Filter allowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = sqliteDB.updateUser(req.userId, filteredUpdates);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        displayName: user.displayName,
        privacy: user.privacy,
        settings: user.settings
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update music statistics
const updateMusicStats = async (req, res) => {
  try {
    const { topTracks, topArtists, topGenres } = req.body;

    const user = sqliteDB.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare music stats update
    const musicStats = user.musicStats || {};

    if (topTracks) {
      musicStats.topTracks = topTracks.map(track => ({
        spotifyId: track.id,
        name: track.name,
        artists: track.artists.map(a => a.name),
        playCount: track.popularity || 0,
        timeRange: req.body.timeRange || 'medium_term',
        lastUpdated: new Date().toISOString()
      }));
    }

    if (topArtists) {
      musicStats.topArtists = topArtists.map(artist => ({
        spotifyId: artist.id,
        name: artist.name,
        genres: artist.genres || [],
        playCount: artist.popularity || 0,
        timeRange: req.body.timeRange || 'medium_term',
        lastUpdated: new Date().toISOString()
      }));
    }

    if (topGenres) {
      musicStats.topGenres = topGenres;
    }

    // Update user with new music stats
    sqliteDB.updateUser(req.userId, {
      musicStats,
      lastDataUpdate: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Music statistics updated successfully'
    });

  } catch (error) {
    console.error('Update music stats error:', error);
    res.status(500).json({ 
      message: 'Failed to update music statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  spotifyAuth,
  getProfile,
  updateProfile,
  updateMusicStats
};
