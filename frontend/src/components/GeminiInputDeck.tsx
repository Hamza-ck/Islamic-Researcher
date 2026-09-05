import React, { useRef, useEffect, useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowUp, 
  SlidersHorizontal, 
  Check, 
  ShieldCheck, 
  BookOpen, 
  Mic, 
  BookMarked
} from 'lucide-react';
import { SearchMode, ResearchMode, FolioFilterState, SynthesisOptions, SourceType } from '../types';

interface GeminiInputDeckProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSend: (customQuery?: string) => void;
  isLoading: boolean;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  filterState: FolioFilterState;
  onFilterChange: (filters: FolioFilterState) => void;
  synthesisOptions: SynthesisOptions;
  onSynthesisOptionsChange: (opts: SynthesisOptions) => void;
  researchMode?: ResearchMode;
  onResearchModeChange?: (mode: ResearchMode) => void;
  allowExternal?: boolean;
  onAllowExternalChange?: (allow: boolean) => void;
}

export const GeminiInputDeck: React.FC<GeminiInputDeckProps> = ({
  query,
  onQueryChange,
  onSend,
  isLoading,
  mode,
  onModeChange,
  filterState,
  onFilterChange,
  synthesisOptions,
  onSynthesisOptionsChange,
  researchMode = 'research',
  onResearchModeChange,
  allowExternal = false,
  onAllowExternalChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Auto-expand textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const toggleSourceType = (type: SourceType) => {
    const current = filterState.types;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFilterChange({ ...filterState, types: next });
  };

  const toggleMinGrade = () => {
    const next = filterState.minGrade === 'sahih' ? null : 'sahih';
    onFilterChange({ ...filterState, minGrade: next });
  };

  const sourceTypes: { id: SourceType; label: string; icon: React.ReactNode }[] = [
    { id: 'quran', label: 'Quran', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'hadith', label: 'Hadith', icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'tafsir', label: 'Tafsir', icon: <BookMarked className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'lecture_transcript', label: 'Lectures & Scholars', icon: <Mic className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  const activeFiltersCount = 
    (filterState.types.length > 0 ? filterState.types.length : 0) +
    (filterState.minGrade ? 1 : 0);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 relative">
      {/* Expanded Filter Drawer Modal / Popover */}
      {showFilters && (
        <div className="mb-3 p-4 rounded-2xl bg-[#1e1f20] border border-white/10 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200 max-h-[65vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              Corpus Sources & Scholarly Depth
            </span>
            <button
              onClick={() => setShowFilters(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/[0.06]"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Source Types */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-400 block">Target Sources</span>
              <div className="flex flex-wrap gap-2">
                {sourceTypes.map((t) => {
                  const isSelected = filterState.types.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleSourceType(t.id)}
                      className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-sm'
                          : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07]'
                      }`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Authenticity Grade & Synthesis Style */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-400 block">Hadith Rigor & Response Style</span>
              <div className="flex flex-wrap gap-2">
                {/* Sahih Only Toggle */}
                <button
                  onClick={toggleMinGrade}
                  className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-full text-xs font-medium border transition-all ${
                    filterState.minGrade === 'sahih'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sahih Only</span>
                  {filterState.minGrade === 'sahih' && <Check className="w-3 h-3 text-emerald-400" />}
                </button>

                {/* Style Presets */}
                <div className="inline-flex rounded-full bg-white/[0.04] p-0.5 border border-white/[0.08]">
                  {(['concise', 'scholarly', 'detailed'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onSynthesisOptionsChange({ ...synthesisOptions, responseStyle: s })}
                      className={`px-2.5 py-1 rounded-full text-[11px] capitalize font-medium transition-all ${
                        synthesisOptions.responseStyle === s
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Pill Prompt Bar */}
      <div className="gemini-input-pill rounded-3xl p-3 sm:p-3.5 flex flex-col gap-2.5">
        {/* Main Textarea */}
        <div className="flex items-end gap-3 px-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'ask'
                ? "Ask anything across Quran, Hadith, Tafsir, or Scholar Lectures (Dr. Israr Ahmed, Sayyid Qutb)..."
                : "Search verified scripture passages, hadiths by chapter, or commentary..."
            }
            className="flex-1 bg-transparent border-none outline-none resize-none text-base text-slate-100 placeholder-slate-500 max-h-44 py-1 leading-relaxed"
          />

          {/* Send Button */}
          <button
            onClick={() => onSend()}
            disabled={!query.trim() || isLoading}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              query.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                : 'bg-white/[0.06] text-slate-600 cursor-not-allowed'
            }`}
            title="Send Research Inquiry"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Bottom Toolbar inside the pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04] text-xs">
          {/* Mode Switcher Pill */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onModeChange(mode === 'ask' ? 'search' : 'ask')}
              className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium transition-all ${
                mode === 'ask'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-sm'
                  : 'bg-white/[0.05] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
              }`}
              title="Toggle AI Research Mode vs Raw Retrieval"
            >
              {mode === 'ask' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>AI Research</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Scripture Search</span>
                </>
              )}
            </button>

            {/* Research Depth Switcher (Visible in Ask Mode) */}
            {mode === 'ask' && onResearchModeChange && (
              <div className="hidden sm:inline-flex items-center p-0.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                {(['quick', 'research', 'deep'] as const).map((rm) => (
                  <button
                    key={rm}
                    type="button"
                    onClick={() => onResearchModeChange(rm)}
                    className={`px-2 py-0.5 rounded-full text-[11px] capitalize font-medium transition-all ${
                      researchMode === rm
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rm}
                  </button>
                ))}
              </div>
            )}

            {/* External Research Toggle */}
            {mode === 'ask' && onAllowExternalChange && (
              <button
                type="button"
                onClick={() => onAllowExternalChange(!allowExternal)}
                className={`hidden md:inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[11px] font-medium border transition-all ${
                  allowExternal
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border-white/[0.06]'
                }`}
                title="Include vetted external sources if corpus is insufficient"
              >
                <span>External Web/Corpus</span>
                <span className={`w-1.5 h-1.5 rounded-full ${allowExternal ? 'bg-purple-400' : 'bg-slate-500'}`} />
              </button>
            )}

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium border transition-all ${
                activeFiltersCount > 0 || showFilters
                  ? 'bg-white/[0.08] border-blue-500/30 text-blue-300'
                  : 'bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Grounding Disclaimer */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
            <span>Grounded Corpus & Transcripts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
