import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScholarGrade, GradeCategory } from '../types';
import { ShieldCheck, Award, AlertCircle, HelpCircle, ChevronDown } from 'lucide-react';

interface ScholarGradeBadgeProps {
  gradeCategory?: GradeCategory | string;
  grades?: ScholarGrade[];
  showDetailsButton?: boolean;
}

export const ScholarGradeBadge: React.FC<ScholarGradeBadgeProps> = ({
  gradeCategory = 'unclassified',
  grades = [],
  showDetailsButton = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalized = (gradeCategory || 'unclassified').toLowerCase();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  let config = {
    label: 'Unclassified',
    badgeClass: 'bg-slate-800/80 text-slate-300 border-white/10',
    icon: HelpCircle,
  };

  if (normalized.includes('sahih')) {
    config = {
      label: 'Sahih (Authentic)',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      icon: ShieldCheck,
    };
  } else if (normalized.includes('hasan')) {
    config = {
      label: 'Hasan (Sound)',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: Award,
    };
  } else if (normalized.includes('daif') || normalized.includes('weak')) {
    config = {
      label: 'Da\'if (Weak)',
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      icon: AlertCircle,
    };
  }

  const Icon = config.icon;
  const hasMultipleGrades = grades && grades.length > 0;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => hasMultipleGrades && setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all ${
          config.badgeClass
        } ${hasMultipleGrades && showDetailsButton ? 'cursor-pointer hover:brightness-125' : 'cursor-default'}`}
        title={hasMultipleGrades ? "Click to view scholar grading details" : undefined}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{config.label}</span>
        {hasMultipleGrades && showDetailsButton && (
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </motion.button>

      {/* Scholarly details popover */}
      <AnimatePresence>
        {isOpen && hasMultipleGrades && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 mt-2 w-72 rounded-2xl glass-panel border border-white/10 shadow-2xl p-3.5 text-xs text-slate-200"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-white/[0.08] pb-2 mb-2 flex items-center justify-between">
              <span>Scholar Determinations</span>
              <span className="text-[10px] text-emerald-400 font-mono">Takhrij</span>
            </div>

            <div className="space-y-1.5">
              {grades.map((g, idx) => (
                <div key={idx} className="flex justify-between items-start gap-2 bg-slate-800/60 p-2 rounded-xl border border-white/[0.06]">
                  <span className="text-slate-300 font-medium">{g.scholar || g.name || 'Scholar'}:</span>
                  <span className="font-semibold text-emerald-300">{g.grade}</span>
                </div>
              ))}
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/[0.08] text-[10px] text-slate-400 leading-tight">
              Preserved verbatim from scholarly commentaries.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
