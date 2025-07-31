const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  validateSpotifyAuth,
  validateProfileUpdate,
  createUserRateLimit
} = require('../middleware/validation');
const {
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

// GET /api/auth/search-users - Search users by user ID or display name
router.get('/search-users', auth, userRateLimit, searchUsers);

// POST /api/auth/send-friend-request - Send friend request
router.post('/send-friend-request', auth, userRateLimit, sendFriendRequest);

// GET /api/auth/friend-requests - Get pending friend requests
router.get('/friend-requests', auth, userRateLimit, getFriendRequests);

// POST /api/auth/accept-friend-request - Accept friend request
router.post('/accept-friend-request', auth, userRateLimit, acceptFriendRequest);

// POST /api/auth/reject-friend-request - Reject friend request
router.post('/reject-friend-request', auth, userRateLimit, rejectFriendRequest);

// GET /api/auth/privacy-settings - Get privacy settings
router.get('/privacy-settings', auth, getPrivacySettings);

// PUT /api/auth/privacy-settings - Update privacy settings
router.put('/privacy-settings', auth, updatePrivacySettings);

// GET /api/auth/user/:userId/profile - Get user's profile
router.get('/user/:userId/profile', auth, getFriendProfile);

module.exports = router;
