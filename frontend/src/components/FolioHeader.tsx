import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, BookMarked } from 'lucide-react';

interface HeaderProps {
  isLiveBackend: boolean | null;
  onOpenSettings: () => void;
  arabicFontSize: 'normal' | 'large' | 'huge';
  onFontSizeChange: (size: 'normal' | 'large' | 'huge') => void;
}

export const FolioHeader: React.FC<HeaderProps> = ({
  isLiveBackend,
  onOpenSettings,
  arabicFontSize,
  onFontSizeChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#06080e]/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-700/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow-emerald"
          >
            <BookMarked className="w-5 h-5" />
          </motion.div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Islamic Researcher
              </span>
              <span className="font-amiri text-lg text-emerald-400/90 font-bold hidden sm:inline" lang="ar">
                بَاحِثُ النُّصُوص
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Quran, Verified Hadith & Tafsir Search Engine
            </p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Text Size Control */}
          <div className="hidden sm:flex items-center bg-slate-900/80 border border-white/10 rounded-xl p-1 text-xs">
            <span className="px-2 text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <span>Text:</span>
            </span>
            {(['normal', 'large', 'huge'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onFontSizeChange(size)}
                className={`px-2.5 py-0.5 rounded-lg font-medium text-[11px] transition-all ${
                  arabicFontSize === size
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'XL'}
              </button>
            ))}
          </div>

          {/* Backend Status Pill */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onOpenSettings}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all ${
              isLiveBackend === true
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-950'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-950'
            }`}
            title="Click to view or change backend server"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLiveBackend === true ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isLiveBackend === true ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className="hidden sm:inline">
              {isLiveBackend === true ? 'Hugging Face Live' : 'Offline Mode'}
            </span>
            <span className="sm:hidden text-[10px]">
              {isLiveBackend === true ? 'Live' : 'Offline'}
            </span>
          </motion.button>

          {/* Settings Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Server Settings"
            aria-label="Server Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </motion.button>

        </div>

      </div>
    </header>
  );
};
