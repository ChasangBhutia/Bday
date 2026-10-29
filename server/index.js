require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./db');
const celebrationRoutes = require('./routes/celebrationRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Database connection (non-blocking, gracefully falls back to memory if DB not active)
connectDB();

// Robust CORS: Strips trailing slashes, supports wildcard '*', vercel preview domains, localhost, and allows cross-device requests
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, postman, same-origin)
      if (!origin) return callback(null, true);

      const rawCors = (process.env.CORS_ORIGIN || '*').trim();
      if (rawCors === '*') return callback(null, true);

      const cleanReqOrigin = origin.replace(/\/+$/, '').toLowerCase();
      const allowedOrigins = rawCors
        .split(',')
        .map((o) => o.trim().replace(/\/+$/, '').toLowerCase());

      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(cleanReqOrigin) ||
        cleanReqOrigin.endsWith('.vercel.app') ||
        cleanReqOrigin.includes('localhost') ||
        cleanReqOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }

      // Default: allow all origins so recipients opening on any phone/device can load celebration
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// High-capacity body parsers for base64 image & audio surprises
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logger in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.path}`);
    }
    next();
  });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const videosDir = path.join(uploadsDir, 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Serve uploaded static assets (videos, photos, audio) with video range support
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    res.setHeader('Accept-Ranges', 'bytes');
  }
}));

// Mount API routes
app.use('/api', celebrationRoutes);

// Production Static Serving: If client/dist exists, serve it seamlessly
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 [Production] Serving static files from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for HTML5 History routing (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
} else {
  // Helpful root response in dev when client dev server is running separately
  app.get('/', (req, res) => {
    res.json({
      name: 'Birthday Celebration Backend API',
      status: 'active',
      endpoints: {
        health: '/api/health',
        celebrations: '/api/celebrations',
        getCelebrationById: '/api/celebrations/:id'
      }
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎉 Birthday Backend Server is live on http://localhost:${PORT}`);
    console.log(`📡 Healthcheck available at: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
