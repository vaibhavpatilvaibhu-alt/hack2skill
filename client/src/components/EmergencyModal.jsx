import React, { useState } from 'react';
import { useReports } from '../context/ReportsContext';
import { ShieldAlert, PhoneCall, AlertOctagon, X, Check, MapPin, Radio } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose }) {
  const { addToast, addReport, setActiveTab } = useReports();
  const [sosSent, setSosSent] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Block C - Main Quad');

  if (!isOpen) return null;

  const handleSimulateCall = (name, ext) => {
    addToast('Simulating Emergency Call', `Connecting to ${name} (${ext})...`, 'warning');
  };

  const handleTriggerSOS = async () => {
    setSosSent(true);
    addToast('CRITICAL SOS DISPATCHED', `Security patrols and First Responders routed to ${selectedLocation}!`, 'error');

    // Create a Critical Report automatically in the system
    await addReport({
      description: `[EMERGENCY SOS ALERT TRIGGERED] Student initiated instant distress beacon at location: ${selectedLocation}. Immediate safety escort and patrol dispatch required.`,
      location: selectedLocation,
      category: 'Safety',
      priority: 'Critical',
      department: 'Campus Security Rapid Response',
      summary: `SOS Emergency Distress Beacon - ${selectedLocation}`,
      recommendedAction: 'Immediate 90-second on-scene security response and medical standby.',
      confidence: 99
    });

    setTimeout(() => {
      setSosSent(false);
      onClose();
      setActiveTab('emergency');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-navy-900 border-2 border-rose-500/50 rounded-2xl shadow-glow-rose p-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 rounded-xl border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Emergency Rapid Response
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">DEMO</span>
              </h2>
              <p className="text-xs text-rose-300">24/7 Aegis Campus Dispatch Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="my-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
          <AlertOctagon className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>Notice: This is a hackathon simulation. For real-life emergencies, dial 911 / 112 immediately.</span>
        </div>

        {/* SOS Button */}
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 mb-5 text-center">
          <p className="text-xs text-slate-300 mb-2 font-medium">Your current simulated campus location:</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-rose-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-navy-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-400"
            >
              <option value="Block C - Main Quad">Block C - Main Quad</option>
              <option value="Central Library - North Plaza">Central Library - North Plaza</option>
              <option value="Science Complex - 3rd Floor">Science Complex - 3rd Floor</option>
              <option value="Student Center - South Deck">Student Center - South Deck</option>
              <option value="East Parking Structure - Level 2">East Parking Structure - Level 2</option>
            </select>
          </div>

          <button
            onClick={handleTriggerSOS}
            disabled={sosSent}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
              sosSent
                ? 'bg-emerald-600 shadow-emerald-900/50'
                : 'bg-rose-600 hover:bg-rose-500 active:scale-95 shadow-glow-rose animate-pulse'
            }`}
          >
            {sosSent ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>Distress Signal Transmitted! Routing Officers...</span>
              </>
            ) : (
              <>
                <Radio className="w-5 h-5 animate-spin" />
                <span>TRIGGER INSTANT CAMPUS SOS</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400 mt-2">Creates an escalated Critical report and notifies patrol units instantly.</p>
        </div>

        {/* Quick Contacts */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fast Dispatch Lines</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleSimulateCall('Campus Security Rapid Unit', 'Ext. 5555')}
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-semibold text-white">Campus Security</p>
                <p className="text-[11px] text-slate-400">Ext. 5555 (24/7)</p>
              </div>
              <PhoneCall className="w-4 h-4 text-rose-400 group-hover:scale-110 transition" />
            </button>

            <button
              onClick={() => handleSimulateCall('University Health & EMT', 'Ext. 5556')}
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-semibold text-white">Medical EMT</p>
                <p className="text-[11px] text-slate-400">Ext. 5556</p>
              </div>
              <PhoneCall className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            </button>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={() => { onClose(); setActiveTab('emergency'); }}
            className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
          >
            Open Full Emergency Center & Safety Protocols →
          </button>
        </div>
      </div>
    </div>
  );
}
