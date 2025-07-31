const Database = require('better-sqlite3');
const path = require('path');

class SQLiteDB {
  constructor() {
    this.db = null;
    this.isConnected = false;
  }

  connect() {
    try {
      const dbPath = path.join(__dirname, '..', 'data', 'latte.db');
      
      // Create data directory if it doesn't exist
      const fs = require('fs');
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL'); // Better performance
      this.db.pragma('foreign_keys = ON'); // Enable foreign keys
      
      console.log('🔄 Initializing SQLite database...');
      console.log('📍 Database path:', dbPath);
      
      this.createTables();
      this.isConnected = true;
      
      console.log('✅ SQLite Connected Successfully!');
      console.log('🗄️  Database: latte.db');
      console.log('📊 Tables initialized');
      
    } catch (error) {
      console.error('❌ SQLite connection failed:', error.message);
      throw error;
    }
  }

  createTables() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        spotify_id TEXT UNIQUE NOT NULL,
        email TEXT,
        display_name TEXT NOT NULL,
        profile_image TEXT,
        spotify_profile_url TEXT,
        country TEXT,
        followers INTEGER DEFAULT 0,
        music_stats TEXT DEFAULT '{}',
        privacy_settings TEXT DEFAULT '{"allowComparison": false, "showProfile": true, "showTopTracks": false, "showTopArtists": false, "allowFriendRequests": true}',
        settings TEXT DEFAULT '{"language": "en", "theme": "dark"}',

