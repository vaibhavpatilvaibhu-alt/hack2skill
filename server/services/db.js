/**
 * CampusGuardian AI - Persistent SQLite Database Service
 * Uses Node.js native DatabaseSync (node:sqlite)
 * Provides persistent storage for Reports, Disaster Alerts, Audit Logs, Users, and Sessions.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

// Ensure database directory exists
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'campusguardian.sqlite');
const db = new DatabaseSync(DB_PATH);

// Initialize schema and PRAGMAs
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// 1. Schema Definition
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'student' | 'admin'
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    student_email TEXT NOT NULL,
    reporter_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    department TEXT NOT NULL,
    assigned_staff TEXT,
    admin_notes TEXT,
    resolution_details TEXT,
    summary TEXT,
    recommended_action TEXT,
    confidence INTEGER DEFAULT 90,
    image_url TEXT,
    timeline TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    affected_area TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Active' | 'All-Clear' | 'Expired'
    instructions TEXT NOT NULL,
    issuing_admin TEXT NOT NULL,
    issued_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    all_clear_at TEXT,
    all_clear_notes TEXT,
    is_simulated INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS alert_acknowledgements (
    id TEXT PRIMARY KEY,
    alert_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    acknowledged_at TEXT NOT NULL,
    UNIQUE(alert_id, user_email)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    target_id TEXT,
    timestamp TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_reports_student ON reports(student_email);
  CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
  CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);
  CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
  CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
`);

// Password hashing helper
function hashPassword(password, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(key, 'hex'));
}

// Seed Demo Users if not present
function seedUsers() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const result = countStmt.get();
  if (result.count === 0) {
    const studentPass = process.env.DEMO_STUDENT_PASSWORD || 'student123';
    const adminPass = process.env.DEMO_ADMIN_PASSWORD || 'admin123';
    const now = new Date().toISOString();

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'usr-student-001',
      process.env.DEMO_STUDENT_EMAIL || 'student@campusguardian.demo',
      hashPassword(studentPass),
      'Alex Rivera (Student)',
      'student',
      now
    );

    insertUser.run(
      'usr-admin-001',
      process.env.DEMO_ADMIN_EMAIL || 'admin@campusguardian.demo',
      hashPassword(adminPass),
      'Dr. Sarah Chen (Campus Safety Director)',
      'admin',
      now
    );

    console.log('✅ Demo accounts seeded in SQLite database:');
    console.log('   - Student: student@campusguardian.demo');
    console.log('   - Admin:   admin@campusguardian.demo');
  }
}

// Seed Initial Reports if empty
function seedReports() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM reports');
  const result = countStmt.get();
  if (result.count === 0) {
    const insertReport = db.prepare(`
      INSERT INTO reports (
        id, student_email, reporter_name, title, description, category,
        location, priority, status, department, assigned_staff, admin_notes,
        resolution_details, summary, recommended_action, confidence, image_url,
        timeline, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialData = [
      {
        id: 'CG-2026-1001',
        student_email: 'student@campusguardian.demo',
        reporter_name: 'Alex Rivera (Student)',
        title: 'Broken staircase lighting creating nocturnal fall hazard',
        description: 'The staircase light near Block C has been broken for three days and it is very dark at night.',
        category: 'Electrical Issue',
        location: 'Block C - Staircase 2nd Floor',
        priority: 'High',
        status: 'In Progress',
        department: 'Facilities Management & Maintenance',
        assigned_staff: 'Officer M. Davies (Facilities)',
        admin_notes: 'Work order dispatched to electrical team. LED fixture replacement queued.',
        resolution_details: '',
        summary: 'Broken lighting near Block C staircase creating nocturnal fall hazard',
        recommended_action: 'Inspect electrical fixture, replace ballast/LED bulb, verify ambient illumination.',
        confidence: 95,
        image_url: null,
        timeline: JSON.stringify([
          { status: 'Submitted', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Logged via CampusGuardian AI' },
          { status: 'Under Review', timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), note: 'AI triage verified by Ops Center' },
          { status: 'In Progress', timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), note: 'Work Order #WO-8912 issued' }
        ]),
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
      },
      {
        id: 'CG-2026-1002',
        student_email: 'student@campusguardian.demo',
        reporter_name: 'Alex Rivera (Student)',
        title: 'Wheelchair access ramp obstructed by heavy cargo',
        description: 'Wheelchair access ramp at North Library entrance is obstructed by heavy delivery crates and construction signage.',
        category: 'Accessibility',
        location: 'Central Library - North Ramp Entrance',
        priority: 'Critical',
        status: 'Assigned',
        department: 'Disability & Accessibility Infrastructure',
        assigned_staff: 'Accessibility Rapid Response (J. Miller)',
        admin_notes: 'Urgent notice sent to delivery vendor. Facilities dispatched to clear pathway immediately.',
        resolution_details: '',
        summary: 'Wheelchair accessibility ramp obstructed by heavy cargo',
        recommended_action: 'Immediate dispatch to clear obstruction, inspect slope compliance, and ensure ADA clearance.',
        confidence: 98,
        image_url: null,
        timeline: JSON.stringify([
          { status: 'Submitted', timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), note: 'Reported via Student Portal' },
          { status: 'Assigned', timestamp: new Date(Date.now() - 17 * 3600 * 1000).toISOString(), note: 'Escalated to Critical by Accessibility Coordinator' }
        ]),
        created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 17 * 3600 * 1000).toISOString()
      },
      {
        id: 'CG-2026-1003',
        student_email: 'student@campusguardian.demo',
        reporter_name: 'Alex Rivera (Student)',
        title: 'Overhead projector input signal failure and cable spark',
        description: 'Overhead projector in Science Hall 302 won\'t recognize HDMI inputs and cable shows visible spark when connected.',
        category: 'Electrical Issue',
        location: 'Science Complex - Lecture Hall 302',
        priority: 'Medium',
        status: 'Resolved',
        department: 'Campus IT & Audiovisual Infrastructure',
        assigned_staff: 'IT Support Desk (Tech Alex)',
        admin_notes: 'Ground fault isolated. Replaced faulty AV surge protector and HDMI wall port.',
        resolution_details: 'Replaced AV matrix switcher cable, verified earth grounding, and ran signal load test.',
        summary: 'Classroom projector HDMI port electrical issue and signal failure',
        recommended_action: 'Replace AV matrix switcher cable and perform electrical test on controller.',
        confidence: 92,
        image_url: null,
        timeline: JSON.stringify([
          { status: 'Submitted', timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), note: 'Report submitted' },
          { status: 'In Progress', timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(), note: 'Electrician and AV tech on-site' },
          { status: 'Resolved', timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), note: 'Hardware replaced and tested successfully' }
        ]),
        created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
      },
      {
        id: 'CG-2026-1004',
        student_email: 'student@campusguardian.demo',
        reporter_name: 'Alex Rivera (Student)',
        title: 'Plumbing leak under washroom sink risking floor water damage',
        description: 'High-pressure water pipe leaking under hand wash sink in Ground Floor Restroom of Engineering Wing B.',
        category: 'Building Maintenance',
        location: 'Engineering Wing B - Ground Floor Washroom',
        priority: 'High',
        status: 'Under Review',
        department: 'Facilities Management & Maintenance',
        assigned_staff: 'Pending Assignment',
        admin_notes: 'Custodial placed caution cones. Plumber on duty notified.',
        resolution_details: '',
        summary: 'Plumbing leak under washroom sink risking floor water damage',
        recommended_action: 'Shut off isolation valve and replace fractured coupling.',
        confidence: 96,
        image_url: null,
        timeline: JSON.stringify([
          { status: 'Submitted', timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), note: 'Logged with priority alert' },
          { status: 'Under Review', timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), note: 'Facilities dispatcher evaluating pipe access' }
        ]),
        created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
      },
      {
        id: 'CG-2026-1005',
        student_email: 'student@campusguardian.demo',
        reporter_name: 'Alex Rivera (Student)',
        title: 'Broken window latch on ground-floor study lounge',
        description: 'The exterior latch on window 2 of East Study Lounge does not lock, allowing opening from outside.',
        category: 'Security',
        location: 'East Hall - Ground Floor Study Lounge',
        priority: 'Medium',
        status: 'Submitted',
        department: 'Campus Security & Safety Operations',
        assigned_staff: 'Patrol Sector 2',
        admin_notes: '',
        resolution_details: '',
        summary: 'Exterior window latch failure posing perimeter security vulnerability',
        recommended_action: 'Locksmith to replace locking mechanism; security patrol to monitor during rounds.',
        confidence: 94,
        image_url: null,
        timeline: JSON.stringify([
          { status: 'Submitted', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'Report logged by student' }
        ]),
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ];

    for (const r of initialData) {
      insertReport.run(
        r.id, r.student_email, r.reporter_name, r.title, r.description,
        r.category, r.location, r.priority, r.status, r.department,
        r.assigned_staff, r.admin_notes, r.resolution_details, r.summary,
        r.recommended_action, r.confidence, r.image_url, r.timeline,
        r.created_at, r.updated_at
      );
    }
    console.log('✅ Initial campus reports seeded in SQLite database.');
  }
}

// Seed Initial Alerts if empty
function seedAlerts() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM alerts');
  const result = countStmt.get();
  if (result.count === 0) {
    const insertAlert = db.prepare(`
      INSERT INTO alerts (
        id, title, category, severity, message, affected_area, status,
        instructions, issuing_admin, issued_at, updated_at, all_clear_at,
        all_clear_notes, is_simulated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAlert.run(
      'ALERT-2026-001',
      '[DEMO] Severe Weather & Flash Flood Advisory',
      'Severe Weather',
      'Warning',
      'Heavy rainfall and high winds forecasted across campus quad. Ground maintenance has deployed water diversion pumps along the lower creek walkway.',
      'West Quad Lower Level & Creek Walkway',
      'Active',
      '1. Exercise caution near low-lying campus paths.\n2. Avoid using the basement bicycle parking tunnel.\n3. Report standing water or drainage blockages via CampusGuardian AI.\n4. Follow designated indoor bridges between buildings.',
      'Dr. Sarah Chen (Campus Safety Director)',
      new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      null,
      null,
      1
    );

    insertAlert.run(
      'ALERT-2026-002',
      '[DEMO] Electrical Substation Maintenance - All Clear',
      'Electrical Issue',
      'Advisory',
      'Scheduled electrical breaker inspection for Science Complex Tower B has completed ahead of schedule. All elevators and laboratory power circuits are fully operational.',
      'Science Complex Tower B',
      'All-Clear',
      'Regular class and laboratory activities have resumed. No further precautions required.',
      'Dr. Sarah Chen (Campus Safety Director)',
      new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      'Substation transformers certified safe by municipal grid engineers.',
      1
    );

    console.log('✅ Demo Disaster Indicator alerts seeded in SQLite database.');
  }
}

// Execute seeds
seedUsers();
seedReports();
seedAlerts();

// Database Interface Methods

// --- Auth & Sessions ---
function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
  return stmt.get(email);
}

function getUserById(id) {
  const stmt = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?');
  return stmt.get(id);
}

function createSession(userId, role, expiryHours = 168) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expires = new Date(now.getTime() + expiryHours * 3600 * 1000);

  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id, role, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(token, userId, role, expires.toISOString(), now.toISOString());

  return { token, expiresAt: expires.toISOString() };
}

function getSession(token) {
  if (!token) return null;
  const stmt = db.prepare(`
    SELECT s.token, s.user_id, s.role, s.expires_at, u.email, u.name
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `);
  const session = stmt.get(token);
  if (!session) return null;

  if (new Date(session.expires_at) < new Date()) {
    deleteSession(token);
    return null;
  }
  return session;
}

function deleteSession(token) {
  if (!token) return;
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
}

// --- Reports ---
function parseReport(row) {
  if (!row) return null;
  let timeline = [];
  try {
    timeline = JSON.parse(row.timeline || '[]');
  } catch (e) {
    timeline = [];
  }

  const id = row.id || '';
  const title = row.title || row.summary || row.description || 'Campus Incident';
  const description = row.description || '';
  const summary = row.summary || title;
  const category = row.category || 'Other';
  const location = row.location || 'Campus Wide';
  const priority = row.priority || 'Medium';
  const status = row.status || 'Submitted';
  const department = row.department || 'General Campus Operations';
  const assignedStaff = row.assigned_staff || '';
  const adminNotes = row.admin_notes || '';
  const resolutionDetails = row.resolution_details || '';
  const recommendedAction = row.recommended_action || 'Inspect and assess site condition.';
  const studentEmail = row.student_email || '';
  const reporterName = row.reporter_name || '';
  const confidence = row.confidence !== undefined ? row.confidence : 90;
  const imageUrl = row.image_url || null;
  const createdAt = row.created_at || new Date().toISOString();
  const updatedAt = row.updated_at || createdAt;

  return {
    ...row,
    id,
    title,
    description,
    summary,
    category,
    location,
    priority,
    status,
    department,
    // snake_case
    assigned_staff: assignedStaff,
    admin_notes: adminNotes,
    resolution_details: resolutionDetails,
    recommended_action: recommendedAction,
    student_email: studentEmail,
    reporter_name: reporterName,
    image_url: imageUrl,
    created_at: createdAt,
    updated_at: updatedAt,
    // camelCase
    assignedStaff,
    adminNotes,
    resolutionDetails,
    recommendedAction,
    studentEmail,
    reporterName,
    imageUrl,
    createdAt,
    updatedAt,
    confidence,
    timeline
  };
}

function getAllReports(filters = {}) {
  let query = 'SELECT * FROM reports WHERE 1=1';
  const params = [];

  if (filters.status && filters.status !== 'All') {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.priority && filters.priority !== 'All') {
    query += ' AND priority = ?';
    params.push(filters.priority);
  }
  if (filters.category && filters.category !== 'All') {
    query += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters.search) {
    query += ' AND (id LIKE ? OR location LIKE ? OR description LIKE ? OR department LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const limit = parseInt(filters.limit, 10) || 100;
  const offset = parseInt(filters.offset, 10) || 0;
  params.push(limit, offset);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);
  return rows.map(parseReport);
}

function getReportsByStudent(studentEmail, filters = {}) {
  let query = 'SELECT * FROM reports WHERE LOWER(student_email) = LOWER(?)';
  const params = [studentEmail];

  if (filters.status && filters.status !== 'All') {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.priority && filters.priority !== 'All') {
    query += ' AND priority = ?';
    params.push(filters.priority);
  }
  if (filters.search) {
    query += ' AND (id LIKE ? OR location LIKE ? OR description LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const limit = parseInt(filters.limit, 10) || 100;
  const offset = parseInt(filters.offset, 10) || 0;
  params.push(limit, offset);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);
  return rows.map(parseReport);
}

function getReportById(id) {
  const stmt = db.prepare('SELECT * FROM reports WHERE id = ?');
  return parseReport(stmt.get(id));
}

function createReport(data, user) {
  const id = `CG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const timeline = [
    {
      status: 'Submitted',
      timestamp: now,
      note: 'Report logged via CampusGuardian AI'
    }
  ];

  const studentEmail = user ? user.email : 'student@campusguardian.demo';
  const reporterName = user ? user.name : 'Student Reporter';

  const stmt = db.prepare(`
    INSERT INTO reports (
      id, student_email, reporter_name, title, description, category,
      location, priority, status, department, assigned_staff, admin_notes,
      resolution_details, summary, recommended_action, confidence, image_url,
      timeline, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    studentEmail,
    reporterName,
    data.title || data.summary || (data.description ? data.description.slice(0, 60) : 'Campus Incident'),
    data.description || '',
    data.category || 'Other',
    data.location || 'Campus Wide',
    data.priority || 'Medium',
    'Submitted',
    data.department || 'General Campus Operations',
    'Pending Triage',
    '',
    '',
    data.summary || (data.description ? data.description.slice(0, 60) : 'Campus Incident'),
    data.recommendedAction || data.recommended_action || 'Inspect and assess site condition.',
    data.confidence || 90,
    data.imageUrl || data.image_url || null,
    JSON.stringify(timeline),
    now,
    now
  );

  return getReportById(id);
}

function updateReport(id, updates, adminUser) {
  const existing = getReportById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const timeline = [...(existing.timeline || [])];

  if (updates.status && updates.status !== existing.status) {
    timeline.push({
      status: updates.status,
      timestamp: now,
      note: updates.note || `Status updated to ${updates.status} by ${adminUser.name}`
    });
  }

  const category = updates.category !== undefined ? updates.category : existing.category;
  const priority = updates.priority !== undefined ? updates.priority : existing.priority;
  const status = updates.status !== undefined ? updates.status : existing.status;
  const department = updates.department !== undefined ? updates.department : existing.department;
  const assignedStaff = updates.assignedStaff !== undefined
    ? updates.assignedStaff
    : (updates.assigned_staff !== undefined ? updates.assigned_staff : existing.assigned_staff);
  const adminNotes = updates.adminNotes !== undefined
    ? updates.adminNotes
    : (updates.admin_notes !== undefined ? updates.admin_notes : existing.admin_notes);
  const resolutionDetails = updates.resolutionDetails !== undefined
    ? updates.resolutionDetails
    : (updates.resolution_details !== undefined ? updates.resolution_details : existing.resolution_details);

  const stmt = db.prepare(`
    UPDATE reports
    SET category = ?,
        priority = ?,
        status = ?,
        department = ?,
        assigned_staff = ?,
        admin_notes = ?,
        resolution_details = ?,
        timeline = ?,
        updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    category,
    priority,
    status,
    department,
    assignedStaff || '',
    adminNotes || '',
    resolutionDetails || '',
    JSON.stringify(timeline),
    now,
    id
  );

  // Add audit log
  const changes = [];
  if (updates.status && updates.status !== existing.status) changes.push(`status -> ${updates.status}`);
  if (updates.priority && updates.priority !== existing.priority) changes.push(`priority -> ${updates.priority}`);
  if (updates.department && updates.department !== existing.department) changes.push(`dept -> ${updates.department}`);
  if (updates.assignedStaff && updates.assignedStaff !== existing.assigned_staff) changes.push(`assigned -> ${updates.assignedStaff}`);

  addAuditLog(
    adminUser.email,
    adminUser.role,
    'UPDATE_REPORT',
    `Updated report ${id}: ${changes.join(', ') || 'notes updated'}`,
    id
  );

  return getReportById(id);
}

// --- Disaster Alerts ---
function getAlerts(activeOnly = false) {
  let query = 'SELECT * FROM alerts';
  if (activeOnly) {
    query += " WHERE status = 'Active'";
  }
  query += " ORDER BY CASE status WHEN 'Active' THEN 1 WHEN 'Warning' THEN 2 ELSE 3 END, issued_at DESC";
  const stmt = db.prepare(query);
  return stmt.all();
}

function getAlertById(id) {
  const stmt = db.prepare('SELECT * FROM alerts WHERE id = ?');
  return stmt.get(id);
}

function createAlert(data, adminUser) {
  const id = `ALERT-2026-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  const isCritical = data.severity === 'Critical';
  const prefix = data.title.startsWith('[DEMO]') || data.title.startsWith('[SIMULATED]') ? '' : '[DEMO] ';

  const stmt = db.prepare(`
    INSERT INTO alerts (
      id, title, category, severity, message, affected_area, status,
      instructions, issuing_admin, issued_at, updated_at, all_clear_at,
      all_clear_notes, is_simulated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    `${prefix}${data.title}`,
    data.category,
    data.severity,
    data.message,
    data.affectedArea,
    'Active',
    data.instructions,
    adminUser.name || 'Campus Emergency Operations',
    now,
    now,
    null,
    null,
    1
  );

  addAuditLog(
    adminUser.email,
    adminUser.role,
    isCritical ? 'CRITICAL_DISASTER_ALERT_PUBLISHED' : 'DISASTER_ALERT_PUBLISHED',
    `Published ${data.severity} alert "${data.title}" for area "${data.affectedArea}"`,
    id
  );

  return getAlertById(id);
}

function updateAlert(id, updates, adminUser) {
  const existing = getAlertById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  let status = updates.status || existing.status;
  let allClearAt = existing.all_clear_at;
  let allClearNotes = existing.all_clear_notes;

  if (updates.status === 'All-Clear' && existing.status !== 'All-Clear') {
    allClearAt = now;
    allClearNotes = updates.allClearNotes || 'All clear issued by Campus Operations.';
  }

  const stmt = db.prepare(`
    UPDATE alerts
    SET title = ?,
        category = ?,
        severity = ?,
        message = ?,
        affected_area = ?,
        status = ?,
        instructions = ?,
        all_clear_at = ?,
        all_clear_notes = ?,
        updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    updates.title || existing.title,
    updates.category || existing.category,
    updates.severity || existing.severity,
    updates.message || existing.message,
    updates.affectedArea || existing.affected_area,
    status,
    updates.instructions || existing.instructions,
    allClearAt,
    allClearNotes,
    now,
    id
  );

  addAuditLog(
    adminUser.email,
    adminUser.role,
    status === 'All-Clear' ? 'DISASTER_ALERT_ALL_CLEAR' : 'UPDATE_DISASTER_ALERT',
    `Updated alert ${id} (Status: ${status})`,
    id
  );

  return getAlertById(id);
}

function acknowledgeAlert(alertId, userEmail) {
  const id = `ACK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  try {
    const stmt = db.prepare(`
      INSERT INTO alert_acknowledgements (id, alert_id, user_email, acknowledged_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, alertId, userEmail, now);
    return { acknowledged: true, alertId, acknowledgedAt: now };
  } catch (err) {
    // Already acknowledged
    return { acknowledged: true, alertId, alreadyAcknowledged: true };
  }
}

function getUserAcknowledgedAlerts(userEmail) {
  const stmt = db.prepare('SELECT alert_id FROM alert_acknowledgements WHERE user_email = ?');
  const rows = stmt.all(userEmail);
  return rows.map(r => r.alert_id);
}

// --- Audit Logging ---
function addAuditLog(actorEmail, actorRole, action, details, targetId = null) {
  const id = `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO audit_logs (id, actor_email, actor_role, action, details, target_id, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, actorEmail, actorRole, action, details, targetId, now);
}

function getAuditLogs(limit = 100) {
  const stmt = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?');
  return stmt.all(limit);
}

// --- Statistics & Health ---
function getSystemStats() {
  const totalReports = db.prepare('SELECT COUNT(*) as count FROM reports').get().count;
  const newReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'Submitted'").get().count;
  const inProgress = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status IN ('Under Review', 'Assigned', 'In Progress')").get().count;
  const resolvedReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status IN ('Resolved', 'Closed')").get().count;
  const criticalReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE priority = 'Critical'").get().count;
  const activeAlerts = db.prepare("SELECT COUNT(*) as count FROM alerts WHERE status = 'Active'").get().count;

  // Category breakdown
  const categoryRows = db.prepare('SELECT category, COUNT(*) as count FROM reports GROUP BY category').all();
  const categoryStats = {};
  for (const row of categoryRows) {
    categoryStats[row.category] = row.count;
  }

  // Priority breakdown
  const priorityRows = db.prepare('SELECT priority, COUNT(*) as count FROM reports GROUP BY priority').all();
  const priorityStats = {};
  for (const row of priorityRows) {
    priorityStats[row.priority] = row.count;
  }

  // Status breakdown
  const statusRows = db.prepare('SELECT status, COUNT(*) as count FROM reports GROUP BY status').all();
  const statusStats = {};
  for (const row of statusRows) {
    statusStats[row.status] = row.count;
  }

  return {
    totalReports,
    newReports,
    inProgress,
    resolvedReports,
    criticalReports,
    activeAlerts,
    categoryStats,
    priorityStats,
    statusStats
  };
}

module.exports = {
  db,
  hashPassword,
  verifyPassword,
  getUserByEmail,
  getUserById,
  createSession,
  getSession,
  deleteSession,
  getAllReports,
  getReportsByStudent,
  getReportById,
  createReport,
  updateReport,
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  acknowledgeAlert,
  getUserAcknowledgedAlerts,
  addAuditLog,
  getAuditLogs,
  getSystemStats
};
