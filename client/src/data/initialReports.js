export const INITIAL_REPORTS = [
  {
    id: 'CG-2026-1001',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    description: 'The staircase light near Block C has been broken for three days and it is very dark at night.',
    location: 'Block C - Staircase 2nd Floor',
    category: 'Safety',
    priority: 'High',
    department: 'Maintenance & Campus Safety',
    summary: 'Broken lighting near Block C staircase creating nocturnal fall hazard',
    recommendedAction: 'Inspect electrical fixture, replace ballast/LED bulb, verify ambient illumination',
    confidence: 94,
    status: 'In Progress',
    reporter: 'Student (vaibhav.p@campus.edu)',
    assignedStaff: 'Officer M. Davies (Facilities)',
    timeline: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Logged via CampusGuardian AI' },
      { status: 'Under Review', timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString(), note: 'AI triage verified by Ops Center' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 16 * 3600 * 1000).toISOString(), note: 'Work Order #WO-8912 issued' }
    ]
  },
  {
    id: 'CG-2026-1002',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    description: 'Wheelchair access ramp at North Library entrance is obstructed by heavy delivery crates and construction signage.',
    location: 'Central Library - North Ramp Entrance',
    category: 'Accessibility',
    priority: 'Critical',
    department: 'Disability & Accessibility Infrastructure',
    summary: 'Wheelchair accessibility ramp obstructed by heavy cargo',
    recommendedAction: 'Immediate dispatch to clear obstruction, inspect slope compliance, and notify campus security.',
    confidence: 98,
    status: 'Assigned',
    reporter: 'Student (ananya.s@campus.edu)',
    assignedStaff: 'Accessibility Team (J. Miller)',
    timeline: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), note: 'Reported via Accessibility Quick Form' },
      { status: 'Assigned', timestamp: new Date(Date.now() - 17 * 3600 * 1000).toISOString(), note: 'Priority escalated to Critical' }
    ]
  },
  {
    id: 'CG-2026-1003',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    description: 'Overhead projector in Science Hall 302 won\'t recognize HDMI or USB-C inputs during lecture, causing class delays.',
    location: 'Science Complex - Lecture Hall 302',
    category: 'IT/Cybersecurity',
    priority: 'Medium',
    department: 'Campus IT & Audiovisual Infrastructure',
    summary: 'Lecture hall 302 projector input signal failure',
    recommendedAction: 'Replace AV matrix switcher cable and perform firmware test on controller.',
    confidence: 91,
    status: 'Resolved',
    reporter: 'Faculty (Prof. Sterling)',
    assignedStaff: 'IT Support Desk (Tech Alex)',
    timeline: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), note: 'Report submitted' },
      { status: 'In Progress', timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(), note: 'HDMI dongle replaced' },
      { status: 'Resolved', timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), note: 'Audio/video tested successfully' }
    ]
  },
  {
    id: 'CG-2026-1004',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    description: 'High-pressure water pipe leaking under hand wash sink in Ground Floor Restroom of Engineering Wing B.',
    location: 'Engineering Wing B - Ground Floor Washroom',
    category: 'Maintenance',
    priority: 'High',
    department: 'Facilities Management & Maintenance',
    summary: 'Plumbing leak under washroom sink risking floor water damage',
    recommendedAction: 'Shut off isolation valve and replace fractured coupling.',
    confidence: 95,
    status: 'Under Review',
    reporter: 'Student (karan.m@campus.edu)',
    assignedStaff: 'Pending Assignment',
    timeline: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), note: 'Logged with photo attachment' }
    ]
  },
  {
    id: 'CG-2026-1005',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    description: 'Left blue Herschel backpack with engineering notebook and student ID card in Dining Commons booth 4.',
    location: 'Campus Dining Commons - South Booth 4',
    category: 'Lost & Found',
    priority: 'Low',
    department: 'Student Affairs & Property Custody',
    summary: 'Lost blue Herschel backpack containing ID and notebook',
    recommendedAction: 'Check dining staff custody log and tag in CampusGuardian Lost registry.',
    confidence: 93,
    status: 'Submitted',
    reporter: 'Student (priya.k@campus.edu)',
    assignedStaff: 'Desk Custodian',
    timeline: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'Item registered in database' }
    ]
  },
  {
    id: 'CG-2026-1006',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    description: 'Emergency Blue Light phone station #14 near East Tennis Courts has yellow strobe light blinking intermittently.',
    location: 'East Recreation - Tennis Court Perimeter',
    category: 'Safety',
    priority: 'Critical',
    department: 'Campus Security & Safety Operations',
    summary: 'Blue Light station 14 beacon diagnostic error',
    recommendedAction: 'Perform direct telemetry reset and replace battery backup pack.',
    confidence: 97,
    status: 'Resolved',
    reporter: 'Campus Patrol Officer',
    assignedStaff: 'Security Electronics Unit',
    timeline: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), note: 'Flagged during night patrol' },
      { status: 'Resolved', timestamp: new Date(Date.now() - 60 * 3600 * 1000).toISOString(), note: 'Diagnostic circuit repaired' }
    ]
  }
];

export const CAMPUS_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Science Complex South Elevator Modernization',
    type: 'Maintenance',
    date: 'Today, 08:30 AM',
    badge: 'Scheduled',
    content: 'Elevator B in Science Complex will undergo planned hydraulic recalibration from 2 PM to 5 PM. Tower Elevator A remains step-free operational.'
  },
  {
    id: 'ann-2',
    title: 'Fall Semester Night Safety Escorts Expanded',
    type: 'Safety',
    date: 'Yesterday',
    badge: 'Safety Notice',
    content: 'SafeWalk escorts now active until 4:00 AM across all parking garages and library walkways. Tap Emergency Center to request.'
  },
  {
    id: 'ann-3',
    title: 'New High-Speed Wi-Fi 7 Deployed in Central Library',
    type: 'IT',
    date: '3 days ago',
    badge: 'Upgrade',
    content: 'Library floors 1 through 4 now equipped with Wi-Fi 7 access points. Connect to Aegis-Secure with student credentials.'
  }
];
