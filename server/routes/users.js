const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/search - Search users for comparison
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      _id: { $ne: req.userId },
      'privacy.allowComparison': true,
      $or: [
        { displayName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('displayName profileImage country followers musicStats.topGenres')
    .limit(parseInt(limit));

    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        displayName: user.displayName,
        profileImage: user.profileImage,
        country: user.country,
        followers: user.followers,
        topGenres: user.musicStats.topGenres.slice(0, 3)
      }))
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
    
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const users = await User.find({
      _id: { $ne: req.userId },
      'privacy.allowComparison': true
    })
    .select('displayName profileImage country followers musicStats')
    .limit(50);

    const similarities = users.map(user => {
      const similarity = currentUser.calculateSimilarity(user);
      return {
        user: {
          id: user._id,
          displayName: user.displayName,
          profileImage: user.profileImage,
          country: user.country,
          followers: user.followers,
          topGenres: user.musicStats.topGenres.slice(0, 3),
          totalGenres: user.musicStats.topGenres.length
        },
        ...similarity
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
    const user = await User.findById(req.params.id)
      .select('displayName profileImage country followers musicStats privacy createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.privacy.showProfile) {
      return res.status(403).json({ message: 'User profile is private' });
    }

    const publicProfile = {
      id: user._id,
      displayName: user.displayName,
      profileImage: user.profileImage,
      country: user.country,
      followers: user.followers,
      memberSince: user.createdAt
    };

    if (user.privacy.showTopTracks) {
      publicProfile.topTracks = user.musicStats.topTracks.slice(0, 10);
    }

    if (user.privacy.showTopArtists) {
      publicProfile.topArtists = user.musicStats.topArtists.slice(0, 10);
    }

    publicProfile.topGenres = user.musicStats.topGenres.slice(0, 5);

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

module.exports = router;
