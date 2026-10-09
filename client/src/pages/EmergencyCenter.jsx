import React, { useState } from 'react';
import { useReports } from '../context/ReportsContext';
import {
  PhoneCall,
  ShieldAlert,
  AlertOctagon,
  Flame,
  CloudLightning,
  HeartPulse,
  Footprints,
  Radio,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

export default function EmergencyCenter() {
  const { addToast, addReport } = useReports();

  const [sosLocation, setSosLocation] = useState('Central Library Quad');
  const [isSosTriggered, setIsSosTriggered] = useState(false);
  const [expandedProtocol, setExpandedProtocol] = useState('proto-fire');

  // Emergency contacts list (Configurable campus data)
  const emergencyContacts = [
    {
      id: 'sec',
      title: 'Campus Security Rapid Response',
      ext: 'Ext. 5555',
      phone: '555-0199',
      hours: '24/7 / 365 Days',
      badge: 'Immediate Dispatch',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'On-scene armed/unarmed safety officers, physical building lock-outs, and active escort services.'
    },
    {
      id: 'med',
      title: 'University Health & Medical Center',
      ext: 'Ext. 5556',
      phone: '555-0188',
      hours: '8:00 AM - 10:00 PM (Emergency on-call 24/7)',
      badge: 'Medical EMT',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'First aid, minor trauma triage, emergency allergic reaction care, and paramedic coordination.'
    },
    {
      id: 'admin',
      title: 'Campus Safety Marshall & Operations',
      ext: 'Ext. 5550',
      phone: '555-0166',
      hours: '24/7 Emergency Operations Desk',
      badge: 'Facilities / Admin',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      description: 'Major building evacuations, severe storm shelters, chemical spill containment, and infrastructure outages.'
    },
    {
      id: 'crisis',
      title: 'Mental Health & Student Crisis Helpline',
      ext: 'Ext. 5559',
      phone: '555-0177',
      hours: '24/7 Confidential Assistance',
      badge: 'Confidential',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Licensed psychological counselors for panic attacks, emotional distress, or sudden traumatic events.'
    }
  ];

  const safetyProtocols = [
    {
      id: 'proto-fire',
      icon: Flame,
      title: 'Fire Evacuation & Smoke Hazard Protocol',
      steps: [
        'Evacuate immediately using designated fire stairwells — NEVER take elevators.',
        'Pull the nearest wall-mounted manual pull station on your route out of the building.',
        'Proceed to Campus Assembly Zone A (Green Lawn) or Zone B (Recreation Field).',
        'Notify building marshals of anyone needing mobility evacuation assistance.'
      ]
    },
    {
      id: 'proto-weather',
      icon: CloudLightning,
      title: 'Severe Storm & Flash Flood Shelter Protocol',
      steps: [
        'Move to interior corridors away from exterior glass windows and skylights.',
        'If on lower ground floor during heavy flash flood warning, ascend to Level 2 or higher.',
        'Avoid traversing campus bridges or flooded pedestrian underpasses.',
        'Monitor CampusGuardian live broadcasts for shelter-in-place updates.'
      ]
    },
    {
      id: 'proto-med',
      icon: HeartPulse,
      title: 'Medical Emergency & AED Defibrillator Protocol',
      steps: [
        'Immediately call Ext. 5556 or trigger Emergency SOS with room number.',
        'Locate the nearest Automated External Defibrillator (AED) — situated in every building entrance lobby.',
        'Do not move someone with potential spinal or neck injuries unless immediate fire danger exists.',
        'Station a student at the main exterior door to flag down arriving first responders.'
      ]
    },
    {
      id: 'proto-walk',
      icon: Footprints,
      title: 'Nighttime SafeWalk Escort Service Protocol',
      steps: [
        'Operating every night from 6:00 PM to 4:00 AM across all campus sectors.',
        'A student security team member or campus officer will walk with you to your car, dorm, or bus stop.',
        'Call Ext. 5555 or tap any Blue Light call tower across the walkways.'
      ]
    }
  ];

  const handleSimulateCall = (title, ext) => {
    addToast('Simulating Emergency Call', `Connecting to ${title} (${ext})...`, 'warning');
  };

  const handleTriggerSOS = async () => {
    setIsSosTriggered(true);
    addToast('CRITICAL SOS ALERT TRANSMITTED', `Officers dispatched to ${sosLocation}!`, 'error');

    await addReport({
      description: `[EMERGENCY SOS ALERT] Critical distress beacon activated at ${sosLocation}. Immediate responder dispatch initiated.`,
      location: sosLocation,
      category: 'Safety',
      priority: 'Critical',
      department: 'Campus Security Rapid Response',
      summary: `SOS Emergency Signal - ${sosLocation}`,
      recommendedAction: 'Dispatch immediate patrol unit; notify medical standby team.',
      confidence: 99
    });

    setTimeout(() => {
      setIsSosTriggered(false);
    }, 4000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Campus Safety & Incident Center</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Campus Emergency Operations</h1>
        <p className="text-sm text-slate-400 mt-1">
          Direct campus dispatcher hotlines, rapid safety protocols, and emergency distress signal beacon.
        </p>
      </div>

      {/* Prominent Demo Disclaimer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
        <AlertOctagon className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">
            DEMONSTRATION CAMPUS ENVIRONMENT
          </p>
          <p className="leading-relaxed text-amber-200/90 text-xs">
            The emergency contacts and extensions displayed below are configurable demo data for the Smart Campus Solutions hackathon. For genuine real-world life safety emergencies, always call <strong>911 / 112</strong> or your local emergency services directly.
          </p>
        </div>
      </div>

      {/* Rapid SOS Trigger Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/70 via-slate-900 to-navy-950 border-2 border-rose-500/40 shadow-glow-rose space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Instant Distress SOS Beacon</h2>
              <p className="text-xs text-rose-300">Simulates campus-wide emergency patrol priority dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={sosLocation}
              onChange={(e) => setSosLocation(e.target.value)}
              className="bg-navy-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:border-rose-400 focus:outline-none"
            >
              <option value="Central Library Quad">Central Library Quad</option>
              <option value="Science Complex - Main Entrance">Science Complex - Main Entrance</option>
              <option value="Hostel Quad 3 - North Lawn">Hostel Quad 3 - North Lawn</option>
              <option value="East Parking Garage - Deck 3">East Parking Garage - Deck 3</option>
              <option value="Student Union - South Patio">Student Union - South Patio</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleTriggerSOS}
          disabled={isSosTriggered}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 text-sm sm:text-base shadow-xl ${
            isSosTriggered
              ? 'bg-emerald-600 shadow-glow-emerald'
              : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 shadow-glow-rose active:scale-[0.99] animate-pulse'
          }`}
        >
          {isSosTriggered ? (
            <>
              <Check className="w-5 h-5 text-white" />
              <span>SOS Transmitted! Critical Report Created & Officers Dispatched!</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-5 h-5" />
              <span>TRANSMIT IMMEDIATE CAMPUS SOS AT {sosLocation.toUpperCase()}</span>
            </>
          )}
        </button>
      </div>

      {/* Emergency Contacts Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Configurable Campus Emergency Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-5 rounded-2xl glass-panel space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${contact.badgeColor}`}>
                    {contact.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{contact.hours}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{contact.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{contact.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-rose-400">{contact.ext}</span>
                  <span className="text-[11px] text-slate-400 ml-2">({contact.phone})</span>
                </div>

                <button
                  onClick={() => handleSimulateCall(contact.title, contact.ext)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <span>Simulate Call</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Instructions & Protocols */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Campus Safety Instructions & Protocols</h2>
        <div className="space-y-3">
          {safetyProtocols.map((proto) => {
            const Icon = proto.icon;
            const isExpanded = expandedProtocol === proto.id;

            return (
              <div
                key={proto.id}
                className="rounded-2xl glass-panel overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedProtocol(isExpanded ? null : proto.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-white">{proto.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-800/60 bg-slate-950/40 animate-in slide-in-from-top-2">
                    <ol className="space-y-2 mt-2">
                      {proto.steps.map((step, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
