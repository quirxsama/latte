const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  validateSpotifyAuth,
  validateProfileUpdate,
  createUserRateLimit
} = require('../middleware/validation');
const {
  spotifyAuth,
  getProfile,
  updateProfile,
  updateMusicStats
} = require('../controllers/authController');

// User-specific rate limiting
const userRateLimit = createUserRateLimit(15 * 60 * 1000, 50); // 50 requests per 15 minutes per user

// POST /api/auth/spotify - Authenticate with Spotify
router.post('/spotify', validateSpotifyAuth, spotifyAuth);

// GET /api/auth/profile - Get current user profile
router.get('/profile', auth, userRateLimit, getProfile);

// PUT /api/auth/profile - Update user profile
router.put('/profile', auth, userRateLimit, validateProfileUpdate, updateProfile);

// POST /api/auth/music-stats - Update music statistics
router.post('/music-stats', auth, userRateLimit, updateMusicStats);

module.exports = router;
