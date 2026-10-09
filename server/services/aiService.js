/**
 * CampusGuardian AI - Core AI Service
 * Features:
 * 1. Gemini API Integration via secure backend
 * 2. High-precision Local Fallback Rule & Keyword Classifier
 * 3. Campus Knowledge Base Assistant with Action Recommendations
 * 
 * Complies with engineering hackathon safety requirements:
 * - AI recommendations are preliminary suggestions, not verified incidents.
 * - AI cannot publish campus-wide emergency alerts directly.
 */

// Comprehensive Campus Knowledge Base for offline/fallback intelligence
const CAMPUS_KNOWLEDGE_BASE = [
  {
    keywords: ['fire', 'smoke', 'alarm', 'flame', 'gas', 'extinguisher', 'evacuate'],
    category: 'Fire Safety',
    department: 'Campus Fire & Life Safety Operations',
    quickAnswer: 'If you see an active fire or smell burning gas, immediately activate the nearest manual pull station and evacuate the building via stairs. Do not use elevators. Campus Fire Marshalls and municipal crews are notified immediately upon alarm.',
    action: { label: 'Report Fire Hazard', route: 'report', prefillCategory: 'Fire Safety', priority: 'Critical' }
  },
  {
    keywords: ['spark', 'shock', 'live wire', 'power outage', 'breaker', 'light broken', 'dark', 'staircase light', 'lighting', 'outlet'],
    category: 'Electrical Issue',
    department: 'Campus Electrical & Utility Services',
    quickAnswer: 'Electrical hazards such as sparking fixtures, live wires, and unlit nocturnal corridors pose serious safety risks. Keep clear of exposed wiring. Campus electrical technicians prioritize illuminated safety pathways and emergency breaker checks.',
    action: { label: 'Report Electrical Issue', route: 'report', prefillCategory: 'Electrical Issue', priority: 'High' }
  },
  {
    keywords: ['water leak', 'pipe', 'flood', 'ceiling leak', 'restroom', 'toilet', 'tap', 'drain', 'plumbing', 'overflow', 'broken door', 'roof', 'window broken'],
    category: 'Building Maintenance',
    department: 'Facilities Management & Maintenance',
    quickAnswer: 'Active plumbing leaks, broken window locks, or structural facility issues are handled by Facilities Management. Urgent water leaks near electrical equipment receive emergency response within 15 minutes.',
    action: { label: 'Report Building Maintenance', route: 'report', prefillCategory: 'Building Maintenance', priority: 'High' }
  },
  {
    keywords: ['security', 'emergency', 'police', 'threat', 'stalk', 'harass', 'suspicious', 'assault', 'intruder', 'safe walk', 'guard', 'lock broken', 'blue light'],
    category: 'Security',
    department: 'Campus Security & Safety Operations',
    quickAnswer: 'Campus Safety Officers patrol 24/7. Blue light emergency phone towers are stationed throughout the campus. For immediate threats or suspicious persons, call Security Dispatch at Ext. 5555 or trigger Emergency SOS in the app.',
    action: { label: 'Open Emergency Center', route: 'emergency' }
  },
  {
    keywords: ['medical', 'injury', 'bleed', 'unconscious', 'faint', 'first aid', 'ambulance', 'paramedic', 'allergic', 'cardiac', 'aed'],
    category: 'Medical Assistance',
    department: 'Campus Health & Emergency Medical Services',
    quickAnswer: 'For severe medical emergencies, dial Ext. 5556 immediately or call 911/112. AED defibrillators are installed in every main building lobby. Do not move an injured person with neck or back trauma unless imminent hazard exists.',
    action: { label: 'Contact Medical Dispatch', route: 'emergency' }
  },
  {
    keywords: ['accessibility', 'wheelchair', 'ramp', 'elevator', 'lift', 'braille', 'hearing', 'mobility', 'accessible', 'disability', 'escort', 'barrier'],
    category: 'Accessibility',
    department: 'Disability & Accessibility Infrastructure',
    quickAnswer: 'Campus Accessibility Services provides mobility escorts, accessible shuttle bookings, and maintains step-free navigation across all campus buildings. All reported accessibility barriers receive immediate priority status.',
    action: { label: 'Visit Accessibility Center', route: 'accessibility' }
  },
  {
    keywords: ['trash', 'garbage', 'smell', 'odor', 'restroom clean', 'cleaning', 'biological', 'pest', 'spill', 'sanitation'],
    category: 'Sanitation',
    department: 'Campus Environmental & Custodial Services',
    quickAnswer: 'Sanitation, custodial replenishment, and environmental biohazard cleanup are managed by Environmental Services. Submit a location-tagged request and building custodians will be dispatched.',
    action: { label: 'Report Sanitation Issue', route: 'report', prefillCategory: 'Sanitation' }
  },
  {
    keywords: ['projector', 'hdmi', 'wifi', 'internet', 'lost and found', 'id card', 'wallet', 'keys', 'backpack'],
    category: 'Other',
    department: 'General Campus Operations',
    quickAnswer: 'For lost items, visit the Student Affairs Central Desk or Campus Security Office. For campus IT and network issues, submit an IT work order or contact Classroom Support at Ext. 4357.',
    action: { label: 'Report Campus Issue', route: 'report', prefillCategory: 'Other' }
  }
];

