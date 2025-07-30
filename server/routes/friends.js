const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/friends - Get user's friends list
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends.userId', 'displayName profileImage spotifyId country')
      .select('friends');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friends = user.friends
      .filter(friend => friend.status === 'accepted')
      .map(friend => ({
        id: friend.userId._id,
        displayName: friend.userId.displayName,
        profileImage: friend.userId.profileImage,
        spotifyId: friend.userId.spotifyId,
        country: friend.userId.country,
        addedAt: friend.addedAt
      }));

    res.json({
      success: true,
      friends,
      count: friends.length
    });

  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ 
      message: 'Failed to get friends list',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// POST /api/friends/request/:userId - Send friend request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.userId;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if target user exists and allows friend requests
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!targetUser.privacy.allowFriendRequests) {
      return res.status(403).json({ message: 'User does not accept friend requests' });
    }

    // Check if already friends
    const currentUser = await User.findById(currentUserId);
    const isAlreadyFriend = currentUser.friends.some(
      friend => friend.userId.toString() === targetUserId && friend.status === 'accepted'
    );

    if (isAlreadyFriend) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if request already sent
    const requestAlreadySent = currentUser.friendRequests.sent.some(
      request => request.userId.toString() === targetUserId
    );

    if (requestAlreadySent) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if there's a pending request from target user
    const pendingRequest = currentUser.friendRequests.received.some(
      request => request.userId.toString() === targetUserId
    );

    if (pendingRequest) {
      return res.status(400).json({ 
        message: 'This user has already sent you a friend request. Check your pending requests.' 
      });
    }

    // Add to sender's sent requests
    currentUser.friendRequests.sent.push({
      userId: targetUserId,
      sentAt: new Date()
    });

    // Add to receiver's received requests
    targetUser.friendRequests.received.push({
      userId: currentUserId,
      receivedAt: new Date()
    });

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      success: true,
      message: 'Friend request sent successfully'
    });

  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ 
      message: 'Failed to send friend request',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/friends/requests - Get pending friend requests
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friendRequests.received.userId', 'displayName profileImage spotifyId country')
      .populate('friendRequests.sent.userId', 'displayName profileImage spotifyId country')
      .select('friendRequests');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const received = user.friendRequests.received.map(request => ({
      id: request.userId._id,
      displayName: request.userId.displayName,
      profileImage: request.userId.profileImage,
      spotifyId: request.userId.spotifyId,
      country: request.userId.country,
      receivedAt: request.receivedAt
    }));

    const sent = user.friendRequests.sent.map(request => ({
      id: request.userId._id,
      displayName: request.userId.displayName,
      profileImage: request.userId.profileImage,
      spotifyId: request.userId.spotifyId,
      country: request.userId.country,
      sentAt: request.sentAt
    }));

    res.json({
      success: true,
      requests: {
        received,
        sent
      },
      counts: {
        received: received.length,
        sent: sent.length
      }
    });

  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ 
      message: 'Failed to get friend requests',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// POST /api/friends/accept/:userId - Accept friend request
router.post('/accept/:userId', auth, async (req, res) => {
  try {
    const { userId: senderUserId } = req.params;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderUserId);

    if (!currentUser || !senderUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if there's a pending request
    const requestIndex = currentUser.friendRequests.received.findIndex(
      request => request.userId.toString() === senderUserId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ message: 'No pending friend request from this user' });
    }

    // Remove from both users' friend requests
    currentUser.friendRequests.received.splice(requestIndex, 1);
    
    const sentRequestIndex = senderUser.friendRequests.sent.findIndex(
      request => request.userId.toString() === currentUserId
    );
    if (sentRequestIndex !== -1) {
      senderUser.friendRequests.sent.splice(sentRequestIndex, 1);
    }

    // Add to both users' friends list
    currentUser.friends.push({
      userId: senderUserId,
      addedAt: new Date(),
      status: 'accepted'
    });

    senderUser.friends.push({
      userId: currentUserId,
      addedAt: new Date(),
      status: 'accepted'
    });

    await Promise.all([currentUser.save(), senderUser.save()]);

    res.json({
      success: true,
      message: 'Friend request accepted successfully'
    });

  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ 
      message: 'Failed to accept friend request',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// DELETE /api/friends/reject/:userId - Reject friend request
router.delete('/reject/:userId', auth, async (req, res) => {
  try {
    const { userId: senderUserId } = req.params;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderUserId);

    if (!currentUser || !senderUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from received requests
    const requestIndex = currentUser.friendRequests.received.findIndex(
      request => request.userId.toString() === senderUserId
    );

    if (requestIndex === -1) {
      return res.status(400).json({ message: 'No pending friend request from this user' });
    }

    currentUser.friendRequests.received.splice(requestIndex, 1);

    // Remove from sender's sent requests
    const sentRequestIndex = senderUser.friendRequests.sent.findIndex(
      request => request.userId.toString() === currentUserId
    );
    if (sentRequestIndex !== -1) {
      senderUser.friendRequests.sent.splice(sentRequestIndex, 1);
    }

    await Promise.all([currentUser.save(), senderUser.save()]);

    res.json({
      success: true,
      message: 'Friend request rejected successfully'
    });

  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ 
      message: 'Failed to reject friend request',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// DELETE /api/friends/:userId - Remove friend
router.delete('/:userId', auth, async (req, res) => {
  try {
    const { userId: friendUserId } = req.params;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findById(friendUserId);

    if (!currentUser || !friendUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from both users' friends list
    currentUser.friends = currentUser.friends.filter(
      friend => friend.userId.toString() !== friendUserId
    );

    friendUser.friends = friendUser.friends.filter(
      friend => friend.userId.toString() !== currentUserId
    );

    await Promise.all([currentUser.save(), friendUser.save()]);

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });

  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ 
      message: 'Failed to remove friend',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
