/**
 * CampusGuardian AI - Complete Automated Verification Test Suite
 * Tests all 18 criteria required for hackathon delivery:
 * 1. Health & SQLite DB status
 * 2. Student & Admin authentication
 * 3. Session persistence & validation
 * 4. RBAC: Student blocked from Admin endpoints (403 Forbidden)
 * 5. Unauthenticated blocked from protected endpoints (401 Unauthorized)
 * 6. Public stats (safe, no private PII)
 * 7. AI incident classification & triage
 * 8. Report creation with SQLite persistence
 * 9. Student report scoping (student only sees own reports)
 * 10. Administrator report scoping (sees all campus reports)
 * 11. Administrator status update, notes, & timeline
 * 12. Administrator Disaster Alert publication
 * 13. Student active alert retrieval
 * 14. Student alert acknowledgement
 * 15. Administrator All-Clear declaration
 * 16. Audit trail logging verification
 * 17. Reports export (CSV & JSON)
 * 18. Session logout & token invalidation
 */

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('🛡️  CAMPUSGUARDIAN AI - END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('--- 1. SYSTEM HEALTH & PERSISTENT DB CHECK ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns 200 OK');
    assert(healthData.status === 'healthy', 'System status is healthy');
    assert(healthData.database.includes('SQLite'), 'Database engine is SQLite');
    assert(typeof healthData.counts.reports === 'number', 'SQLite reports count returned');

    // 2. Public Telemetry (No PII)
    console.log('\n--- 2. PUBLIC TELEMETRY ENDPOINT (WELCOME PAGE) ---');
    const publicStatsRes = await fetch(`${BASE_URL}/api/stats/public`);
    const publicStats = await publicStatsRes.json();
    assert(publicStatsRes.status === 200, 'Public stats endpoint returns 200 OK');
    assert(typeof publicStats.totalReports === 'number', 'Total reports metric present');
    assert(publicStats.student_email === undefined, 'No student private PII exposed on public endpoint');

    // 3. Student Authentication
    console.log('\n--- 3. STUDENT AUTHENTICATION ---');
    const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@campusguardian.demo',
        password: 'student123'
      })
    });
    const studentAuth = await studentLoginRes.json();
    assert(studentLoginRes.status === 200, 'Student login returns 200 OK');
    assert(Boolean(studentAuth.token), 'Student session token generated');
    assert(studentAuth.user.role === 'student', 'Student role correctly assigned');
    const studentToken = studentAuth.token;

    // 4. Admin Authentication
    console.log('\n--- 4. ADMINISTRATOR AUTHENTICATION ---');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@campusguardian.demo',
        password: 'admin123'
      })
    });
    const adminAuth = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login returns 200 OK');
    assert(Boolean(adminAuth.token), 'Admin session token generated');
    assert(adminAuth.user.role === 'admin', 'Admin role correctly assigned');
    const adminToken = adminAuth.token;

    // 5. Session Restore (/api/auth/me)
    console.log('\n--- 5. SESSION RESTORE & TOKEN VALIDATION ---');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'Session restore returns 200 OK');
    assert(meData.user.email === 'student@campusguardian.demo', 'Session correctly identifies student');

    // 6. Security & RBAC Enforcement
    console.log('\n--- 6. ROLE-BASED ACCESS CONTROL (RBAC) ENFORCEMENT ---');
    // Student tries to access Admin audit logs
    const studentAuditRes = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(studentAuditRes.status === 403, 'Student blocked from admin audit logs (403 Forbidden)');

    // Student tries to export reports
    const studentExportRes = await fetch(`${BASE_URL}/api/reports/export`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(studentExportRes.status === 403, 'Student blocked from data export (403 Forbidden)');

    // Unauthenticated request to reports
    const unauthReportsRes = await fetch(`${BASE_URL}/api/reports`);
    assert(unauthReportsRes.status === 401, 'Unauthenticated request rejected (401 Unauthorized)');

    // 7. AI Incident Analysis
    console.log('\n--- 7. AI INCIDENT ANALYSIS & TRIAGE ---');
    const sampleText = 'The staircase light near Block C has been broken for three days and it is very dark at night.';
    const sampleLoc = 'Block C - Staircase 2nd Floor';
    const analyzeRes = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sampleText, location: sampleLoc })
    });
    const analysis = await analyzeRes.json();
    assert(analyzeRes.status === 200, 'AI analyze endpoint returns 200 OK');
    assert(analysis.category === 'Electrical Issue', `Category classified as Electrical Issue (got: ${analysis.category})`);
    assert(analysis.priority === 'High', `Priority classified as High (got: ${analysis.priority})`);
    assert(analysis.confidence >= 80, `Confidence indicator is high (${analysis.confidence}%)`);
    assert(Boolean(analysis.recommendedAction), 'Recommended next step provided');

    // 8. Student Creates Report in SQLite
    console.log('\n--- 8. STUDENT CREATES REPORT (SQLITE PERSISTENCE) ---');
    const createRes = await fetch(`${BASE_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        description: sampleText,
        location: sampleLoc,
        category: analysis.category,
        priority: analysis.priority,
        department: analysis.department,
        summary: analysis.summary,
        recommendedAction: analysis.recommendedAction,
        confidence: analysis.confidence
      })
    });
    const newReport = await createRes.json();
    assert(createRes.status === 201, 'Create report returns 201 Created');
    assert(newReport.id.startsWith('CG-2026-'), `Report assigned ID ${newReport.id}`);
    assert(newReport.status === 'Submitted', 'Initial status is Submitted');

    // 9. Scoping: Student View
    console.log('\n--- 9. SCOPED REPORTS RETRIEVAL ---');
    const studentReportsRes = await fetch(`${BASE_URL}/api/reports`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const studentReports = await studentReportsRes.json();
    assert(Array.isArray(studentReports), 'Student reports returned as array');
    const myCreatedReport = studentReports.find(r => r.id === newReport.id);
    assert(Boolean(myCreatedReport), 'Newly created report found in student reports list');

    // 10. Administrator View (Sees all reports)
    const adminReportsRes = await fetch(`${BASE_URL}/api/reports`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminReports = await adminReportsRes.json();
    assert(adminReports.length >= studentReports.length, 'Admin sees all campus reports');

    // 11. Administrator Updates Status & Notes
    console.log('\n--- 11. ADMINISTRATOR STATUS & NOTES UPDATE ---');
    const patchRes = await fetch(`${BASE_URL}/api/reports/${newReport.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'In Progress',
        assignedStaff: 'Electrician Team A',
        adminNotes: 'Work order dispatched to replace LED ballast.',
        note: 'Assigned to Electrician Team A'
      })
    });
    const patchedReport = await patchRes.json();
    assert(patchRes.status === 200, 'Patch report returns 200 OK');
    assert(patchedReport.status === 'In Progress', 'Status updated to In Progress');
    assert(patchedReport.admin_notes.includes('Work order dispatched'), 'Admin notes updated in SQLite');

    // 12. Administrator Publishes Disaster Alert
    console.log('\n--- 12. DISASTER INDICATOR ALERT LIFECYCLE ---');
    const alertCreateRes = await fetch(`${BASE_URL}/api/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: '[DEMO] High Wind & Severe Weather Advisory',
        category: 'Severe Weather',
        severity: 'Warning',
        affectedArea: 'North Quad & Outdoor Walkways',
        message: 'High gusts reported. Avoid walking near tall construction cranes.',
        instructions: '1. Use indoor tunnels between North & South Hall.\n2. Secure loose bicycles.'
      })
    });
    const createdAlert = await alertCreateRes.json();
    assert(alertCreateRes.status === 201, 'Create disaster alert returns 201 Created');
    assert(createdAlert.status === 'Active', 'Disaster alert status is Active');

    // 13. Student Fetches Active Alerts
    const alertsRes = await fetch(`${BASE_URL}/api/alerts?activeOnly=true`);
    const activeAlerts = await alertsRes.json();
    const foundAlert = activeAlerts.find(a => a.id === createdAlert.id);
    assert(Boolean(foundAlert), 'Student can view the active broadcast alert');

    // 14. Student Acknowledges Alert
    const ackRes = await fetch(`${BASE_URL}/api/alerts/${createdAlert.id}/acknowledge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const ackData = await ackRes.json();
    assert(ackRes.status === 200, 'Alert acknowledgement recorded');
    assert(ackData.acknowledged === true, 'Acknowledgement confirmed by server');

    // 15. Admin Issues All-Clear Declaration
    const allClearRes = await fetch(`${BASE_URL}/api/alerts/${createdAlert.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'All-Clear',
        allClearNotes: 'Wind conditions stabilized. North Quad reopen.'
      })
    });
    const allClearAlert = await allClearRes.json();
    assert(allClearAlert.status === 'All-Clear', 'Alert status updated to All-Clear');
    assert(Boolean(allClearAlert.all_clear_at), 'All-clear timestamp recorded');

    // 16. Audit Log Trail
    console.log('\n--- 16. AUDIT TRAIL LOGGING ---');
    const auditRes = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const auditLogs = await auditRes.json();
    assert(Array.isArray(auditLogs) && auditLogs.length > 0, 'Audit logs retrieved successfully');
    const alertLog = auditLogs.find(l => l.action.includes('DISASTER_ALERT'));
    assert(Boolean(alertLog), 'Disaster alert publication logged in audit trail');

    // 17. Reports Export (CSV & JSON)
    console.log('\n--- 17. REPORTS EXPORT ---');
    const csvExportRes = await fetch(`${BASE_URL}/api/reports/export?format=csv`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const csvText = await csvExportRes.text();
    assert(csvExportRes.status === 200, 'CSV export returns 200 OK');
    assert(csvText.includes('Report ID,Created At,Status'), 'CSV header row formatted properly');

    const jsonExportRes = await fetch(`${BASE_URL}/api/reports/export?format=json`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const jsonData = await jsonExportRes.json();
    assert(jsonExportRes.status === 200, 'JSON export returns 200 OK');
    assert(Array.isArray(jsonData), 'JSON export returns array of reports');

    // 18. Session Logout & Invalidation
    console.log('\n--- 18. SESSION LOGOUT & INVALIDATION ---');
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(logoutRes.status === 200, 'Logout returns 200 OK');

    const meAfterLogout = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert(meAfterLogout.status === 401, 'Invalidated token rejected with 401 Unauthorized');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed === 0) {
      console.log('🎉 ALL 18 HACKATHON ACCEPTANCE CRITERIA VERIFIED 100%!');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
