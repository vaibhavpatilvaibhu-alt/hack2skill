import React, { useState, useRef, useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';

export default function ThemeSelector({ compact = false }) {
  const { theme, setTheme } = useReports();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'system', label: 'System Default', icon: Laptop }
  ];

  const currentOption = options.find(o => o.id === theme) || options[1];
  const CurrentIcon = currentOption.icon;

  if (compact) {
    return (
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title={`Current theme: ${currentOption.label}. Click to switch.`}
        aria-label="Toggle dark/light theme"
        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-amber-400 dark:text-blue-300 border border-slate-700/60 transition active:scale-95 flex items-center justify-center"
      >
        {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 transition active:scale-95"
        aria-label="Select color theme"
        aria-expanded={isOpen}
      >
        <CurrentIcon className="w-3.5 h-3.5 text-blue-400" />
        <span className="hidden sm:inline">{currentOption.label}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl py-1 z-50 text-xs">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition ${
                  isSelected
                    ? 'bg-blue-600/20 text-blue-300 font-semibold border-l-2 border-blue-500'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
