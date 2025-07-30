const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// POST /api/quiz/score - Submit quiz score
router.post('/score', auth, async (req, res) => {
  try {
    const { score, totalQuestions = 10 } = req.body;

    if (typeof score !== 'number' || score < 0 || score > totalQuestions) {
      return res.status(400).json({ 
        message: 'Invalid score. Must be between 0 and total questions.' 
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update quiz statistics
    user.updateQuizStats(score);
    await user.save();

    // Check for achievements
    const achievements = [];
    
    if (score === totalQuestions && user.quizStats.totalGames === 1) {
      achievements.push({
        name: 'Perfect First Try',
        description: 'Got a perfect score on your first quiz!',
        unlockedAt: new Date()
      });
    }

    if (user.quizStats.bestScore === totalQuestions && user.quizStats.totalGames >= 5) {
      achievements.push({
        name: 'Quiz Master',
        description: 'Achieved perfect score with 5+ games played',
        unlockedAt: new Date()
      });
    }

    if (user.quizStats.totalGames === 10) {
      achievements.push({
        name: 'Dedicated Player',
        description: 'Played 10 quiz games',
        unlockedAt: new Date()
      });
    }

    if (user.quizStats.totalGames === 50) {
      achievements.push({
        name: 'Quiz Veteran',
        description: 'Played 50 quiz games',
        unlockedAt: new Date()
      });
    }

    // Add new achievements
    if (achievements.length > 0) {
      user.quizStats.achievements.push(...achievements);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Quiz score submitted successfully',
      stats: {
        currentScore: score,
        totalGames: user.quizStats.totalGames,
        bestScore: user.quizStats.bestScore,
        averageScore: Math.round(user.quizStats.averageScore * 100) / 100,
        totalScore: user.quizStats.totalScore
      },
      newAchievements: achievements
    });

  } catch (error) {
    console.error('Submit quiz score error:', error);
    res.status(500).json({ 
      message: 'Failed to submit quiz score',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/quiz/stats - Get quiz statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('quizStats');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      stats: {
        totalGames: user.quizStats.totalGames,
        totalScore: user.quizStats.totalScore,
        bestScore: user.quizStats.bestScore,
        averageScore: Math.round(user.quizStats.averageScore * 100) / 100,
        lastPlayed: user.quizStats.lastPlayed,
        achievements: user.quizStats.achievements
      }
    });

  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({ 
      message: 'Failed to get quiz statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/quiz/leaderboard - Get quiz leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { limit = 10, type = 'average' } = req.query;

    let sortField;
    switch (type) {
      case 'best':
        sortField = { 'quizStats.bestScore': -1 };
        break;
      case 'total':
        sortField = { 'quizStats.totalGames': -1 };
        break;
      case 'average':
      default:
        sortField = { 'quizStats.averageScore': -1 };
        break;
    }

    const users = await User.find({
      'quizStats.totalGames': { $gt: 0 },
      'privacy.showProfile': true
    })
    .select('displayName profileImage country quizStats')
    .sort(sortField)
    .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      user: {
        id: user._id,
        displayName: user.displayName,
        profileImage: user.profileImage,
        country: user.country
      },
      stats: {
        totalGames: user.quizStats.totalGames,
        bestScore: user.quizStats.bestScore,
        averageScore: Math.round(user.quizStats.averageScore * 100) / 100,
        totalScore: user.quizStats.totalScore
      }
    }));

    // Find current user's rank
    const currentUser = await User.findById(req.userId).select('quizStats');
    let currentUserRank = null;

    if (currentUser && currentUser.quizStats.totalGames > 0) {
      const allUsers = await User.find({
        'quizStats.totalGames': { $gt: 0 }
      })
      .select('_id quizStats')
      .sort(sortField);

      currentUserRank = allUsers.findIndex(u => u._id.toString() === req.userId) + 1;
    }

    res.json({
      success: true,
      leaderboard,
      currentUserRank,
      type
    });

  } catch (error) {
    console.error('Quiz leaderboard error:', error);
    res.status(500).json({ 
      message: 'Failed to get quiz leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/quiz/achievements - Get all possible achievements
router.get('/achievements', auth, async (req, res) => {
  try {
    const allAchievements = [
      {
        name: 'Perfect First Try',
        description: 'Got a perfect score on your first quiz!',
        icon: '🎯',
        rarity: 'rare'
      },
      {
        name: 'Quiz Master',
        description: 'Achieved perfect score with 5+ games played',
        icon: '👑',
        rarity: 'epic'
      },
      {
        name: 'Dedicated Player',
        description: 'Played 10 quiz games',
        icon: '🎮',
        rarity: 'common'
      },
      {
        name: 'Quiz Veteran',
        description: 'Played 50 quiz games',
        icon: '🏆',
        rarity: 'legendary'
      },
      {
        name: 'Music Expert',
        description: 'Maintain 90%+ average score over 10 games',
        icon: '🎵',
        rarity: 'epic'
      },
      {
        name: 'Consistency King',
        description: 'Score 8+ points in 5 consecutive games',
        icon: '⭐',
        rarity: 'rare'
      }
    ];

    const user = await User.findById(req.userId).select('quizStats');
    const userAchievements = user?.quizStats?.achievements || [];

    const achievementsWithStatus = allAchievements.map(achievement => ({
      ...achievement,
      unlocked: userAchievements.some(ua => ua.name === achievement.name),
      unlockedAt: userAchievements.find(ua => ua.name === achievement.name)?.unlockedAt || null
    }));

    res.json({
      success: true,
      achievements: achievementsWithStatus,
      totalUnlocked: userAchievements.length,
      totalAvailable: allAchievements.length
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ 
      message: 'Failed to get achievements',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