// Fallback Issue Analyzer - Deterministic High Accuracy Rule Engine
function fallbackAnalyzeIssue(text = '', location = '') {
  const lower = text.toLowerCase();
  const lowerLoc = (location || '').toLowerCase();
  const combined = `${lower} ${lowerLoc}`;

  let category = 'Other';
  let priority = 'Medium';
  let department = 'General Campus Operations';
  let confidence = 88;
  let summary = '';
  let recommendedAction = '';

  // 1. Critical signals
  const criticalSignals = [
    'fire', 'smoke', 'explosion', 'gas leak', 'weapon', 'assault', 'fight',
    'bleeding', 'unconscious', 'cardiac', 'collapse', 'live wire', 'electrocution',
    'active threat', 'stuck in elevator'
  ];

  // 2. High signals
  const highSignals = [
    'spark', 'sparking', 'dark', 'broken light', 'staircase light', 'broken lock', 'cannot lock',
    'flood', 'water leaking', 'pipe burst', 'blocked exit', 'fire exit blocked',
    'broken ramp', 'wheelchair ramp blocked', 'elevator down', 'elevator broken',
    'harassment', 'stalking', 'suspicious person', 'theft', 'stolen'
  ];

  // 3. Low signals
  const lowSignals = [
    'flickering', 'paint', 'scuffed', 'trash can full', 'litter', 'poster',
    'dust', 'lost book', 'water bottle', 'squeaky door', 'remote battery', 'lost keys'
  ];

  // Priority detection
  if (criticalSignals.some(k => combined.includes(k))) {
    priority = 'Critical';
    confidence = 96;
  } else if (highSignals.some(k => combined.includes(k))) {
    priority = 'High';
    confidence = 94;
  } else if (lowSignals.some(k => combined.includes(k))) {
    priority = 'Low';
    confidence = 89;
  }

  // Category Detection
  if (
    combined.includes('fire') || combined.includes('smoke') || combined.includes('alarm') ||
    combined.includes('flame') || combined.includes('extinguisher') || combined.includes('gas leak')
  ) {
    category = 'Fire Safety';
    department = 'Campus Fire & Life Safety Operations';
    summary = location ? `Fire safety concern reported at ${location}` : 'Fire safety hazard reported';
    recommendedAction = 'Dispatch fire safety marshall for immediate on-site inspection and alarm verification.';
    confidence = Math.max(confidence, 95);
  } else if (
    combined.includes('spark') || combined.includes('shock') || combined.includes('live wire') ||
    combined.includes('light') || combined.includes('dark') || combined.includes('power') ||
    combined.includes('breaker') || combined.includes('electrical') || combined.includes('outlet')
  ) {
    category = 'Electrical Issue';
    department = 'Campus Electrical & Utility Services';
    summary = location ? `Electrical hazard or lighting failure near ${location}` : 'Electrical failure and low visibility hazard';
    recommendedAction = 'Inspect electrical fixture, verify circuit isolation, and replace damaged wiring/lighting.';
    confidence = Math.max(confidence, 94);
  } else if (
    combined.includes('leak') || combined.includes('pipe') || combined.includes('plumbing') ||
    combined.includes('water') || combined.includes('ceiling') || combined.includes('roof') ||
    combined.includes('door broken') || combined.includes('window broken') || combined.includes('handrail')
  ) {
    category = 'Building Maintenance';
    department = 'Facilities Management & Maintenance';
    summary = location ? `Building maintenance issue at ${location}` : 'Facility infrastructure repair required';
    recommendedAction = 'Issue work order to maintenance crew to inspect physical damage and isolate plumbing/structural fault.';
    confidence = Math.max(confidence, 93);
  } else if (
    combined.includes('security') || combined.includes('theft') || combined.includes('intruder') ||
    combined.includes('suspicious') || combined.includes('stalk') || combined.includes('harass') ||
    combined.includes('lock') || combined.includes('unauthorized') || combined.includes('weapon')
  ) {
    category = 'Security';
    department = 'Campus Security & Safety Operations';
    summary = location ? `Security observation logged near ${location}` : 'Security and physical access vulnerability';
    recommendedAction = 'Dispatch security patrol unit to secure area and verify perimeter access controls.';
    confidence = Math.max(confidence, 93);
  } else if (
    combined.includes('medical') || combined.includes('injury') || combined.includes('unconscious') ||
    combined.includes('bleed') || combined.includes('ambulance') || combined.includes('cardiac') ||
    combined.includes('allergic') || combined.includes('paramedic')
  ) {
    category = 'Medical Assistance';
    department = 'Campus Health & Emergency Medical Services';
    summary = location ? `Medical assistance requested at ${location}` : 'Medical assistance requirement';
    recommendedAction = 'Alert emergency medical team and dispatch first responder with first-aid trauma kit.';
    confidence = Math.max(confidence, 96);
  } else if (
    combined.includes('ramp') || combined.includes('wheelchair') || combined.includes('elevator') ||
    combined.includes('lift') || combined.includes('braille') || combined.includes('tactile') ||
    combined.includes('accessible') || combined.includes('disability') || combined.includes('hearing loop')
  ) {
    category = 'Accessibility';
    department = 'Disability & Accessibility Infrastructure';
    if (priority === 'Medium' || priority === 'Low') priority = 'High';
    summary = location ? `Accessibility barrier reported at ${location}` : 'Physical accessibility barrier';
    recommendedAction = 'Deploy accessibility team to clear obstruction and ensure continuous ADA barrier-free access.';
    confidence = Math.max(confidence, 95);
  } else if (
    combined.includes('trash') || combined.includes('garbage') || combined.includes('cleaning') ||
    combined.includes('smell') || combined.includes('odor') || combined.includes('biological') ||
    combined.includes('restroom clean') || combined.includes('spill')
  ) {
    category = 'Sanitation';
    department = 'Campus Environmental & Custodial Services';
    summary = location ? `Sanitation and custodial request for ${location}` : 'Custodial and sanitation service request';
    recommendedAction = 'Dispatch custodial personnel with cleaning equipment to sanitize and restore area.';
    confidence = Math.max(confidence, 91);
  } else {
    category = 'Other';
    department = 'General Campus Operations';
    summary = location ? `Campus observation at ${location}` : `Campus report: ${text.slice(0, 45)}...`;
    recommendedAction = 'Route to operations desk for initial review and department assignment.';
    confidence = 88;
  }

  // Refine summary if blank
  if (!summary) {
    summary = text.slice(0, 60) + (text.length > 60 ? '...' : '');
  }

  return {
    category,
    priority,
    department,
    summary,
    recommendedAction,
    confidence
  };
}

