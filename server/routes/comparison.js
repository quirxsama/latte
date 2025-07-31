const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// POST /api/comparison/compare/:userId - Compare with another user
router.post('/compare/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (targetUserId === req.userId) {
      return res.status(400).json({ message: 'Cannot compare with yourself' });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.userId),
      User.findById(targetUserId)
    ]);

    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    if (!targetUser.privacy.allowComparison) {
      return res.status(403).json({ message: 'User does not allow comparisons' });
    }

    // Calculate similarity
    const comparisonResult = currentUser.calculateSimilarity(targetUser);

    // Save comparison to both users' history
    const comparisonData = {
      withUser: targetUserId,
      comparedAt: new Date(),
      results: {
        similarity: comparisonResult.similarity,
        commonTracks: comparisonResult.commonTracks,
        commonArtists: comparisonResult.commonArtists,
        commonGenres: comparisonResult.commonGenres
      }
    };

    currentUser.comparisons.push(comparisonData);
    
    // Add to target user's comparison history (with current user)
    targetUser.comparisons.push({
      ...comparisonData,
      withUser: req.userId
    });

    await Promise.all([currentUser.save(), targetUser.save()]);

    // Get detailed comparison data
    const myTracks = currentUser.musicStats.topTracks.slice(0, 20);
    const theirTracks = targetUser.musicStats.topTracks.slice(0, 20);
    const myArtists = currentUser.musicStats.topArtists.slice(0, 20);
    const theirArtists = targetUser.musicStats.topArtists.slice(0, 20);
    const myGenres = currentUser.musicStats.topGenres.slice(0, 10);
    const theirGenres = targetUser.musicStats.topGenres.slice(0, 10);

    // Find common items
    const commonTracks = myTracks.filter(track => 
      theirTracks.some(t => t.spotifyId === track.spotifyId)
    );

    const commonArtists = myArtists.filter(artist => 
      theirArtists.some(a => a.spotifyId === artist.spotifyId)
    );

    const commonGenres = myGenres.filter(genre => 
      theirGenres.some(g => g.name === genre.name)
    );

    res.json({
      success: true,
      comparison: {
        targetUser: {
          id: targetUser._id,
          displayName: targetUser.displayName,
          profileImage: targetUser.profileImage,
          country: targetUser.country,
          followers: targetUser.followers
        },
        similarity: comparisonResult.similarity,
        details: comparisonResult.details,
        commonItems: {
          tracks: commonTracks,
          artists: commonArtists,
          genres: commonGenres
        },
        stats: {
          yourStats: {
            totalTracks: myTracks.length,
            totalArtists: myArtists.length,
            totalGenres: myGenres.length,
            totalTracks: myTracks.length
          },
          theirStats: {
            totalTracks: theirTracks.length,
            totalArtists: theirArtists.length,
            totalGenres: theirGenres.length,
            totalGenres: theirGenres.length
          }
        }
      }
    });

  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ 
      message: 'Failed to compare users',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/comparison/history - Get comparison history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findById(req.userId)
      .populate('comparisons.withUser', 'displayName profileImage country')
      .select('comparisons');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sortedComparisons = user.comparisons
      .sort((a, b) => new Date(b.comparedAt) - new Date(a.comparedAt))
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      comparisons: sortedComparisons.map(comp => ({
        id: comp._id,
        user: comp.withUser,
        similarity: comp.results.similarity,
        commonTracks: comp.results.commonTracks,
        commonArtists: comp.results.commonArtists,
        commonGenres: comp.results.commonGenres,
        comparedAt: comp.comparedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalComparisons: user.comparisons.length,
        hasMore: skip + parseInt(limit) < user.comparisons.length
      }
    });

  } catch (error) {
    console.error('Comparison history error:', error);
    res.status(500).json({ 
      message: 'Failed to get comparison history',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/comparison/leaderboard - Get similarity leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get top 10 most similar users from comparison history
    const topComparisons = user.comparisons
      .sort((a, b) => b.results.similarity - a.results.similarity)
      .slice(0, 10);

    const leaderboard = await Promise.all(
      topComparisons.map(async (comp) => {
        const comparedUser = await User.findById(comp.withUser)
          .select('displayName profileImage country followers');
        
        return {
          rank: topComparisons.indexOf(comp) + 1,
          user: comparedUser,
          similarity: comp.results.similarity,
          commonTracks: comp.results.commonTracks,
          commonArtists: comp.results.commonArtists,
          commonGenres: comp.results.commonGenres,
          comparedAt: comp.comparedAt
        };
      })
    );

    res.json({
      success: true,
      leaderboard: leaderboard.filter(item => item.user) // Filter out deleted users
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      message: 'Failed to get leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
