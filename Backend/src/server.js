import express from 'express';
import cors from 'cors';
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
console.log('AUTH ROUTES FILE LOADED');
import debugRoutes from './routes/debugRoutes.js';
import { verifyToken } from './middleware/auth.js';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const uploadDir = path.resolve(__dirname, '..', 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeBaseName = path
      .parse(file.originalname)
      .name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'image';
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${safeBaseName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }

    return cb(null, true);
  },
});

console.log('SERVER FILE:', import.meta.url);
console.log('PWD:', process.cwd());

// Middleware
const defaultAllowedOrigins = [
  'https://aman-potfolio-amber.vercel.app',
  'https://aman-potfolio-230yp3hw8-amanullaathaniya-3992s-projects.vercel.app',
  'https://aman-potfolio-git-main-amanullaathaniya-3992s-projects.vercel.app',
  'https://aman-potfolio-production.up.railway.app',
  'https://aman-portfolio-production.up.railway.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

const envAllowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => value.split(','))
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...envAllowedOrigins]);

const normalizeOrigin = (origin) => new URL(origin).origin;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  try {
    const parsedOrigin = normalizeOrigin(origin);
    const hostname = new URL(parsedOrigin).hostname;
    return (
      allowedOrigins.has(parsedOrigin) ||
      hostname.endsWith('.vercel.app')
    );
  } catch (error) {
    console.log('Invalid origin URL:', origin, error?.message);
    return false;
  }
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log(
    'REQUEST:',
    req.method,
    req.originalUrl,
    'ORIGIN:',
    origin
  );

  res.on('finish', () => {
    console.log(
      'RESPONSE:',
      req.method,
      req.originalUrl,
      'STATUS:',
      res.statusCode,
      'ORIGIN:',
      origin,
      'HEADERS:',
      JSON.stringify(res.getHeaders())
    );
  });

  next();
});

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.log('Blocked Origin:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept','X-Requested-With'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir, {
  maxAge: '30d',
  immutable: true,
}));

// Routes
const handleImageUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  const filePath = `/uploads/${req.file.filename}`;

  return res.status(201).json({
    message: 'Image uploaded successfully',
    filePath,
    url: filePath,
  });
};

app.post('/api/upload', verifyToken, upload.single('image'), handleImageUpload);
app.post('/upload', verifyToken, upload.single('image'), handleImageUpload);

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

app._router.stack.forEach((r) => {
  if (r.route) {
    console.log('REGISTERED ROUTE:', Object.keys(r.route.methods).join(',').toUpperCase(), r.route.path);
  }
});

app.post('/api/debug/test-auth', async (req, res) => {
  return res.json({
    success: true,
    message: 'auth route works'
  });
});

app.get('/api/debug/cors', (req, res) => {
  res.json({
    success: true,
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    originAllowed: isAllowedOrigin(req.headers.origin),
    allowedOrigins: [...allowedOrigins],
    cors: true
  });
});

app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    origin: req.headers.origin
  });
});

app.get('/api/projects-test', (req, res) => {
  res.json({
    success: true,
    route: 'projects-test'
  });
});

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
app.use((err, req, res, next) => {
  console.error('ERROR HANDLER:', err);

  if (!res.headersSent) {
    const origin = req.headers.origin;

    if (isAllowedOrigin(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With');
      res.header('Vary', 'Origin');
    }
  }

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

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
