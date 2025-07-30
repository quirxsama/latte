const sqliteDB = require('./sqlite');

const connectDB = async () => {
  try {
    console.log('🔄 Switching to SQLite database...');
    sqliteDB.connect();
    console.log('🎉 Database ready for use!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('📝 Note: Server will continue without database. Some features will not work.');
  }
};

module.exports = connectDB;
