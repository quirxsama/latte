const sqliteDB = require('../config/sqlite');
const jwt = require('jsonwebtoken');
const axios = require('axios');

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

// Search users by user ID or display name
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = sqliteDB.searchUsers(query.trim(), 20);

    // Filter out current user and add relationship status
    const currentUserId = req.userId;

    const filteredUsers = users
      .filter(user => user.id !== currentUserId)
      .map(user => {
        let relationshipStatus = 'none';

        if (currentUserId && currentUserId > 0) {
          const friendship = sqliteDB.checkFriendship(currentUserId, user.id);
          const pendingRequest = sqliteDB.getFriendRequestStatus(currentUserId, user.id);
          relationshipStatus = friendship ? 'friends' : (pendingRequest ? 'pending' : 'none');
        }

        return {
          id: user.id,
          userId: user.userId,
          displayName: user.displayName,
          profileImage: user.profileImage,
          country: user.country,
          relationshipStatus
        };
      });

    res.json({
      success: true,
      users: filteredUsers,
      count: filteredUsers.length
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send friend request
const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body; // Target user's ID
    const senderId = req.userId; // Current user's ID

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if target user exists
    const targetUser = sqliteDB.getUserById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if they're already friends
    const existingFriendship = sqliteDB.checkFriendship(senderId, userId);
    if (existingFriendship) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if there's already a pending request
    const existingRequest = sqliteDB.getFriendRequestStatus(senderId, userId);
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Send friend request
    sqliteDB.sendFriendRequest(senderId, userId);

    res.json({
      success: true,
      message: 'Friend request sent successfully'
    });

  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get friend requests
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`🔍 Getting friend requests for user ID: ${userId}`);

    const requests = sqliteDB.getPendingFriendRequests(userId);
    console.log(`📬 Found ${requests ? requests.length : 0} pending requests:`, requests);

    res.json({
      success: true,
      requests: requests || [],
      count: requests ? requests.length : 0
    });

  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    sqliteDB.acceptFriendRequest(requestId, userId);

    res.json({
      success: true,
      message: 'Friend request accepted'
    });

  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Reject friend request
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.userId;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    sqliteDB.declineFriendRequest(requestId, userId);

    res.json({
      success: true,
      message: 'Friend request rejected'
    });

  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get privacy settings
const getPrivacySettings = async (req, res) => {
  try {
    const userId = req.userId;
    const user = sqliteDB.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const privacySettings = user.privacy_settings ? JSON.parse(user.privacy_settings) : {
      allowComparison: false,
      showProfile: true,
      showTopTracks: false,
      showTopArtists: false,
      allowFriendRequests: true
    };

    res.json({ success: true, privacySettings });
  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({ message: 'Failed to get privacy settings' });
  }
};

// Update privacy settings
const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.userId;
    const { privacySettings } = req.body;

    if (!privacySettings || typeof privacySettings !== 'object') {
      return res.status(400).json({ message: 'Invalid privacy settings' });
    }

    // Ensure required fields exist
    const updatedSettings = {
      allowComparison: privacySettings.allowComparison || false,
      showProfile: privacySettings.showProfile !== undefined ? privacySettings.showProfile : true,
      showTopTracks: privacySettings.showTopTracks || false,
      showTopArtists: privacySettings.showTopArtists || false,
      allowFriendRequests: privacySettings.allowFriendRequests !== undefined ? privacySettings.allowFriendRequests : true
    };

    sqliteDB.updateUserPrivacySettings(userId, JSON.stringify(updatedSettings));

    res.json({ success: true, message: 'Privacy settings updated successfully' });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ message: 'Failed to update privacy settings' });
  }
};

// Get friend's profile
const getFriendProfile = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { userId } = req.params;

    console.log('🔍 getFriendProfile - currentUserId:', currentUserId);
    console.log('🔍 getFriendProfile - requested userId:', userId);

    // Try to get friend by userId first, then by id
    let friend = sqliteDB.getUserByUserId(userId);
    if (!friend && !isNaN(userId)) {
      // If userId lookup failed and userId is numeric, try by id
      friend = sqliteDB.getUserById(parseInt(userId));
    }
    console.log('🔍 getFriendProfile - found friend:', friend ? 'YES' : 'NO');
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if they are friends
    const friendship = sqliteDB.getFriendship(currentUserId, friend.id);
    if (!friendship) {
      return res.status(403).json({ message: 'You are not friends with this user' });
    }


    // Check privacy settings
    console.log('🔍 Friend object:', friend);
    console.log('🔍 Friend privacy_settings (raw):', friend.privacy_settings);
    console.log('🔍 Friend privacy (parsed):', friend.privacy);

    const privacySettings = friend.privacy || {
      showProfile: true
    };

    console.log('🔍 Final privacySettings:', privacySettings);

    if (!privacySettings.showProfile) {
      return res.status(403).json({ message: 'This user has disabled profile viewing' });
    }

    // Return friend's profile with music stats
    const friendProfile = {
      id: friend.id,
      userId: friend.userId,
      displayName: friend.displayName,
      profileImage: friend.profileImage,
      country: friend.country,
      followers: friend.followers,
      musicStats: friend.musicStats || {},
      privacySettings: privacySettings
    };

    res.json({ success: true, profile: friendProfile });
  } catch (error) {
    console.error('Get friend profile error:', error);
    res.status(500).json({ message: 'Failed to get friend profile' });
  }
};

module.exports = {
  spotifyAuth,
  getProfile,
  updateProfile,
  updateMusicStats,
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getPrivacySettings,
  updatePrivacySettings,
  getFriendProfile
};
