/**
 * CampusGuardian AI - Express API Router
 * Secure backend with persistent SQLite database, RBAC authorization,
 * session management, disaster alert lifecycle, and AI incident triage.
 */

const express = require('express');
const router = express.Router();
const dbService = require('../services/db');
const { analyzeIssue, chatWithAssistant } = require('../services/aiService');

// Basic HTML Sanitization helper
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// --- Middleware: Authentication & RBAC ---
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = dbService.getSession(token);
    if (session) {
      req.user = session;
    }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'You must be logged in with a valid session to access this resource.'
    });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Valid administrator session required.'
    });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Administrator authorization required. Student accounts cannot perform this operation.'
    });
  }
  next();
}

// Apply authMiddleware globally to router
router.use(authMiddleware);

// --- 1. Authentication Endpoints ---

// POST /api/auth/login
router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = dbService.getUserByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = dbService.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Configurable session duration (default 7 days / 168h)
    const expiryHours = parseInt(process.env.SESSION_EXPIRY_HOURS, 10) || 168;
    const session = dbService.createSession(user.id, user.role, expiryHours);

    // Audit log
    dbService.addAuditLog(user.email, user.role, 'USER_LOGIN', `User ${user.email} logged in successfully`, user.id);

    res.json({
      token: session.token,
      expiresAt: session.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed', details: err.message });
  }
});

// GET /api/auth/me (Restore session)
router.get('/auth/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.user_id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// POST /api/auth/logout
router.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    dbService.deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// --- 2. Public Statistics & Overview (Safe for Welcome Page) ---
router.get('/stats/public', (req, res) => {
  try {
    const stats = dbService.getSystemStats();
    res.json({
      totalReports: stats.totalReports,
      resolvedReports: stats.resolvedReports,
      inProgress: stats.inProgress,
      activeAlerts: stats.activeAlerts,
      resolutionRate: stats.totalReports > 0 ? Math.round((stats.resolvedReports / stats.totalReports) * 100) : 100
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stats', details: err.message });
  }
});

// GET /api/stats (Admin Only Detailed Telemetry)
router.get('/stats', requireAdmin, (req, res) => {
  try {
    const stats = dbService.getSystemStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve detailed stats', details: err.message });
  }
});

// --- 3. Reports Endpoints (Role-Scoped) ---

// GET /api/reports
router.get('/reports', requireAuth, (req, res) => {
  try {
    const { status, priority, category, search, limit, offset } = req.query;
    const filters = { status, priority, category, search, limit, offset };

    let reports;
    if (req.user.role === 'admin') {
      // Administrators see all reports
      reports = dbService.getAllReports(filters);
    } else {
      // Students see only their own reports
      reports = dbService.getReportsByStudent(req.user.email, filters);
    }

    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
  }
});

// GET /api/reports/export (Admin Only Export - defined before :id to prevent param match)
router.get('/reports/export', requireAdmin, (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    const reports = dbService.getAllReports();

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="campusguardian-reports.json"');
      return res.send(JSON.stringify(reports, null, 2));
    }

    // CSV format
    const headers = [
      'Report ID', 'Created At', 'Status', 'Priority', 'Category',
      'Location', 'Department', 'Assigned Staff', 'Reporter',
      'Summary', 'Description', 'Admin Notes', 'Resolution Details'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""').replace(/\n/g, ' ');
      return `"${str}"`;
    };

    const csvLines = [headers.join(',')];
    for (const r of reports) {
      csvLines.push([
        escapeCsv(r.id),
        escapeCsv(r.created_at),
        escapeCsv(r.status),
        escapeCsv(r.priority),
        escapeCsv(r.category),
        escapeCsv(r.location),
        escapeCsv(r.department),
        escapeCsv(r.assigned_staff),
        escapeCsv(r.reporter_name),
        escapeCsv(r.summary),
        escapeCsv(r.description),
        escapeCsv(r.admin_notes),
        escapeCsv(r.resolution_details)
      ].join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="campusguardian-reports.csv"');
    res.send(csvLines.join('\n'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export reports', details: err.message });
  }
});

// GET /api/reports/:id
router.get('/reports/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const report = dbService.getReportById(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && report.student_email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied to this report.' });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report', details: err.message });
  }
});

// POST /api/reports (Submit New Incident Report)
router.post('/reports', requireAuth, (req, res) => {
  try {
    const {
      description,
      location,
      title,
      category,
      priority,
      department,
      summary,
      recommendedAction,
      confidence,
      imageUrl
    } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Incident description is required.' });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ error: 'Campus location is required.' });
    }

    const reportData = {
      description: escapeHTML(description.trim()),
      location: escapeHTML(location.trim()),
      title: title ? escapeHTML(title.trim()) : null,
      category: escapeHTML(category || 'Other'),
      priority: escapeHTML(priority || 'Medium'),
      department: escapeHTML(department || 'General Campus Operations'),
      summary: escapeHTML(summary || description.trim().slice(0, 60)),
      recommendedAction: escapeHTML(recommendedAction || 'Inspect and assess site condition.'),
      confidence: confidence || 90,
      imageUrl: imageUrl || null // URL validation could be added here
    };

    const newReport = dbService.createReport(reportData, req.user);
    res.status(201).json(newReport);
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Failed to create report', details: err.message });
  }
});

