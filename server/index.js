const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', apiLimiter);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Serve static client build if present
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// Root API overview if accessed directly as API
app.get('/api', (req, res) => {
  res.json({
    name: 'CampusGuardian AI API',
    tagline: 'A Safer Campus. A Smarter Response.',
    version: '2.0.0',
    status: 'online',
    database: 'SQLite (Persistent Storage)',
    endpoints: [
      'POST /api/auth/login - User authentication',
      'GET  /api/auth/me - Session restore',
      'POST /api/auth/logout - Invalidate session',
      'GET  /api/reports - Fetch reports (role-scoped)',
      'POST /api/reports - Create new incident report',
      'PATCH /api/reports/:id - Admin update report status/department',
      'GET  /api/reports/export - Admin export reports CSV/JSON',
      'GET  /api/alerts - Disaster Indicator alerts',
      'POST /api/alerts - Admin publish disaster alert',
      'PATCH /api/alerts/:id - Admin update/all-clear disaster alert',
      'POST /api/alerts/:id/acknowledge - Student acknowledge alert',
      'GET  /api/audit-logs - Admin view system audit trail',
      'POST /api/analyze - AI Issue classification & triage',
      'POST /api/chat - AI Campus Assistant with knowledge base',
      'GET  /api/emergency - Emergency contacts & safety protocols',
      'GET  /api/accessibility - Accessible facilities & services',
      'GET  /api/health - System health & AI engine status'
    ]
  });
});

// Single Page Application catch-all route (serves index.html for frontend routes)
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🛡️  CampusGuardian AI Server running on port ${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`💾 Database: SQLite (Persistent at server/data/campusguardian.sqlite)`);
  console.log(`🤖 AI Engine: ${process.env.GEMINI_API_KEY ? 'Gemini API Enabled' : 'Local Fallback Engine Active'}`);
  console.log('====================================================');
});
