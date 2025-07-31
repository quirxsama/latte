const express = require('express');
const router = express.Router();
const sqliteDB = require('../config/sqlite');
const { authenticateToken } = require('../middleware/auth');
const { validateFriendRequest, validateUserId } = require('../middleware/validation');

// Get user's friends list with compatibility scores
router.get('/', authenticateToken, async (req, res) => {
  try {
    const friends = sqliteDB.getFriendsWithCompatibility(req.user.userId);

    res.json({
      success: true,
      friends: friends.map(friend => ({
        id: friend.id,
        spotifyId: friend.spotifyId,
        displayName: friend.displayName,
        profileImage: friend.profileImage,
        country: friend.country,
        friendshipDate: friend.friendshipDate,
        compatibility: friend.compatibility,
        // Only include music stats if privacy allows
        musicStats: friend.privacy?.showTopTracks ? friend.musicStats : null
      }))
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get friends list'
    });
  }
});

// Search for users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q: query, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const users = sqliteDB.searchUsers(query.trim(), req.user.userId, parseInt(limit));

    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        spotifyId: user.spotifyId,
        displayName: user.displayName,
        profileImage: user.profileImage,
        country: user.country,
        relationshipStatus: user.relationshipStatus
      }))
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

// Get pending friend requests (received)
router.get('/requests/pending', authenticateToken, async (req, res) => {
  try {
    const requests = sqliteDB.getPendingFriendRequests(req.user.userId);

    res.json({
      success: true,
      requests: requests.map(request => ({
        id: request.id,
        sender: {
          id: request.sender_id,
          spotifyId: request.spotify_id,
          displayName: request.display_name,
          profileImage: request.profile_image
        },
        sentAt: request.sent_at
      }))
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending requests'
    });
  }
});

// Send friend request
router.post('/request', authenticateToken, validateFriendRequest, async (req, res) => {
  try {
    const { userId: receiverId } = req.body;
    const senderId = req.user.userId;

    // Check if trying to send request to self
    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    // Check if users are already friends
    if (sqliteDB.checkFriendship(senderId, receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already friends with this user'
      });
    }

    // Check if request already exists
    const existingStatus = sqliteDB.getFriendRequestStatus(senderId, receiverId);
    if (existingStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    const requestId = sqliteDB.sendFriendRequest(senderId, receiverId);

    res.json({
      success: true,
      message: 'Friend request sent successfully',
      requestId
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    if (error.message === 'Friend request already exists') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request'
    });
  }
});

// Get sent friend requests
router.get('/requests/sent', authenticateToken, async (req, res) => {
  try {
    const requests = sqliteDB.getSentFriendRequests(req.user.userId);

    res.json({
      success: true,
      requests: requests.map(request => ({
        id: request.id,
        receiver: {
          id: request.receiver_id,
          spotifyId: request.spotify_id,
          displayName: request.display_name,
          profileImage: request.profile_image
        },
        sentAt: request.sent_at
      }))
    });
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sent requests'
    });
  }
});

// Accept friend request
router.post('/request/:requestId/accept', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const request = sqliteDB.acceptFriendRequest(parseInt(requestId), userId);

    res.json({
      success: true,
      message: 'Friend request accepted',
      newFriend: {
        id: request.sender_id
      }
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    if (error.message === 'Friend request not found or already processed') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to accept friend request'
    });
  }
});

// Decline friend request
router.post('/request/:requestId/decline', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    sqliteDB.declineFriendRequest(parseInt(requestId), userId);

    res.json({
      success: true,
      message: 'Friend request declined'
    });
  } catch (error) {
    console.error('Decline friend request error:', error);
    if (error.message === 'Friend request not found or already processed') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to decline friend request'
    });
  }
});

// Remove friend
router.delete('/:friendId', authenticateToken, validateUserId, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    // Check if they are actually friends
    if (!sqliteDB.checkFriendship(userId, parseInt(friendId))) {
      return res.status(404).json({
        success: false,
        message: 'You are not friends with this user'
      });
    }

    sqliteDB.removeFriend(userId, parseInt(friendId));

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove friend'
    });
  }
});

// Get friend profile with compatibility
router.get('/:friendId/profile', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    // Check if they are friends
    if (!sqliteDB.checkFriendship(userId, parseInt(friendId))) {
      return res.status(403).json({
        success: false,
        message: 'You can only view profiles of your friends'
      });
    }

    const friend = sqliteDB.getUserById(parseInt(friendId));
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const compatibility = sqliteDB.calculateMusicCompatibility(userId, parseInt(friendId));

    res.json({
      success: true,
      profile: {
        id: friend.id,
        spotifyId: friend.spotifyId,
        displayName: friend.displayName,
        profileImage: friend.profileImage,
        country: friend.country,
        // Only include music stats if privacy allows
        musicStats: friend.privacy?.showTopTracks ? friend.musicStats : null,
        compatibility
      }
    });
  } catch (error) {
    console.error('Get friend profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get friend profile'
    });
  }
});

module.exports = router;
