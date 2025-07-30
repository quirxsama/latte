const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  spotifyAuth,
  getProfile,
  updateProfile,
  updateMusicStats
} = require('../controllers/authController');

// POST /api/auth/spotify - Authenticate with Spotify
router.post('/spotify', spotifyAuth);

// GET /api/auth/profile - Get current user profile
router.get('/profile', auth, getProfile);

// PUT /api/auth/profile - Update user profile
router.put('/profile', auth, updateProfile);

// POST /api/auth/music-stats - Update music statistics
router.post('/music-stats', auth, updateMusicStats);

module.exports = router;
