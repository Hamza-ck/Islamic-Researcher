import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchMode, FolioFilterState, SourceType, SynthesisOptions, ResponseStyle } from '../types';
import { PRESET_QUERIES } from '../data/mockCorpus';
import { Search, Sparkles, Sliders, X, BookOpen, ChevronDown, RefreshCw, Settings2 } from 'lucide-react';

interface SearchApparatusProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: (customQuery?: string) => void;
  isLoading: boolean;
  mode: SearchMode;
  onModeChange: (m: SearchMode) => void;
  filterState: FolioFilterState;
  onFilterChange: (f: FolioFilterState) => void;
  synthesisOptions: SynthesisOptions;
  onSynthesisOptionsChange: (opts: SynthesisOptions) => void;
}

export const SearchApparatus: React.FC<SearchApparatusProps> = ({
  query,
  onQueryChange,
  onSearch,
  isLoading,
  mode,
  onModeChange,
  filterState,
  onFilterChange,
  synthesisOptions,
  onSynthesisOptionsChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAiOptions, setShowAiOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch();
  };

  const toggleType = (type: SourceType) => {
    const current = filterState.types;
    const next = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onFilterChange({ ...filterState, types: next });
  };

  const toggleCollection = (coll: string) => {
    const current = filterState.collections;
    const next = current.includes(coll)
      ? current.filter(c => c !== coll)
      : [...current, coll];
    onFilterChange({ ...filterState, collections: next });
  };

  const hadithCollections = [
    { id: 'bukhari', name: 'Sahih al-Bukhari' },
    { id: 'muslim', name: 'Sahih Muslim' },
    { id: 'tirmidhi', name: 'Jami at-Tirmidhi' },
    { id: 'abudawud', name: 'Sunan Abi Dawud' },
    { id: 'nasai', name: 'Sunan an-Nasai' },
    { id: 'ibnmajah', name: 'Sunan Ibn Majah' },
    { id: 'malik', name: 'Muwatta Malik' },
  ];

  const hasActiveFilters = filterState.types.length > 0 || filterState.minGrade || filterState.collections.length > 0;

  return (
    <div className="w-full space-y-4">
      
      {/* Top Bar: Mode Switcher & Filter Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Mode Toggle Capsule */}
        <div className="inline-flex p-1 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-xl shadow-lg relative">
          <button
            type="button"
            onClick={() => onModeChange('search')}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              mode === 'search' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {mode === 'search' && (
              <motion.div
                layoutId="activeModePill"
                className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-glow-emerald"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <BookOpen className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Search Passages</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('ask')}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              mode === 'ask' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {mode === 'ask' && (
              <motion.div
                layoutId="activeModePill"
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-950/50"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <Sparkles className="w-4 h-4 text-amber-300 relative z-10" />
            <span className="relative z-10">AI Synthesized Answer</span>
          </button>
        </div>

        {/* Filter Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium backdrop-blur-xl transition-all shadow-sm ${
            hasActiveFilters || showFilters
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {/* Main Glass Search Bar */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <div className="absolute left-4 sm:left-5 pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              mode === 'ask'
                ? "Ask any question (e.g. 'What does Islam teach about honoring parents?')..."
                : "Search verses, hadiths, or topics (e.g. 'patience in hardship', 'Surah 2:255')..."
            }
            className="w-full pl-12 sm:pl-14 pr-32 sm:pr-36 py-4 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl text-slate-100 text-sm sm:text-base placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 shadow-2xl transition-all duration-300"
          />

          <div className="absolute right-2.5 sm:right-3 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/50 transition-all"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : mode === 'ask' ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Searching...' : mode === 'ask' ? 'Ask AI' : 'Search'}</span>
            </motion.button>
          </div>
        </div>
      </form>

      {/* Expandable Glass Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-5 glass-card rounded-2xl space-y-4 border border-white/10 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                {/* Source Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Source Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'quran' as SourceType, label: '📖 Quran' },
                      { id: 'hadith' as SourceType, label: '📜 Hadith' },
                      { id: 'tafsir' as SourceType, label: '📚 Tafsir' },
                    ].map((item) => {
                      const active = filterState.types.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleType(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            active
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold shadow-sm'
                              : 'bg-slate-800/60 border-white/10 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hadith Grade Floor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Hadith Authenticity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: null, label: 'All Grades' },
                      { id: 'hasan', label: 'Sound (Hasan+)' },
                      { id: 'sahih', label: 'Authentic (Sahih Only)' },
                    ].map((item) => {
                      const active = filterState.minGrade === item.id;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => onFilterChange({ ...filterState, minGrade: item.id })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            active
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold shadow-sm'
                              : 'bg-slate-800/60 border-white/10 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear & Reset */}
                <div className="flex items-end justify-start sm:justify-end">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ types: [], collections: [], minGrade: null })}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors underline"
                  >
                    Reset all filters
                  </button>
                </div>
              </div>

              {/* Hadith Collections Toggle */}
              <div className="pt-3 border-t border-white/[0.06]">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Hadith Collections
                </label>
                <div className="flex flex-wrap gap-2">
                  {hadithCollections.map((col) => {
                    const active = filterState.collections.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => toggleCollection(col.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                          active
                            ? 'bg-teal-500/20 border-teal-500/50 text-teal-200 font-semibold shadow-sm'
                            : 'bg-slate-800/50 border-white/[0.08] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {col.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Options Panel (shown only in ask mode) */}
      {mode === 'ask' && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowAiOptions(!showAiOptions)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium backdrop-blur-xl transition-all shadow-sm ${
              showAiOptions
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Options</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAiOptions ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showAiOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-5 glass-card rounded-2xl space-y-5 border border-white/10 shadow-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Response Style */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Response Style
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {([
                          { id: 'concise' as ResponseStyle, label: '⚡ Concise', desc: 'Short & direct' },
                          { id: 'scholarly' as ResponseStyle, label: '📖 Scholarly', desc: 'Thorough analysis' },
                          { id: 'detailed' as ResponseStyle, label: '📚 Detailed', desc: 'Exhaustive treatment' },
                        ] as const).map((style) => {
                          const active = synthesisOptions.responseStyle === style.id;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => onSynthesisOptionsChange({ ...synthesisOptions, responseStyle: style.id })}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                                active
                                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-semibold shadow-sm'
                                  : 'bg-slate-800/60 border-white/10 text-slate-400 hover:text-slate-200'
                              }`}
                              title={style.desc}
                            >
                              {style.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        {synthesisOptions.responseStyle === 'concise'
                          ? 'Short, direct answer with essential citations only.'
                          : synthesisOptions.responseStyle === 'detailed'
                            ? 'Exhaustive treatment with tafsir context and Arabic text.'
                            : 'Thorough scholarly analysis with all citations and cross-references.'}
                      </p>
                    </div>

                    {/* Temperature Slider */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Precision ← → Creative
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="70"
                        value={Math.round(synthesisOptions.temperature * 100)}
                        onChange={(e) => onSynthesisOptionsChange({
                          ...synthesisOptions,
                          temperature: parseInt(e.target.value) / 100,
                        })}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>🎯 Precise (0.0)</span>
                        <span className="text-indigo-400 font-mono">{synthesisOptions.temperature.toFixed(1)}</span>
                        <span>🎨 Creative (0.7)</span>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Suggested Topics Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400 scrollbar-none">
        <span className="shrink-0 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Suggested Topics:
        </span>
        {PRESET_QUERIES.map((preset, idx) => (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            key={idx}
            type="button"
            onClick={() => {
              onQueryChange(preset.query);
              onSearch(preset.query);
            }}
            className="shrink-0 px-3 py-1 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-white transition-all text-xs"
            title={preset.description}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>

    </div>
  );
};
