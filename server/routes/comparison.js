const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const sqliteDB = require('../config/sqlite');

// POST /api/comparison/compare/:userId - Compare with another user
router.post('/compare/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (targetUserId === req.userId) {
      return res.status(400).json({ message: 'Cannot compare with yourself' });
    }

    const currentUser = sqliteDB.getUserById(req.userId);
    const targetUser = sqliteDB.getUserById(parseInt(targetUserId));

    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    if (!targetUser.privacy?.allowComparison) {
      return res.status(403).json({ message: 'User does not allow comparisons' });
    }

    // Calculate similarity using SQLite compatibility function
    const comparisonResult = sqliteDB.calculateMusicCompatibility(req.userId, parseInt(targetUserId));

    // Get detailed comparison data
    const myTracks = currentUser.musicStats?.topTracks?.slice(0, 20) || [];
    const theirTracks = targetUser.musicStats?.topTracks?.slice(0, 20) || [];
    const myArtists = currentUser.musicStats?.topArtists?.slice(0, 20) || [];
    const theirArtists = targetUser.musicStats?.topArtists?.slice(0, 20) || [];
    const myGenres = currentUser.musicStats?.topGenres?.slice(0, 10) || [];
    const theirGenres = targetUser.musicStats?.topGenres?.slice(0, 10) || [];

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
          id: targetUser.id,
          displayName: targetUser.displayName,
          profileImage: targetUser.profileImage,
          country: targetUser.country,
          followers: targetUser.followers
        },
        similarity: comparisonResult.compatibility,
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

    // For now, return empty history since we're not storing comparison history in SQLite
    // This can be implemented later if needed
    res.json({
      success: true,
      comparisons: [],
      pagination: {
        currentPage: parseInt(page),
        totalComparisons: 0,
        hasMore: false
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
    // For now, return empty leaderboard since we're not storing comparison history
    // This can be implemented later if needed
    res.json({
      success: true,
      leaderboard: []
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
