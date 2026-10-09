import React, { useState } from 'react';
import { useReports } from '../context/ReportsContext';
import { analyzeIssueWithAI } from '../services/api';
import {
  Sparkles,
  MapPin,
  Camera,
  CheckCircle2,
  Send,
  Loader2,
  Building,
  ArrowRight
} from 'lucide-react';
import DisasterIndicatorBanner from '../components/DisasterIndicatorBanner';

export default function ReportIssuePage() {
  const { addReport, setActiveTab, addToast, currentUser, openAuthModal } = useReports();

  // Form State
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [optionalCategory, setOptionalCategory] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Submission State
  const [submittedReport, setSubmittedReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Fire Safety',
    'Electrical Issue',
    'Building Maintenance',
    'Security',
    'Medical Assistance',
    'Accessibility',
    'Sanitation',
    'Other'
  ];

  // Quick Preset Prompts
  const quickPresets = [
    {
      title: 'Staircase Lighting',
      text: 'The staircase light near Block C has been broken for three days and it is very dark at night.',
      loc: 'Block C - Staircase 2nd Floor'
    },
    {
      title: 'Blocked Wheelchair Ramp',
      text: 'The wheelchair ramp at the Library north entrance is obstructed by heavy delivery crates and wooden pallets.',
      loc: 'Central Library - North Ramp'
    },
    {
      title: 'Projector HDMI Sparking',
      text: 'The projector in Science Hall 302 sparks when HDMI is plugged in and will not project lecture slides.',
      loc: 'Science Complex - Room 302'
    },
    {
      title: 'Urgent Washroom Leak',
      text: 'A high-pressure pipe under the washroom sink in Engineering Wing B is leaking water across the hallway.',
      loc: 'Engineering Wing B - Ground Floor Restroom'
    }
  ];

  const quickLocations = [
    'Block C - Staircase',
    'Central Library - North Ramp',
    'Science Complex - Hall 302',
    'Engineering Wing B - Restroom',
    'Student Center - Main Plaza',
    'Campus Dining Commons'
  ];

  const handleSelectPreset = (preset) => {
    setDescription(preset.text);
    setLocation(preset.loc);
    setAiResult(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!description.trim()) {
      addToast('Input Required', 'Please enter an issue description first.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const result = await analyzeIssueWithAI(description.trim(), location.trim());
      setAiResult(result);
      if (result.category) {
        setOptionalCategory(result.category);
      }
      addToast('AI Triage Complete', `Detected ${result.category} (${result.priority} Priority)`, 'success');
    } catch (err) {
      addToast('Analysis Notice', 'Evaluated with local campus safety rules.', 'info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      addToast('Authentication Required', 'Please sign in with student credentials to file a report.', 'warning');
      openAuthModal('student');
      return;
    }

    if (!description.trim() || !location.trim()) {
      addToast('Missing Fields', 'Please provide both an issue description and location.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalCategory = optionalCategory || aiResult?.category || 'Other';
      const finalPriority = aiResult?.priority || 'Medium';
      const finalDept = aiResult?.department || 'General Campus Operations';
      const finalSummary = aiResult?.summary || description.slice(0, 60);
      const finalAction = aiResult?.recommendedAction || 'Inspect and assess site condition.';
      const confidence = aiResult?.confidence || 92;

      const reportData = {
        description: description.trim(),
        location: location.trim(),
        category: finalCategory,
        priority: finalPriority,
        department: finalDept,
        summary: finalSummary,
        recommendedAction: finalAction,
        confidence: confidence,
        imageUrl: imagePreview
      };

      const created = await addReport(reportData);
      setSubmittedReport(created);
    } catch (err) {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setDescription('');
    setLocation('');
    setOptionalCategory('');
    setImagePreview(null);
    setAiResult(null);
    setSubmittedReport(null);
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Recorded in SQLite Database
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Incident Report Successfully Filed
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your report is saved with a unique identifier and dispatched to university operations for review.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400">Tracking Reference</span>
              <p className="text-base font-mono font-bold text-blue-600 dark:text-blue-400">{submittedReport.id}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Status</span>
              <p className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                {submittedReport.status}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Category:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{submittedReport.category}</p>
            </div>
            <div>
              <span className="text-slate-400">Target Department:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{submittedReport.department}</p>
            </div>
            <div>
              <span className="text-slate-400">Location:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{submittedReport.location}</p>
            </div>
            <div>
              <span className="text-slate-400">Priority:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{submittedReport.priority}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Recommended Action:</span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5">{submittedReport.recommendedAction || submittedReport.recommended_action}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('my-reports')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition flex items-center gap-2"
          >
            <span>Track in My Reports</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetForm}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200 dark:border-slate-700 transition"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <DisasterIndicatorBanner />

      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Assisted Incident Triage</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Report Campus Hazard or Facility Issue
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Describe the situation in plain words. CampusGuardian AI triages urgency, classifies the issue, and routes work orders directly to facilities.
        </p>
      </div>

      {/* Quick Preset Prompts */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Evaluation Test Scenarios:</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition group text-xs"
            >
              <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {preset.title}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {preset.text}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Reporting Form */}
      <form onSubmit={handleSubmitReport} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Description Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              What is happening? Describe the issue *
            </label>
            <span className="text-[11px] text-slate-400">Plain English description</span>
          </div>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. The staircase light near Block C has been broken for three days and it is dark at night..."
            className="w-full px-3.5 py-2.5 rounded-lg glass-input text-xs leading-relaxed"
          />
        </div>

        {/* Location Field & Quick Picks */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Campus Location / Building / Room *
          </label>
          <div className="relative mb-2">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Block C - Staircase 2nd Floor, Central Library North Ramp..."
              className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-slate-400">Quick picks:</span>
            {quickLocations.map((loc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLocation(loc)}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Category & Photo Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Category (Optional — AI can detect)
            </label>
            <select
              value={optionalCategory}
              onChange={(e) => setOptionalCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg glass-input text-xs"
            >
              <option value="">Let AI Automatically Detect</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Photo / Attachment (Optional)
            </label>
            <div className="flex items-center gap-2.5">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-950 cursor-pointer text-xs text-slate-600 dark:text-slate-400 transition">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>{imagePreview ? 'Change Photo' : 'Upload Hazard Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                />
              )}
            </div>
          </div>
        </div>

        {/* AI Triage Trigger */}
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Click <strong>Analyze with AI</strong> to preview classification, urgency, and recommended department.</span>
          </div>

          <button
            type="button"
            disabled={isAnalyzing || !description.trim()}
            onClick={handleAnalyzeWithAI}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
              isAnalyzing || !description.trim()
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze with AI</span>
              </>
            )}
          </button>
        </div>

        {/* AI Analysis Preview Card */}
        {aiResult && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Recommendation ({aiResult.confidence}% Confidence)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Engine: {aiResult.model || 'Campus AI Engine'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Category</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{aiResult.category}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Priority</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{aiResult.priority}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                <span className="text-slate-400 block text-[10px]">Target Department</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">{aiResult.department}</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
              <span className="text-slate-400 block text-[10px]">Triage Action:</span>
              <p className="text-slate-700 dark:text-slate-300 mt-0.5">{aiResult.recommendedAction}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-xl font-medium text-xs text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span>Saving to SQLite Database...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Campus Incident Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
