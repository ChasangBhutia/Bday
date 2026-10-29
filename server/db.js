const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isDbConnected = false;
const memoryStore = new Map();

// Local JSON backup path to prevent data loss across restarts if MongoDB Atlas is cold
const backupDir = path.join(__dirname, 'data');
const backupFile = path.join(backupDir, 'celebrations_backup.json');

// Initialize memory store from disk backup if available
try {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  if (fs.existsSync(backupFile)) {
    const raw = fs.readFileSync(backupFile, 'utf-8');
    const items = JSON.parse(raw);
    if (Array.isArray(items)) {
      items.forEach(item => {
        if (item && item.id) memoryStore.set(item.id, item);
      });
      console.log(`📦 Loaded ${items.length} celebrations from local disk backup into memory store.`);
    }
  }
} catch (e) {
  console.warn('Notice loading local backup:', e.message);
}

function persistMemoryStore() {
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const items = Array.from(memoryStore.values());
    fs.writeFileSync(backupFile, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Notice persisting local backup:', e.message);
  }
}

/**
 * Connect to MongoDB with graceful fallback to In-Memory mode + disk backup.
 * Higher timeout (10s) gives MongoDB Atlas time to connect during cold boot.
 */
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/birthday_celebrations';

  try {
    mongoose.set('strictQuery', false);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    isDbConnected = true;
    console.log(`✅ [MongoDB] Successfully connected to: ${mongoUri.replace(/\/\/.*@/, '//<credentials>@')}`);
  } catch (err) {
    isDbConnected = false;
    console.warn(`⚠️ [MongoDB] Connection failed (${err.message}).`);
    console.warn(`🚀 [Storage] Operating seamlessly in In-Memory mode with local disk backup.`);
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
    storageMode: isDbConnected ? 'MongoDB' : 'In-Memory Cache (with disk backup)',
    memoryCount: memoryStore.size
  };
}

module.exports = {
  connectDB,
  getDbStatus,
  memoryStore,
  persistMemoryStore,
  get isDbConnected() {
    return isDbConnected;
  }
};
