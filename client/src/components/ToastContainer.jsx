import React from 'react';
import { useReports } from '../context/ReportsContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useReports();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all duration-300 animate-in slide-in-from-right ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/30'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/40 text-amber-100 shadow-amber-950/30'
                : isError
                ? 'bg-slate-900/95 border-rose-500/40 text-rose-100 shadow-rose-950/30'
                : 'bg-slate-900/95 border-blue-500/40 text-blue-100 shadow-blue-950/30'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isError && <XCircle className="w-5 h-5 text-rose-400" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-blue-400" />}
            </div>

            <div className="flex-1 text-sm">
              <p className="font-semibold text-white">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
