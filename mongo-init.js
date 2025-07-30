// MongoDB initialization script for Latte Music App

// Switch to the latte-music database
db = db.getSiblingDB('latte-music');

// Create a user for the application
db.createUser({
  user: 'latte-user',
  pwd: 'latte-password-2024',
  roles: [
    {
      role: 'readWrite',
      db: 'latte-music'
    }
  ]
});

// Create collections with some initial structure
db.createCollection('users');
db.createCollection('sessions');

// Create indexes for better performance
db.users.createIndex({ "spotifyId": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "displayName": 1 });
db.users.createIndex({ "friends.userId": 1 });
db.users.createIndex({ "friendRequests.sent.userId": 1 });
db.users.createIndex({ "friendRequests.received.userId": 1 });

db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

print('✅ MongoDB initialized successfully for Latte Music App');
print('📊 Database: latte-music');
print('👤 User: latte-user');
print('🔍 Indexes created for optimal performance');
