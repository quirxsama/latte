const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const sqliteDB = require('../config/sqlite');

// GET /api/users/search - Search users for comparison
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = sqliteDB.searchUsers(q, req.userId, parseInt(limit));

    const results = users
      .filter(user => user.privacy?.allowComparison)
      .map(user => ({
        id: user.id,
        displayName: user.displayName,
        profileImage: user.profileImage,
        country: user.country,
        followers: user.followers,
        topGenres: user.musicStats?.topGenres?.slice(0, 3) || []
      }));

    res.json({
      success: true,
      users: results
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ 
      message: 'Failed to search users',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/users/similar - Find users with similar music taste
router.get('/similar', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const currentUser = sqliteDB.getUserById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all users except current user who allow comparison
    const stmt = sqliteDB.db.prepare(`
      SELECT * FROM users
      WHERE id != ?
      AND JSON_EXTRACT(privacy_settings, '$.allowComparison') = 1
      LIMIT 50
    `);
    const users = stmt.all(req.userId).map(user => sqliteDB.formatUser(user));

    const similarities = users.map(user => {
      const compatibility = sqliteDB.calculateMusicCompatibility(req.userId, user.id);
      return {
        user: {
          id: user.id,
          displayName: user.displayName,
          profileImage: user.profileImage,
          country: user.country,
          followers: user.followers,
          topGenres: user.musicStats?.topGenres?.slice(0, 3) || [],
          totalGenres: user.musicStats?.topGenres?.length || 0
        },
        similarity: compatibility.compatibility,
        details: compatibility.details
      };
    });

    const sortedSimilarities = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      similarUsers: sortedSimilarities
    });

  } catch (error) {
    console.error('Similar users error:', error);
    res.status(500).json({
      message: 'Failed to find similar users',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/users/:id/public - Get public user profile
router.get('/:id/public', auth, async (req, res) => {
  try {
    const user = sqliteDB.getUserById(parseInt(req.params.id));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.privacy?.showProfile) {
      return res.status(403).json({ message: 'User profile is private' });
    }

    const publicProfile = {
      id: user.id,
      displayName: user.displayName,
      profileImage: user.profileImage,
      country: user.country,
      followers: user.followers,
      memberSince: user.createdAt
    };

    if (user.privacy?.showTopTracks) {
      publicProfile.topTracks = user.musicStats?.topTracks?.slice(0, 10) || [];
    }

    if (user.privacy?.showTopArtists) {
      publicProfile.topArtists = user.musicStats?.topArtists?.slice(0, 10) || [];
    }

    publicProfile.topGenres = user.musicStats?.topGenres?.slice(0, 5) || [];

    res.json({
      success: true,
      user: publicProfile
    });

  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// PUT /api/users/privacy - Update privacy settings
router.put('/privacy', auth, async (req, res) => {
  try {
    const { allowComparison, showProfile, showTopTracks, showTopArtists, allowFriendRequests } = req.body;

    const privacySettings = {
      allowComparison: Boolean(allowComparison),
      showProfile: Boolean(showProfile),
      showTopTracks: Boolean(showTopTracks),
      showTopArtists: Boolean(showTopArtists),
      allowFriendRequests: Boolean(allowFriendRequests)
    };

    const updatedUser = sqliteDB.updateUser(req.userId, {
      privacy_settings: JSON.stringify(privacySettings)
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      message: 'Failed to update privacy settings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
