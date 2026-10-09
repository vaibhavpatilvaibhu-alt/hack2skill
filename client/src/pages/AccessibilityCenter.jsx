import React, { useState } from 'react';
import { useReports } from '../context/ReportsContext';
import {
  Accessibility,
  Eye,
  Ear,
  Brain,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Send,
  Navigation,
  Bus,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function AccessibilityCenter() {
  const { setActiveTab, addToast, addReport } = useReports();

  // Escort Request Form state
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [assistType, setAssistType] = useState('Wheelchair / Mobility Escort');
  const [escortScheduled, setEscortScheduled] = useState(false);

  // Accessible facilities dataset
  const facilities = [
    {
      id: 'fac-1',
      name: 'Central Library North Ramp',
      type: 'Mobility Ramp',
      status: 'Attention Required',
      notes: 'Temporary crate obstruction on north slope. Maintenance crew actively clearing.',
      route: 'Alternative: South Plaza automatic revolving door (Level 1, step-free)',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      id: 'fac-2',
      name: 'Science Complex Elevator Tower A',
      type: 'Elevator',
      status: 'Operational',
      notes: 'Equipped with tactile Braille buttons, voice floor annunciator, and emergency call panel.',
      route: 'Direct step-free access to all 5 laboratory levels',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'fac-3',
      name: 'Auditorium Magna Hearing Induction Loop',
      type: 'Audio Assistance',
      status: 'Operational',
      notes: 'T-coil induction loop active for students with hearing aids and assistive FM headsets.',
      route: 'Reserve wireless receiver pack at AV control booth',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'fac-4',
      name: 'Student Center South Accessible Restrooms',
      type: 'Restroom Facility',
      status: 'Operational',
      notes: 'Gender-inclusive, ADA-compliant wide door, power activation button, emergency pull cord.',
      route: 'Ground Floor, adjacent to Wellness Lounge',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'fac-5',
      name: 'East Campus Shuttle Route 2 (Wheelchair Lift)',
      type: 'Transit',
      status: 'Operational',
      notes: 'Low-floor electric shuttle with automated hydraulic ramp and two secure wheelchair locks.',
      route: 'Departs every 12 mins from Campus Transit Hub',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    }
  ];

  const handleEscortSubmit = async (e) => {
    e.preventDefault();
    if (!pickup.trim() || !destination.trim()) {
      addToast('Information Needed', 'Please provide pickup and destination points.', 'warning');
      return;
    }

    setEscortScheduled(true);
    addToast('Mobility Escort Dispatched', `Support escort routed from ${pickup} to ${destination}!`, 'success');

    // Automatically create high-priority accessibility report in system
    await addReport({
      description: `[ACCESSIBILITY ESCORT REQUEST] Student requested mobility assistance from ${pickup} to ${destination}. Type: ${assistType}.`,
      location: pickup,
      category: 'Accessibility',
      priority: 'High',
      department: 'Disability & Accessibility Infrastructure',
      summary: `Mobility Escort Request: ${pickup} → ${destination}`,
      recommendedAction: 'Dispatch golf cart / trained mobility escort officer immediately.',
      confidence: 98
    });

    setTimeout(() => {
      setEscortScheduled(false);
      setPickup('');
      setDestination('');
    }, 3500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Accessibility className="w-3.5 h-3.5" />
            <span>Inclusive Campus Infrastructure</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Campus Accessibility Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time barrier monitoring, accessible facility directory, and mobility escort coordination.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('report')}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition self-start sm:self-auto"
        >
          Report Physical Barrier →
        </button>
      </div>

      {/* 4 Major Accessibility Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mobility */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-blue-500/10 text-blue-400 mb-2">
            <Accessibility className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Mobility & Transit</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Automatic door openers, ramp slope maintenance, step-free pathways, and hydraulic wheelchair shuttle dispatch.
          </p>
        </div>

        {/* Visual */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 mb-2">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Visual Assistance</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Braille directory signage audits, tactile paving inspection, high-contrast digital maps, and audio navigation beacons.
          </p>
        </div>

        {/* Hearing */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-amber-500/10 text-amber-400 mb-2">
            <Ear className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Hearing Support</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Induction loop coverage in major lecture halls, real-time live captioning, and visual strobe evacuation beacons.
          </p>
        </div>

        {/* Neurodiversity */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 text-purple-400 mb-2">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Sensory Decompression</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Designated quiet study pods with dimmable ambient lighting and noise suppression in Library 2nd Floor & Student Center.
          </p>
        </div>
      </div>

      {/* Interactive Request Mobility Escort Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-navy-900 via-slate-900 to-purple-950/40 border border-purple-500/30 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Request Campus Mobility Escort</h2>
            <p className="text-xs text-slate-400">Trained student staff or electric golf cart assistance across campus</p>
          </div>
        </div>

        <form onSubmit={handleEscortSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pickup */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pickup Location</label>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="e.g. Science Complex South Entry"
                className="w-full px-3.5 py-2.5 text-xs text-white glass-input rounded-xl placeholder:text-slate-500"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Building</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Central Library 3rd Floor"
                className="w-full px-3.5 py-2.5 text-xs text-white glass-input rounded-xl placeholder:text-slate-500"
              />
            </div>

            {/* Assistance Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assistance Type</label>
              <select
                value={assistType}
                onChange={(e) => setAssistType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-white glass-input rounded-xl bg-navy-900"
              >
                <option value="Wheelchair / Mobility Escort">Wheelchair / Mobility Escort</option>
                <option value="Visual Guiding Assistance">Visual Guiding Assistance</option>
                <option value="Electric Golf Cart Ride">Electric Golf Cart Transit</option>
                <option value="Temporary Injury Support">Temporary Injury / Crutches</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={escortScheduled}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition flex items-center justify-center gap-2 ${
              escortScheduled
                ? 'bg-emerald-600'
                : 'bg-purple-600 hover:bg-purple-500 shadow-md active:scale-[0.99]'
            }`}
          >
            {escortScheduled ? (
              <>
                <Check className="w-4 h-4" />
                <span>Escort Request Transmitted! Staff on route.</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Dispatch Campus Accessibility Escort</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Accessible Facilities Status Directory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Accessible Facilities Status Directory</h2>
          <span className="text-xs text-slate-400">Updated every 15 minutes</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="p-4 sm:p-5 rounded-2xl glass-panel space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${fac.statusColor}`}>
                    {fac.status}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{fac.type}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{fac.name}</h3>
                <p className="text-xs text-slate-300">{fac.notes}</p>
                <p className="text-[11px] text-blue-300 flex items-center gap-1 font-medium pt-1">
                  <Navigation className="w-3 h-3 flex-shrink-0" />
                  <span>{fac.route}</span>
                </p>
              </div>

              <div className="self-end sm:self-center">
                <button
                  onClick={() => {
                    setActiveTab('report');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition"
                >
                  Flag Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
