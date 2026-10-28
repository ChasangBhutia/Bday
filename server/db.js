const mongoose = require('mongoose');

let isDbConnected = false;
const memoryStore = new Map();

/**
 * Connect to MongoDB with graceful fallback to In-Memory mode.
 * This guarantees zero downtime in development or if MongoDB Atlas credentials
 * are not yet supplied in production.
 */
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/birthday_celebrations';

  try {
    mongoose.set('strictQuery', false);

    // Set 3-second timeout so app starts instantaneously even without local MongoDB
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    isDbConnected = true;
    console.log(`✅ [MongoDB] Successfully connected to: ${mongoUri.replace(/\/\/.*@/, '//<credentials>@')}`);
  } catch (err) {
    isDbConnected = false;
    console.warn(`⚠️ [MongoDB] Connection failed (${err.message}).`);
    console.warn(`🚀 [Storage] Operating seamlessly in In-Memory mode. All API routes will function normally!`);
  }

  mongoose.connection.on('disconnected', () => {
    isDbConnected = false;
    console.warn('⚠️ [MongoDB] Lost connection, using In-Memory fallback.');
  });

  mongoose.connection.on('reconnected', () => {
    isDbConnected = true;
    console.log('✅ [MongoDB] Reconnected successfully.');
  });
}

function getDbStatus() {
  return {
    isDbConnected,
    storageMode: isDbConnected ? 'MongoDB' : 'In-Memory Cache',
    memoryCount: memoryStore.size
  };
}

module.exports = {
  connectDB,
  getDbStatus,
  memoryStore,
  get isDbConnected() {
    return isDbConnected;
  }
};
