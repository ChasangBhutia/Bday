const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Celebration = require('../models/Celebration');
const { isDbConnected, memoryStore, getDbStatus, persistMemoryStore } = require('../db');

// Dynamic DB connection status evaluator
const checkDbConnected = () => (typeof isDbConnected === 'function' ? isDbConnected() : Boolean(isDbConnected));

// Ensure videos directory exists
const videosDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Multer storage for birthday video clip
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `video_${uniqueSuffix}${ext}`);
  }
});

const uploadVideoMiddleware = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogg|mkv|3gp)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Please upload MP4, WebM, MOV, or M4V.'));
    }
  }
}).single('video');

/**
 * Upload Video Endpoint
 * POST /api/upload-video
 */
router.post('/upload-video', (req, res) => {
  uploadVideoMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'Video file size exceeds the 100MB limit.' });
      }
      return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    const cleanTitle = req.file.originalname.replace(/\.[^/.]+$/, '') || 'Special Birthday Video Message';

    return res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        url: videoUrl,
        title: cleanTitle,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
});

/**
 * Health check & status endpoint
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: getDbStatus()
  });
});

/**
 * Create or Update a Celebration
 * POST /api/celebrations
 */
router.post('/celebrations', async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ success: false, error: 'Request body cannot be empty' });
    }

    // Ensure valid ID
    const celebrationId = data.id && String(data.id).trim()
      ? String(data.id).trim()
      : `bday_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload = {
      ...data,
      id: celebrationId,
      updatedAt: new Date().toISOString()
    };

    // Always update memory store for instantaneous retrieval and persist to backup
    memoryStore.set(celebrationId, payload);
    persistMemoryStore();

    let savedItem = payload;
    let storageType = 'in-memory';

    // Persist to MongoDB if connected or connecting
    if (checkDbConnected()) {
      try {
        const doc = await Celebration.findOneAndUpdate(
          { id: celebrationId },
          payload,
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        if (doc) {
          savedItem = doc.toJSON ? doc.toJSON() : doc;
          storageType = 'mongodb';
        }
      } catch (dbErr) {
        console.warn(`[MongoDB save error]: ${dbErr.message}. Preserved in memory store.`);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Celebration saved successfully',
      data: savedItem,
      id: celebrationId,
      storage: storageType
    });
  } catch (err) {
    console.error('Error saving celebration:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to save celebration',
      details: err.message
    });
  }
});

/**
 * Get a Celebration by ID
 * GET /api/celebrations/:id
 */
router.get('/celebrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID parameter is required' });
    }

    // 1. Check in-memory store first
    if (memoryStore.has(id)) {
      return res.json({
        success: true,
        source: 'cache',
        data: memoryStore.get(id)
      });
    }

    // 2. Query MongoDB if connected
    if (checkDbConnected()) {
      const doc = await Celebration.findOne({ id });
      if (doc) {
        const docJson = doc.toJSON ? doc.toJSON() : doc;
        memoryStore.set(id, docJson); // Cache in memory
        return res.json({
          success: true,
          source: 'mongodb',
          data: docJson
        });
      }
    }

    // Not found
    return res.status(404).json({
      success: false,
      error: 'Celebration not found'
    });
  } catch (err) {
    console.error(`Error retrieving celebration ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve celebration',
      details: err.message
    });
  }
});

/**
 * List recent celebrations
 * GET /api/celebrations
 */
router.get('/celebrations', async (req, res) => {
  try {
    if (checkDbConnected()) {
      const list = await Celebration.find()
        .sort({ updatedAt: -1 })
        .limit(20)
        .select('id recipientName senderName milestone date relationship envelopeStyle giftStyle giftItem updatedAt');
      return res.json({ success: true, count: list.length, data: list });
    }

    // Return list from memory store
    const list = Array.from(memoryStore.values()).map(item => ({
      id: item.id,
      recipientName: item.recipientName,
      senderName: item.senderName,
      milestone: item.milestone,
      date: item.date,
      relationship: item.relationship,
      envelopeStyle: item.envelopeStyle,
      giftStyle: item.giftStyle,
      giftItem: item.giftItem,
      updatedAt: item.updatedAt
    }));

    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    console.error('Error listing celebrations:', err);
    return res.status(500).json({ success: false, error: 'Failed to list celebrations' });
  }
});

module.exports = router;
