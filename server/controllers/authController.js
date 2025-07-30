const User = require('../models/User');
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
    let user = await User.findOne({ spotifyId });

    if (user) {
      // Update existing user data
      user.email = email;
      user.displayName = displayName;
      user.profileImage = profileImage;
      user.country = country;
      user.followers = followers?.total || 0;
      user.lastLogin = new Date();
      
      await user.save();
    } else {
      // Create new user
      user = new User({
        spotifyId,
        email,
        displayName,
        profileImage,
        country,
        followers: followers?.total || 0,
        lastLogin: new Date()
      });
      
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        spotifyId: user.spotifyId,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        country: user.country,
        followers: user.followers,
        privacy: user.privacy,
        settings: user.settings,
        quizStats: user.quizStats,
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
    const user = await User.findById(req.userId).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        spotifyId: user.spotifyId,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        country: user.country,
        followers: user.followers,
        privacy: user.privacy,
        settings: user.settings,
        musicStats: user.musicStats,
        quizStats: user.quizStats,
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

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
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

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update music stats
    if (topTracks) {
      user.musicStats.topTracks = topTracks.map(track => ({
        spotifyId: track.id,
        name: track.name,
        artists: track.artists.map(a => a.name),
        playCount: track.popularity || 0,
        timeRange: req.body.timeRange || 'medium_term',
        lastUpdated: new Date()
      }));
    }

    if (topArtists) {
      user.musicStats.topArtists = topArtists.map(artist => ({
        spotifyId: artist.id,
        name: artist.name,
        genres: artist.genres || [],
        playCount: artist.popularity || 0,
        timeRange: req.body.timeRange || 'medium_term',
        lastUpdated: new Date()
      }));
    }

    if (topGenres) {
      user.musicStats.topGenres = topGenres;
    }

    user.lastDataUpdate = new Date();
    await user.save();

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