// PATCH /api/reports/:id (Admin Update Status / Assignment / Notes)
router.patch('/reports/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      priority,
      category,
      department,
      assignedStaff,
      adminNotes,
      resolutionDetails,
      note
    } = req.body;

    const existing = dbService.getReportById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const updated = dbService.updateReport(id, {
      status,
      priority,
      category,
      department,
      assignedStaff,
      adminNotes,
      resolutionDetails,
      note
    }, req.user);

    res.json(updated);
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ error: 'Failed to update report', details: err.message });
  }
});


// --- 4. Disaster Indicator & Emergency Alerts ---

// GET /api/alerts (Public or Authenticated)
router.get('/alerts', (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const alerts = dbService.getAlerts(activeOnly);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch disaster alerts', details: err.message });
  }
});

// POST /api/alerts (Admin Only Create / Broadcast)
router.post('/alerts', requireAdmin, (req, res) => {
  try {
    const { title, category, severity, message, affectedArea, instructions } = req.body;

    if (!title || !category || !severity || !message || !affectedArea) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Title, category, severity, message, and affected area are required.'
      });
    }

    const validCategories = [
      'Earthquake', 'Fire', 'Flood', 'Severe Weather', 'Gas Leak',
      'Medical Emergency', 'Security Threat', 'Other Campus Emergency'
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid disaster category.' });
    }

    const validSeverities = ['Advisory', 'Warning', 'Critical'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity level (must be Advisory, Warning, or Critical).' });
    }

    const newAlert = dbService.createAlert({
      title: title.trim(),
      category,
      severity,
      message: message.trim(),
      affectedArea: affectedArea.trim(),
      instructions: (instructions || 'Follow official campus safety protocols.').trim()
    }, req.user);

    res.status(201).json(newAlert);
  } catch (err) {
    console.error('Error creating alert:', err);
    res.status(500).json({ error: 'Failed to publish disaster alert', details: err.message });
  }
});

// PATCH /api/alerts/:id (Admin Only Update or All-Clear)
router.patch('/alerts/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, allClearNotes, title, category, severity, message, affectedArea, instructions } = req.body;

    const existing = dbService.getAlertById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const updated = dbService.updateAlert(id, {
      status,
      allClearNotes,
      title,
      category,
      severity,
      message,
      affectedArea,
      instructions
    }, req.user);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert', details: err.message });
  }
});

// POST /api/alerts/:id/acknowledge (Student Acknowledges Safety Notice)
router.post('/alerts/:id/acknowledge', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const result = dbService.acknowledgeAlert(id, req.user.email);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to acknowledge alert', details: err.message });
  }
});