        last_login DATETIME,
        last_data_update DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Friends table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_id INTEGER NOT NULL,
        status TEXT DEFAULT 'accepted' CHECK(status IN ('accepted', 'blocked')),
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(user_id, friend_id)
      )
    `);

    // Friend requests table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        responded_at DATETIME,
        FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(sender_id, receiver_id)
      )
    `);

    // Sessions table (for JWT blacklisting if needed)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_spotify_id ON users(spotify_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);
      CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
      CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
      CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
      CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    `);

    console.log('📊 Database tables and indexes created successfully');
  }

  // Generate unique user ID
  generateUserId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if ID already exists
    const existing = this.db.prepare('SELECT id FROM users WHERE user_id = ?').get(result);
    if (existing) {
      return this.generateUserId(); // Recursive call if ID exists
    }

    return result;
  }

  // User operations
  createUser(userData) {
    const userId = this.generateUserId();
    const stmt = this.db.prepare(`
      INSERT INTO users (
        user_id, spotify_id, email, display_name, profile_image,
        country, followers, last_login
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId,
      userData.spotifyId,
      userData.email,
      userData.displayName,
      userData.profileImage,
      userData.country,
      userData.followers || 0,
      new Date().toISOString()
    );
    
    return this.getUserById(result.lastInsertRowid);
  }

  getUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    return user ? this.formatUser(user) : null;
  }

  getUserByUserId(userId) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE user_id = ?');
    const user = stmt.get(userId);
    return user ? this.formatUser(user) : null;
  }

  searchUsers(query, limit = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM users
      WHERE user_id LIKE ? OR display_name LIKE ?
      ORDER BY display_name
      LIMIT ?
    `);
    const searchTerm = `%${query}%`;
    const users = stmt.all(searchTerm, searchTerm, limit);
    return users.map(user => this.formatUser(user));
  }

  getUserBySpotifyId(spotifyId) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE spotify_id = ?');
    const user = stmt.get(spotifyId);
    return user ? this.formatUser(user) : null;
  }

  updateUser(id, updates) {
    const allowedFields = [
      'email', 'display_name', 'profile_image', 'country', 
      'followers', 'music_stats', 'privacy_settings', 
      'settings', 'last_login', 'last_data_update'
    ];
    
    const updateFields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey)) {
        updateFields.push(`${dbKey} = ?`);
        values.push(typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key]);
      }
    });
    
    if (updateFields.length === 0) return null;
    
    updateFields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
    `);
    
    stmt.run(...values);
    return this.getUserById(id);
  }

  getAllUsers() {
    const stmt = this.db.prepare('SELECT * FROM users');
    const users = stmt.all();
    return users.map(user => this.formatUser(user));
  }

  searchUsers(searchTerm, limit = 10, excludeUserId = null) {
    let query = `
      SELECT * FROM users
      WHERE (display_name LIKE ? OR spotify_id LIKE ?)
    `;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`];

    if (excludeUserId) {
      query += ' AND id != ?';
      params.push(excludeUserId);
    }

    query += ' ORDER BY display_name LIMIT ?';
    params.push(limit);

    const stmt = this.db.prepare(query);
    const users = stmt.all(...params);
    return users.map(user => this.formatUser(user));
  }

  // Format user object (convert JSON strings back to objects)
  formatUser(user) {
    if (!user) return null;

    return {
      id: user.id,
      userId: user.user_id,
      spotifyId: user.spotify_id,
      email: user.email,
      displayName: user.display_name,
      profileImage: user.profile_image,
      spotifyProfileUrl: user.spotify_profile_url,
      country: user.country,
      followers: user.followers,
      musicStats: user.music_stats ? JSON.parse(user.music_stats) : {},
      privacy: user.privacy_settings ? JSON.parse(user.privacy_settings) : {},
      settings: user.settings ? JSON.parse(user.settings) : {},

      lastLogin: user.last_login,
      lastDataUpdate: user.last_data_update,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  // Friend request operations
  sendFriendRequest(senderId, receiverId) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO friend_requests (sender_id, receiver_id, status)
        VALUES (?, ?, 'pending')
      `);
      const result = stmt.run(senderId, receiverId);
      return result.lastInsertRowid;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Friend request already exists');
      }
      throw error;
    }
  }

  acceptFriendRequest(requestId, userId) {
    const transaction = this.db.transaction(() => {
      // Get the friend request
      const getRequest = this.db.prepare(`
        SELECT * FROM friend_requests
        WHERE id = ? AND receiver_id = ? AND status = 'pending'
      `);
      const request = getRequest.get(requestId, userId);

      if (!request) {
        throw new Error('Friend request not found or already processed');
      }

      // Update friend request status
      const updateRequest = this.db.prepare(`
        UPDATE friend_requests
        SET status = 'accepted', responded_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateRequest.run(requestId);

      // Add bidirectional friendship
      const addFriend = this.db.prepare(`
        INSERT OR IGNORE INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')
      `);
      addFriend.run(request.sender_id, request.receiver_id);
      addFriend.run(request.receiver_id, request.sender_id);

      return request;
    });

    return transaction();
  }

  declineFriendRequest(requestId, userId) {
    const stmt = this.db.prepare(`
      UPDATE friend_requests
      SET status = 'rejected', responded_at = CURRENT_TIMESTAMP
      WHERE id = ? AND receiver_id = ? AND status = 'pending'
    `);
    const result = stmt.run(requestId, userId);

    if (result.changes === 0) {
      throw new Error('Friend request not found or already processed');
    }

    return true;
  }

  getPendingFriendRequests(userId) {
    const stmt = this.db.prepare(`
      SELECT fr.*, u.display_name, u.profile_image, u.spotify_id
      FROM friend_requests fr
      INNER JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
      ORDER BY fr.sent_at DESC
    `);
    return stmt.all(userId);
  }

  getSentFriendRequests(userId) {
    const stmt = this.db.prepare(`
      SELECT fr.*, u.display_name, u.profile_image, u.spotify_id
      FROM friend_requests fr
      INNER JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = ? AND fr.status = 'pending'
      ORDER BY fr.sent_at DESC
    `);
    return stmt.all(userId);
  }

  getFriends(userId) {
    const stmt = this.db.prepare(`
      SELECT u.*, f.added_at FROM users u
      INNER JOIN friends f ON u.id = f.friend_id
      WHERE f.user_id = ? AND f.status = 'accepted'
      ORDER BY u.display_name
    `);
    const friends = stmt.all(userId);
    return friends.map(friend => ({
      ...this.formatUser(friend),
      friendshipDate: friend.added_at
    }));
  }

  removeFriend(userId, friendId) {
    const transaction = this.db.transaction(() => {
      const stmt = this.db.prepare(`
        DELETE FROM friends
        WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
      `);
      stmt.run(userId, friendId, friendId, userId);
    });

    return transaction();
  }

  searchUsers(query, currentUserId, limit = 20) {
    const stmt = this.db.prepare(`
      SELECT u.*,
        CASE
          WHEN f.friend_id IS NOT NULL THEN 'friend'
          WHEN fr_sent.receiver_id IS NOT NULL THEN 'request_sent'
          WHEN fr_received.sender_id IS NOT NULL THEN 'request_received'
          ELSE 'none'
        END as relationship_status
      FROM users u
      LEFT JOIN friends f ON u.id = f.friend_id AND f.user_id = ?
      LEFT JOIN friend_requests fr_sent ON u.id = fr_sent.receiver_id AND fr_sent.sender_id = ? AND fr_sent.status = 'pending'
      LEFT JOIN friend_requests fr_received ON u.id = fr_received.sender_id AND fr_received.receiver_id = ? AND fr_received.status = 'pending'
      WHERE u.id != ?
        AND (u.display_name LIKE ? OR u.spotify_id LIKE ?)
        AND JSON_EXTRACT(u.privacy_settings, '$.allowFriendRequests') = 1
      ORDER BY u.display_name
      LIMIT ?
    `);

    const searchTerm = `%${query}%`;
    const users = stmt.all(currentUserId, currentUserId, currentUserId, currentUserId, searchTerm, searchTerm, limit);

    return users.map(user => ({
      ...this.formatUser(user),
      relationshipStatus: user.relationship_status
    }));
  }

  checkFriendship(userId, friendId) {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM friends
      WHERE user_id = ? AND friend_id = ? AND status = 'accepted'
    `);
    const result = stmt.get(userId, friendId);
    return result.count > 0;
  }

  getFriendRequestStatus(senderId, receiverId) {
    const stmt = this.db.prepare(`
      SELECT status FROM friend_requests
      WHERE sender_id = ? AND receiver_id = ?
      ORDER BY sent_at DESC LIMIT 1
    `);
    const result = stmt.get(senderId, receiverId);
    return result ? result.status : null;
  }

  // Music compatibility operations
  calculateMusicCompatibility(userId, friendId) {
    const user = this.getUserById(userId);
    const friend = this.getUserById(friendId);

    if (!user || !friend || !user.musicStats || !friend.musicStats) {
      return { compatibility: 0, details: {} };
    }

    const userStats = user.musicStats;
    const friendStats = friend.musicStats;

    // Calculate shared artists
    const userArtists = (userStats.topArtists || []).map(a => a.spotifyId);
    const friendArtists = (friendStats.topArtists || []).map(a => a.spotifyId);
    const sharedArtists = userArtists.filter(id => friendArtists.includes(id));
    const artistCompatibility = userArtists.length > 0 && friendArtists.length > 0
      ? (sharedArtists.length * 2) / (userArtists.length + friendArtists.length)
      : 0;

    // Calculate shared tracks
    const userTracks = (userStats.topTracks || []).map(t => t.spotifyId);
    const friendTracks = (friendStats.topTracks || []).map(t => t.spotifyId);
    const sharedTracks = userTracks.filter(id => friendTracks.includes(id));
    const trackCompatibility = userTracks.length > 0 && friendTracks.length > 0
      ? (sharedTracks.length * 2) / (userTracks.length + friendTracks.length)
      : 0;

    // Calculate shared genres
    const userGenres = (userStats.topGenres || []).map(g => g.name);
    const friendGenres = (friendStats.topGenres || []).map(g => g.name);
    const sharedGenres = userGenres.filter(genre => friendGenres.includes(genre));
    const genreCompatibility = userGenres.length > 0 && friendGenres.length > 0
      ? (sharedGenres.length * 2) / (userGenres.length + friendGenres.length)
      : 0;

    // Calculate overall compatibility (weighted average)
    const overallCompatibility = (
      artistCompatibility * 0.4 +
      trackCompatibility * 0.4 +
      genreCompatibility * 0.2
    );

    return {
      compatibility: Math.round(overallCompatibility * 100),
      details: {
        sharedArtists: sharedArtists.length,
        sharedTracks: sharedTracks.length,
        sharedGenres: sharedGenres.length,
        artistCompatibility: Math.round(artistCompatibility * 100),
        trackCompatibility: Math.round(trackCompatibility * 100),
        genreCompatibility: Math.round(genreCompatibility * 100)
      },
      sharedContent: {
        artists: sharedArtists,
        tracks: sharedTracks,
        genres: sharedGenres
      }
    };
  }

  getFriendsWithCompatibility(userId) {
    const friends = this.getFriends(userId);
    return friends.map(friend => ({
      ...friend,
      compatibility: this.calculateMusicCompatibility(userId, friend.id)
    }));
  }

  // Close connection
  close() {
    if (this.db) {
      this.db.close();
      this.isConnected = false;
      console.log('📴 SQLite connection closed');
    }
  }
}

// Create singleton instance
const sqliteDB = new SQLiteDB();

module.exports = sqliteDB;
