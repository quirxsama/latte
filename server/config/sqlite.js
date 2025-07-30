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
        spotify_id TEXT UNIQUE NOT NULL,
        email TEXT,
        display_name TEXT NOT NULL,
        profile_image TEXT,
        country TEXT,
        followers INTEGER DEFAULT 0,
        music_stats TEXT DEFAULT '{}',
        privacy_settings TEXT DEFAULT '{"allowComparison": false, "showProfile": true, "showTopTracks": false, "showTopArtists": false, "allowFriendRequests": true}',
        settings TEXT DEFAULT '{"language": "en", "theme": "dark"}',
        quiz_stats TEXT DEFAULT '{"totalQuizzes": 0, "averageScore": 0, "bestScore": 0}',
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

  // User operations
  createUser(userData) {
    const stmt = this.db.prepare(`
      INSERT INTO users (
        spotify_id, email, display_name, profile_image, 
        country, followers, last_login
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
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

  getUserBySpotifyId(spotifyId) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE spotify_id = ?');
    const user = stmt.get(spotifyId);
    return user ? this.formatUser(user) : null;
  }

  updateUser(id, updates) {
    const allowedFields = [
      'email', 'display_name', 'profile_image', 'country', 
      'followers', 'music_stats', 'privacy_settings', 
      'settings', 'quiz_stats', 'last_login', 'last_data_update'
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
      spotifyId: user.spotify_id,
      email: user.email,
      displayName: user.display_name,
      profileImage: user.profile_image,
      country: user.country,
      followers: user.followers,
      musicStats: user.music_stats ? JSON.parse(user.music_stats) : {},
      privacy: user.privacy_settings ? JSON.parse(user.privacy_settings) : {},
      settings: user.settings ? JSON.parse(user.settings) : {},
      quizStats: user.quiz_stats ? JSON.parse(user.quiz_stats) : {},
      lastLogin: user.last_login,
      lastDataUpdate: user.last_data_update,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  // Friend operations
  addFriend(userId, friendId) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)
    `);
    stmt.run(userId, friendId);
    stmt.run(friendId, userId); // Bidirectional friendship
  }

  getFriends(userId) {
    const stmt = this.db.prepare(`
      SELECT u.* FROM users u
      INNER JOIN friends f ON u.id = f.friend_id
      WHERE f.user_id = ? AND f.status = 'accepted'
      ORDER BY u.display_name
    `);
    const friends = stmt.all(userId);
    return friends.map(friend => this.formatUser(friend));
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