/**
 * Call Gemini API using REST endpoint
 */
async function callGeminiAnalyze(apiKey, text, location) {
  const prompt = `You are CampusGuardian AI, the intelligent incident analysis assistant for a smart university campus.
Analyze the following student-reported campus observation:
Text: "${text}"
Location: "${location || 'Not specified'}"

Safety guidelines:
- This is a student observation, NOT a verified critical disaster.
- Do NOT generate false panic.
- Classify into one of the exact supported campus categories:
  "Fire Safety" | "Electrical Issue" | "Building Maintenance" | "Security" | "Medical Assistance" | "Accessibility" | "Sanitation" | "Other"

Respond ONLY with valid, raw JSON (no markdown formatting, no code blocks, no backticks):
{
  "category": "Fire Safety" | "Electrical Issue" | "Building Maintenance" | "Security" | "Medical Assistance" | "Accessibility" | "Sanitation" | "Other",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "department": "Appropriate Campus Department",
  "summary": "Concise 1-sentence headline of the issue",
  "recommendedAction": "Recommended next triage action for university staff",
  "confidence": <integer between 80 and 99>
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 300
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini API');

  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  const validCategories = [
    'Fire Safety', 'Electrical Issue', 'Building Maintenance', 'Security',
    'Medical Assistance', 'Accessibility', 'Sanitation', 'Other'
  ];

  return {
    category: validCategories.includes(parsed.category) ? parsed.category : 'Building Maintenance',
    priority: ['Critical', 'High', 'Medium', 'Low'].includes(parsed.priority) ? parsed.priority : 'Medium',
    department: parsed.department || 'Campus Facilities',
    summary: parsed.summary || text.slice(0, 60),
    recommendedAction: parsed.recommendedAction || 'Inspect and assess site condition.',
    confidence: Number(parsed.confidence) || 94
  };
}

/**
 * Main Issue Analyzer with Automatic Fallback
 */
async function analyzeIssue(text, location = '') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() && apiKey !== 'your_gemini_api_key_here') {
    try {
      const result = await callGeminiAnalyze(apiKey.trim(), text, location);
      return {
        ...result,
        source: 'gemini',
        model: 'Gemini 2.0 Flash'
      };
    } catch (err) {
      console.warn('Gemini API call failed, activating CampusGuardian local fallback AI engine:', err.message);
      const fallbackResult = fallbackAnalyzeIssue(text, location);
      return {
        ...fallbackResult,
        source: 'local_fallback',
        model: 'CampusGuardian RuleEngine (Offline Fallback)',
        fallbackReason: err.message
      };
    }
  }

  // If no Gemini API key configured, seamlessly use local fallback
  const fallbackResult = fallbackAnalyzeIssue(text, location);
  return {
    ...fallbackResult,
    source: 'local_fallback',
    model: 'CampusGuardian RuleEngine (Active)'
  };
}

/**
 * Assistant Chat with Campus Knowledge Base & Fallback
 */
async function chatWithAssistant(message = '', history = []) {
  const lowerMsg = message.toLowerCase();
  const apiKey = process.env.GEMINI_API_KEY;

  // Check matching knowledge base entries
  const matchedEntry = CAMPUS_KNOWLEDGE_BASE.find(entry =>
    entry.keywords.some(kw => lowerMsg.includes(kw))
  );

  // If Gemini API is available, ask Gemini with campus context
  if (apiKey && apiKey.trim() && apiKey !== 'your_gemini_api_key_here') {
    try {
      const contextPrompt = `You are "GuardianBot", the official 24/7 AI Campus Assistant for CampusGuardian AI.
Tagline: "A Safer Campus. A Smarter Response."
Your role:
- Assist students and staff with campus safety, incident reporting, accessibility accommodations, and emergency procedures.
- Keep answers helpful, warm, concise, and actionable (2-4 sentences max).
- If relevant, mention that they can file a report directly or view Disaster Indicator alerts.
- Important safety rule: Remind users that for immediate life-threatening situations, dial 911/112 or contact campus emergency dispatch directly.

Student question: "${message}"`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: contextPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 350 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          const suggestedActions = [];
          if (matchedEntry && matchedEntry.action) {
            suggestedActions.push(matchedEntry.action);
          } else {
            suggestedActions.push({ label: 'Report Campus Issue', route: 'report' });
          }

          return {
            reply: replyText.trim(),
            suggestedActions,
            source: 'gemini',
            timestamp: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn('Gemini chat failed, using local assistant knowledge base:', err.message);
    }
  }

  // Local Fallback Knowledge Base response
  if (matchedEntry) {
    const suggestedActions = [matchedEntry.action];
    if (matchedEntry.category === 'Fire Safety' || matchedEntry.category === 'Security' || matchedEntry.category === 'Medical Assistance') {
      suggestedActions.push({ label: 'Emergency Center & Protocols', route: 'emergency' });
    } else if (matchedEntry.category === 'Accessibility') {
      suggestedActions.push({ label: 'Campus Accessibility Directory', route: 'accessibility' });
    }

    return {
      reply: `${matchedEntry.quickAnswer}\n\nOur system will route this report directly to ${matchedEntry.department}.`,
      suggestedActions,
      source: 'local_knowledge_base',
      timestamp: new Date().toISOString()
    };
  }

  // General helpful fallback response
  return {
    reply: `I can assist you with campus safety reports, building maintenance work orders, accessibility requests, or emergency safety protocols. For immediate emergencies, please consult the Emergency Center or dial Campus Dispatch Ext. 5555. How can I assist you today?`,
    suggestedActions: [
      { label: 'Report Campus Issue', route: 'report' },
      { label: 'Disaster Alerts Indicator', route: 'disaster-indicator' },
      { label: 'Emergency Hotlines', route: 'emergency' },
      { label: 'Accessibility Services', route: 'accessibility' }
    ],
    source: 'local_knowledge_base',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  analyzeIssue,
  chatWithAssistant,
  CAMPUS_KNOWLEDGE_BASE
};
