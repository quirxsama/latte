const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Spotify OAuth data
  spotifyId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  followers: {
    type: Number,
    default: 0
  },
  
  // Privacy settings
  privacy: {
    allowComparison: {
      type: Boolean,
      default: false
    },
    showProfile: {
      type: Boolean,
      default: true
    },
    showTopTracks: {
      type: Boolean,
      default: false
    },
    showTopArtists: {
      type: Boolean,
      default: false
    }
  },

  // Music statistics
  musicStats: {
    topGenres: [{
      name: String,
      count: Number,
      percentage: Number
    }],
    listeningHabits: {
      totalPlaytime: { type: Number, default: 0 }, // in minutes
      averageSessionLength: { type: Number, default: 0 },
      mostActiveHour: { type: Number, default: 12 },
      mostActiveDay: { type: String, default: 'Monday' }
    },
    topTracks: [{
      spotifyId: String,
      name: String,
      artists: [String],
      playCount: Number,
      timeRange: String, // short_term, medium_term, long_term
      lastUpdated: { type: Date, default: Date.now }
    }],
    topArtists: [{
      spotifyId: String,
      name: String,
      genres: [String],
      playCount: Number,
      timeRange: String,
      lastUpdated: { type: Date, default: Date.now }
    }]
  },

  // Quiz statistics
  quizStats: {
    totalGames: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    lastPlayed: { type: Date, default: null },
    achievements: [{
      name: String,
      description: String,
      unlockedAt: { type: Date, default: Date.now }
    }]
  },

  // Social features
  friends: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' }
  }],

  // Comparison history
  comparisons: [{
    withUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comparedAt: { type: Date, default: Date.now },
    results: {
      similarity: Number, // percentage
      commonTracks: Number,
      commonArtists: Number,
      commonGenres: Number
    }
  }],

  // Account settings
  settings: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'dark' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      friendRequests: { type: Boolean, default: true },
      comparisons: { type: Boolean, default: true }
    }
  },

  // Timestamps
  lastLogin: { type: Date, default: Date.now },
  lastDataUpdate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate average quiz score
userSchema.methods.updateQuizStats = function(newScore) {
  this.quizStats.totalGames += 1;
  this.quizStats.totalScore += newScore;
  this.quizStats.averageScore = this.quizStats.totalScore / this.quizStats.totalGames;
  
  if (newScore > this.quizStats.bestScore) {
    this.quizStats.bestScore = newScore;
  }
  
  this.quizStats.lastPlayed = new Date();
};

// Calculate music similarity with another user
userSchema.methods.calculateSimilarity = function(otherUser) {
  const myTracks = this.musicStats.topTracks.map(t => t.spotifyId);
  const otherTracks = otherUser.musicStats.topTracks.map(t => t.spotifyId);
  
  const myArtists = this.musicStats.topArtists.map(a => a.spotifyId);
  const otherArtists = otherUser.musicStats.topArtists.map(a => a.spotifyId);
  
  const myGenres = this.musicStats.topGenres.map(g => g.name);
  const otherGenres = otherUser.musicStats.topGenres.map(g => g.name);

  const commonTracks = myTracks.filter(id => otherTracks.includes(id)).length;
  const commonArtists = myArtists.filter(id => otherArtists.includes(id)).length;
  const commonGenres = myGenres.filter(name => otherGenres.includes(name)).length;

  const totalTracks = Math.max(myTracks.length, otherTracks.length);
  const totalArtists = Math.max(myArtists.length, otherArtists.length);
  const totalGenres = Math.max(myGenres.length, otherGenres.length);

  const trackSimilarity = totalTracks > 0 ? (commonTracks / totalTracks) * 100 : 0;
  const artistSimilarity = totalArtists > 0 ? (commonArtists / totalArtists) * 100 : 0;
  const genreSimilarity = totalGenres > 0 ? (commonGenres / totalGenres) * 100 : 0;

  const overallSimilarity = (trackSimilarity + artistSimilarity + genreSimilarity) / 3;

  return {
    similarity: Math.round(overallSimilarity * 100) / 100,
    commonTracks,
    commonArtists,
    commonGenres,
    details: {
      trackSimilarity: Math.round(trackSimilarity * 100) / 100,
      artistSimilarity: Math.round(artistSimilarity * 100) / 100,
      genreSimilarity: Math.round(genreSimilarity * 100) / 100
    }
  };
};

// Find users with similar music taste
userSchema.statics.findSimilarUsers = async function(userId, limit = 10) {
  const user = await this.findById(userId);
  if (!user) return [];

  const users = await this.find({
    _id: { $ne: userId },
    'privacy.allowComparison': true
  }).limit(50);

  const similarities = users.map(otherUser => {
    const similarity = user.calculateSimilarity(otherUser);
    return {
      user: otherUser,
      ...similarity
    };
  });

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
};

module.exports = mongoose.model('User', userSchema);