// GET /api/alerts/acknowledged (Get User's Acknowledged Alert IDs)
router.get('/alerts/acknowledged', requireAuth, (req, res) => {
  try {
    const acknowledgedIds = dbService.getUserAcknowledgedAlerts(req.user.email);
    res.json(acknowledgedIds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch acknowledgements', details: err.message });
  }
});

// --- 5. Audit Logging Endpoints (Admin Only) ---

// GET /api/audit-logs
router.get('/audit-logs', requireAdmin, (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const logs = dbService.getAuditLogs(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve audit logs', details: err.message });
  }
});

// --- 6. AI Incident Analysis & Campus Assistant ---

// POST /api/analyze (AI Triage)
router.post('/analyze', async (req, res) => {
  try {
    const text = req.body.text || req.body.description;
    const location = req.body.location || '';
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Incident description text is required.' });
    }

    const analysis = await analyzeIssue(text.trim(), location.trim());
    res.json(analysis);
  } catch (err) {
    console.error('Error analyzing issue:', err);
    res.status(500).json({ error: 'Failed to analyze issue', details: err.message });
  }
});

// POST /api/chat (GuardianBot Assistant)
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const response = await chatWithAssistant(message.trim(), history || []);
    res.json(response);
  } catch (err) {
    console.error('Error in chat assistant:', err);
    res.status(500).json({ error: 'Failed to communicate with assistant', details: err.message });
  }
});

// --- 7. Static Safety & Emergency Hotlines ---
const EMERGENCY_CONTACTS = [
  {
    id: 'sec-rapid',
    name: 'Campus Security Rapid Response',
    phone: '555-0199',
    extension: 'Ext. 5555',
    available: '24/7 / 365 Days',
    description: 'On-campus patrol dispatch, emergency blue light tower response, and SafeWalk night escorts.',
    badge: 'Immediate Dispatch',
    category: 'Security'
  },
  {
    id: 'med-center',
    name: 'University Health & Medical Center',
    phone: '555-0188',
    extension: 'Ext. 5556',
    available: '8:00 AM - 10:00 PM (Emergency on-call 24/7)',
    description: 'First aid, minor trauma triage, emergency allergic reaction care, and municipal paramedic coordination.',
    badge: 'Medical EMT',
    category: 'Medical'
  },
  {
    id: 'counsel-crisis',
    name: 'Campus Crisis & Mental Health Helpline',
    phone: '555-0177',
    extension: 'Ext. 5559',
    available: '24/7 Confidential',
    description: 'Trained psychological first aid responders for acute distress, trauma support, and student safety.',
    badge: 'Confidential',
    category: 'Mental Health'
  },
  {
    id: 'campus-admin',
    name: 'Campus Emergency Marshall & Operations',
    phone: '555-0166',
    extension: 'Ext. 5550',
    available: '24/7 Emergency Operations Center',
    description: 'Building evacuations, severe weather shelter coordination, hazardous spill containment, and infrastructure outages.',
    badge: 'Administration',
    category: 'Operations'
  }
];

const SAFETY_PROTOCOLS = [
  {
    id: 'proto-fire',
    title: 'Fire & Alarm Evacuation Protocol',
    steps: [
      'Immediately evacuate via designated stairwells — do NOT use elevators.',
      'Pull the nearest manual fire alarm station on your exit route.',
      'Assemble at your building\'s Designated Safe Assembly Point (Zone A - Green Lawn).',
      'Report any missing classmates or individuals requiring mobility assistance to Fire Wardens.'
    ]
  },
  {
    id: 'proto-weather',
    title: 'Severe Storm & Flash Flood Safety',
    steps: [
      'Move away from exterior glass windows and skylights into interior corridors.',
      'If on lower basement levels during flash flood alert, ascend to Level 2 or higher.',
      'Check CampusGuardian live safety broadcasts before traversing campus bridges.'
    ]
  },
  {
    id: 'proto-medical',
    title: 'Medical Emergency First Response',
    steps: [
      'Call Ext. 5556 or trigger Emergency SOS in CampusGuardian with your room number.',
      'Locate Automated External Defibrillator (AED) — available in every building lobby.',
      'Do not move an injured person with potential spinal injuries unless immediate hazard exists.',
      'Station someone at the building main entrance to guide EMT paramedics to the room.'
    ]
  },
  {
    id: 'proto-night',
    title: 'SafeWalk Escort Program',
    steps: [
      'Available every evening from 6:00 PM to 4:00 AM for any student or faculty.',
      'Request an officer to accompany you across campus to parking lots, dorms, or transit stops.',
      'Request via the app or pick up any Campus Blue Light station phone.'
    ]
  }
];

