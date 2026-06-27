import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import projectRoutes from './routes/projectRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/auth.js';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://yourdomain.com']
  : [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Force dynamic API responses to never be cached by browsers/CDNs/proxies.
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
  next();
});

// Ensure uploads directory exists so multer can write files
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Uploaded files are immutable because filenames are timestamp-based.
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1y',
  immutable: true,
  etag: true,
  lastModified: true,
}));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ filePath: fileUrl });
});

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/debug/admins', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, created_at FROM admins ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Debug admins error:', error.message);
    res.status(500).json({ message: 'Failed to fetch admins' });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend running',
    database: 'connected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server with port fallback: if desired PORT is in use, try next ports.
const startServer = (startPort, attempts = 10) => {
  const port = Number(startPort);
  const server = app.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`✅ Server running on http://localhost:${actualPort}`);
    console.log(`📚 API Documentation:`);
    console.log(`   GET  /api/projects         - Get all projects`);
    console.log(`   GET  /api/skills           - Get all skills`);
    console.log(`   GET  /api/experience       - Get all experience`);
    console.log(`   POST /api/contact          - Submit contact form`);
    console.log(`   POST /api/auth/login       - Admin login`);
    console.log(`   POST /api/auth/seed        - Seed admin account (only once)`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`⚠️ Port ${port} is already in use. Trying port ${port + 1}...`);
      server.close?.();
      if (attempts > 0) {
        // try next port
        startServer(port + 1, attempts - 1);
      } else {
        console.error(`❌ All fallback ports unavailable. Stop the process using the occupied port or set a different PORT in Backend/.env.`);
        process.exit(1);
      }
      return;
    }
    throw error;
  });
};

startServer(PORT, 10);
