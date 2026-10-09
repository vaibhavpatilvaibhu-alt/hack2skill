const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = API_BASE + path;
    const url = new URL(fullUrl);
    const headers = options.headers || {};
    let body = null;

    if (options.body) {
      body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(url, {
      method: options.method || 'GET',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runPriorityVerification() {
  console.log('======================================================================');
  console.log('🧪 VERIFYING CAMPUSGUARDIAN AI PRIORITIES & WORKFLOW (1 TO 8)');
  console.log('======================================================================\n');

  let studentToken = null;
  let adminToken = null;
  let testReportId = null;

  // Step 1: Student logs in
  console.log('--- STEP 1: Student Logs In ---');
  const studentLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'student@campusguardian.demo', password: 'student123' }
  });
  if (studentLoginRes.status !== 200 || !studentLoginRes.data.token) {
    throw new Error(`Student login failed: ${JSON.stringify(studentLoginRes.data)}`);
  }
  studentToken = studentLoginRes.data.token;
  console.log(`✅ Student logged in successfully. User: ${studentLoginRes.data.user.name} (${studentLoginRes.data.user.role})`);

  // Step 2: Student submits an incident report
  console.log('\n--- STEP 2: Student Submits a Report ---');
  const reportPayload = {
    title: 'High-voltage flicker in Library Study Room 4B',
    description: 'Fluorescent tubes flickering rapidly accompanied by burning electrical smell near Desk 12.',
    location: 'Central Library - Study Room 4B',
    category: 'Electrical Issue',
    priority: 'High',
    department: 'Campus Electrical & Utility Services',
    summary: 'High-voltage flicker in Library Study Room 4B',
    recommendedAction: 'Isolate circuit breaker and inspect ballast.',
    confidence: 96
  };
  const submitRes = await request('/reports', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: reportPayload
  });
  if (submitRes.status !== 201 || !submitRes.data.id) {
    throw new Error(`Report submission failed: ${JSON.stringify(submitRes.data)}`);
  }
  testReportId = submitRes.data.id;
  console.log(`✅ Report submitted. ID: ${testReportId}, Status: ${submitRes.data.status}`);

  // Step 3: Admin logs in & Report appears in Admin Dashboard
  console.log('\n--- STEP 3: Admin Logs In & Sees Report in Admin Dashboard ---');
  const adminLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@campusguardian.demo', password: 'admin123' }
  });
  if (adminLoginRes.status !== 200 || !adminLoginRes.data.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes.data)}`);
  }
  adminToken = adminLoginRes.data.token;
  console.log(`✅ Admin logged in. User: ${adminLoginRes.data.user.name} (${adminLoginRes.data.user.role})`);

  const adminReportsRes = await request('/reports', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (adminReportsRes.status !== 200 || !Array.isArray(adminReportsRes.data)) {
    throw new Error(`Admin failed to fetch reports: ${JSON.stringify(adminReportsRes.data)}`);
  }
  const foundInAdmin = adminReportsRes.data.find(r => r.id === testReportId);
  if (!foundInAdmin) {
    throw new Error(`Report ${testReportId} NOT found in Admin reports registry!`);
  }
  console.log(`✅ Report found in Admin Dashboard:`);
  console.log(`   - ID: ${foundInAdmin.id}`);
  console.log(`   - Title: ${foundInAdmin.title}`);
  console.log(`   - Category: ${foundInAdmin.category}`);
  console.log(`   - Location: ${foundInAdmin.location}`);
  console.log(`   - Priority: ${foundInAdmin.priority}`);
  console.log(`   - Status: ${foundInAdmin.status}`);
  console.log(`   - CreatedAt: ${foundInAdmin.createdAt || foundInAdmin.created_at}`);

  // Step 4: Admin updates report (triage, department, staff, notes, status)
  console.log('\n--- STEP 4: Admin Updates Report ---');
  const updatePayload = {
    status: 'In Progress',
    priority: 'Critical',
    department: 'Campus Electrical & Utility Services',
    assignedStaff: 'Officer T. Vance (Master Electrician)',
    adminNotes: 'Breaker panel isolated. Electrician dispatched to inspect Room 4B.',
    resolutionDetails: '',
    note: 'Escalated to Critical by Safety Ops Center'
  };
  const updateRes = await request(`/reports/${testReportId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: updatePayload
  });
  if (updateRes.status !== 200) {
    throw new Error(`Admin update failed: ${JSON.stringify(updateRes.data)}`);
  }
  console.log(`✅ Admin updated report ${testReportId}:`);
  console.log(`   - Status: ${updateRes.data.status}`);
  console.log(`   - Priority: ${updateRes.data.priority}`);
  console.log(`   - Department: ${updateRes.data.department}`);
  console.log(`   - Staff: ${updateRes.data.assignedStaff || updateRes.data.assigned_staff}`);
  console.log(`   - Admin Notes: ${updateRes.data.adminNotes || updateRes.data.admin_notes}`);

  // Step 5: Student sees updated status in My Reports
  console.log('\n--- STEP 5: Student Views Updated Status & Notes ---');
  const studentReportsRes = await request('/reports', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const updatedStudentReport = studentReportsRes.data.find(r => r.id === testReportId);
  if (!updatedStudentReport) {
    throw new Error(`Report missing from student report list!`);
  }
  if (updatedStudentReport.status !== 'In Progress') {
    throw new Error(`Expected status 'In Progress', got '${updatedStudentReport.status}'`);
  }
  if (!updatedStudentReport.adminNotes && !updatedStudentReport.admin_notes) {
    throw new Error(`Admin notes missing from student report!`);
  }
  console.log(`✅ Student successfully retrieved updated report:`);
  console.log(`   - Status: ${updatedStudentReport.status} (MATCHES ADMIN UPDATE)`);
  console.log(`   - Admin Notes: "${updatedStudentReport.adminNotes || updatedStudentReport.admin_notes}"`);
  console.log(`   - Assigned Staff: "${updatedStudentReport.assignedStaff || updatedStudentReport.assigned_staff}"`);

  // Step 6: Verify data persistence across session & direct DB queries
  console.log('\n--- STEP 6: Persistence & Session Restore ---');
  const restoreSessionRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (restoreSessionRes.status !== 200 || restoreSessionRes.data.user.role !== 'admin') {
    throw new Error('Admin session restore failed');
  }
  console.log(`✅ Session persistence validated for admin: ${restoreSessionRes.data.user.email}`);

  // Step 7: Admin logout and session invalidation
  console.log('\n--- STEP 7: Admin Logout & Protection Against Blank Screen ---');
  const logoutRes = await request('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (logoutRes.status !== 200) {
    throw new Error('Logout failed');
  }
  const invalidSessionRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (invalidSessionRes.status !== 401) {
    throw new Error('Invalidated token was not rejected with 401');
  }
  console.log(`✅ Logout successfully invalidated token. Unauthenticated requests guarded.`);

  // Step 8: Emergency Alerts and AI Analysis
  console.log('\n--- STEP 8: Emergency Alerts & AI Triage Verification ---');
  const aiTestRes = await request('/analyze', {
    method: 'POST',
    body: {
      description: 'Smell of smoke and burning plastic in chemistry basement lab.',
      location: 'Science Complex - Basement'
    }
  });
  if (aiTestRes.status !== 200 || !aiTestRes.data.category) {
    throw new Error('AI analysis failed');
  }
  console.log(`✅ AI Analysis response:`);
  console.log(`   - Category: ${aiTestRes.data.category}`);
  console.log(`   - Priority: ${aiTestRes.data.priority}`);
  console.log(`   - Confidence: ${aiTestRes.data.confidence}%`);

  const alertsRes = await request('/alerts');
  if (alertsRes.status !== 200 || !Array.isArray(alertsRes.data)) {
    throw new Error('Failed to fetch emergency alerts');
  }
  console.log(`✅ Emergency Alerts fetched: ${alertsRes.data.length} active alerts in database.`);

  console.log('\n======================================================================');
  console.log('🎉 ALL 8 WORKFLOW REQUIREMENTS SUCCESSFULLY VERIFIED & PASSING!');
  console.log('======================================================================');
}

runPriorityVerification().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