const ACCESSIBILITY_RESOURCES = {
  facilities: [
    {
      id: 'fac-1',
      name: 'Central Library North Ramp',
      type: 'Mobility Ramp',
      status: 'Attention Required',
      notes: 'Cargo obstruction reported; crew actively clearing pathway. South ramp fully operational.',
      accessibleRoute: 'Alternative: South Plaza automatic revolving door (Level 1)'
    },
    {
      id: 'fac-2',
      name: 'Science Complex Elevator Tower A',
      type: 'Elevator',
      status: 'Operational',
      notes: 'Equipped with tactile Braille buttons, voice floor annunciator, and emergency call panel.',
      accessibleRoute: 'Direct step-free access to all 5 laboratory levels'
    },
    {
      id: 'fac-3',
      name: 'Auditorium Magna Hearing Induction Loop',
      type: 'Audio Assistance',
      status: 'Operational',
      notes: 'T-coil induction loop active for students with hearing aids and FM receivers.',
      accessibleRoute: 'Reserve wireless receiver pack at AV control booth'
    },
    {
      id: 'fac-4',
      name: 'Student Center South Accessible Restrooms',
      type: 'Restroom Facility',
      status: 'Operational',
      notes: 'Gender-inclusive, ADA-compliant wide door, power activation button, emergency pull cord.',
      accessibleRoute: 'Ground Floor, adjacent to Wellness Lounge'
    },
    {
      id: 'fac-5',
      name: 'East Campus Shuttle Route 2 (Wheelchair Lift)',
      type: 'Transit',
      status: 'Operational',
      notes: 'Low-floor electric shuttle with automated hydraulic ramp and two secure wheelchair locks.',
      accessibleRoute: 'Departs every 12 mins from Campus Transit Hub'
    }
  ],
  services: [
    {
      title: 'Mobility & Wheelchair Assistance',
      description: 'Step-free campus route maps, automated power door maintenance, accessible golf cart escorts, and assistive shuttle scheduling.',
      contact: 'mobility@campusguardian.demo'
    },
    {
      title: 'Visual & Sensory Support',
      description: 'Braille signage inspection, tactile pavement audit, screen-reader friendly syllabus transcription, and high-contrast facility maps.',
      contact: 'visual-support@campusguardian.demo'
    },
    {
      title: 'Deaf & Hard of Hearing Support',
      description: 'Real-time CART captioning services for lectures, sign language interpreter booking, and visual strobe alarm verification.',
      contact: 'hearing-access@campusguardian.demo'
    },
    {
      title: 'Sensory & Neurodiversity Accommodations',
      description: 'Sensory decompression quiet pods located in Library 2nd floor and Student Pavilion 3rd floor.',
      contact: 'neuro-wellness@campusguardian.demo'
    }
  ]
};

router.get('/emergency', (req, res) => {
  res.json({
    contacts: EMERGENCY_CONTACTS,
    protocols: SAFETY_PROTOCOLS,
    campusDisclaimer: 'CAMPUS SAFETY NOTICE: This platform coordinates campus work orders and alerts. For immediate life-threatening emergencies, always dial municipal 911 / 112.'
  });
});

router.get('/accessibility', (req, res) => {
  res.json(ACCESSIBILITY_RESOURCES);
});

// --- 8. Health & System Status ---
router.get('/health', (req, res) => {
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  const stats = dbService.getSystemStats();

  res.json({
    status: 'healthy',
    service: 'CampusGuardian AI Backend',
    tagline: 'A Safer Campus. A Smarter Response.',
    database: 'SQLite (Persistent Storage node:sqlite DatabaseSync)',
    timestamp: new Date().toISOString(),
    aiEngine: {
      geminiConfigured: hasGemini,
      fallbackEngineActive: true,
      activeModel: hasGemini ? 'Gemini 2.0 Flash' : 'CampusGuardian RuleEngine (Active Offline)'
    },
    counts: {
      reports: stats.totalReports,
      activeAlerts: stats.activeAlerts
    }
  });
});

module.exports = router;
