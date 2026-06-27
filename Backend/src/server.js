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
import debugRoutes from './routes/debugRoutes.js';
import { errorHandler } from './middleware/auth.js';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    'https://aman-potfolio-amber.vercel.app',
    'https://aman-potfolio-y3ppx1xjo-amanullaathaniya-3992s-projects.vercel.app',
    'https://yourdomain.com',
  ]
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
    if (/^https:\/\/[^/]+\.vercel\.app$/.test(origin)) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
console.log('Auth routes loaded');
app.use('/api/auth', authRoutes);
app.use('/api/debug', debugRoutes);

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

// Start server
const startServer = (startPort, attempts = 10) => {
  const port = Number(startPort);
  const server = app.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`✅ Server running on http://localhost:${actualPort}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`⚠️ Port ${port} is already in use. Trying port ${port + 1}...`);
      server.close?.();
      if (attempts > 0) {
        startServer(port + 1, attempts - 1);
      } else {
        process.exit(1);
      }
      return;
    }
    throw error;
  });
};

startServer(PORT, 10);
