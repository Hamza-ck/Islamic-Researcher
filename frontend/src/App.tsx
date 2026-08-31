import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RawSearchResult, SearchMode, FolioFilterState } from './types';
import { executeFolioQuery, checkBackendHealth, getStoredBackendUrl } from './services/api';
import { FolioHeader } from './components/FolioHeader';
import { SearchApparatus } from './components/SearchApparatus';
import { FolioCard } from './components/FolioCard';
import { ScribeCommentaryPanel } from './components/ScribeCommentaryPanel';
import { SettingsModal } from './components/SettingsModal';
import { BookOpen, RefreshCw, Layers } from 'lucide-react';

export function App() {
  const [query, setQuery] = useState('patience during hardship');
  const [mode, setMode] = useState<SearchMode>('search');
  const [filterState, setFilterState] = useState<FolioFilterState>({
    types: [],
    collections: [],
    minGrade: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RawSearchResult[]>([]);
  const [synthesisAnswer, setSynthesisAnswer] = useState<string | null>(null);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [highlightedFolioId, setHighlightedFolioId] = useState<string | null>(null);
  const [arabicFontSize, setArabicFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Check backend health on initial load
  const verifyBackend = useCallback(async () => {
    const url = getStoredBackendUrl();
    const ok = await checkBackendHealth(url);
    setIsLiveBackend(ok);
  }, []);

  useEffect(() => {
    verifyBackend();
  }, [verifyBackend]);

  // Execute query handler
  const handleExecuteSearch = useCallback(async (customQuery?: string, customMode?: SearchMode) => {
    const activeQuery = customQuery ?? query;
    const activeMode = customMode ?? mode;

    if (!activeQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setHighlightedFolioId(null);

    try {
      const response = await executeFolioQuery(activeMode, activeQuery, filterState);
      setResults(response.results);
      setSynthesisAnswer(response.answer || null);
      setIsLiveBackend(response.isLive);
    } catch (err) {
      console.error('Query execution error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query, mode, filterState]);

  // Run default query on mount
  useEffect(() => {
    handleExecuteSearch('patience during hardship', 'search');
  }, []);

  // Mode change handler
  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    if (query.trim() && hasSearched) {
      handleExecuteSearch(query, newMode);
    }
  };

  // Scroll to cited folio from synthesis commentary
  const handleScrollToFolio = (id: string) => {
    setHighlightedFolioId(id);
    const element = document.getElementById(`folio-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col relative overflow-x-hidden font-sans">

      {/* Ambient Glassmorphic Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <FolioHeader
        isLiveBackend={isLiveBackend}
        onOpenSettings={() => setIsSettingsOpen(true)}
        arabicFontSize={arabicFontSize}
        onFontSizeChange={setArabicFontSize}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">

        {/* Search Widget */}
        <section>
          <SearchApparatus
            query={query}
            onQueryChange={setQuery}
            onSearch={() => handleExecuteSearch()}
            isLoading={isLoading}
            mode={mode}
            onModeChange={handleModeChange}
            filterState={filterState}
            onFilterChange={(f) => {
              setFilterState(f);
            }}
          />
        </section>

        {/* Loading Spinner */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-glow-emerald">
              <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Searching Islamic Corpus...
              </h3>
              <p className="text-xs text-slate-400">
                Finding matched Quranic verses, authentic hadiths, and classical commentary
              </p>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {!isLoading && hasSearched && (
          <div className="space-y-8">

            {/* AI Synthesized Answer (Shown in 'ask' mode) */}
            <AnimatePresence>
              {mode === 'ask' && synthesisAnswer && (
                <ScribeCommentaryPanel
                  answer={synthesisAnswer}
                  sources={results}
                  onScrollToFolio={handleScrollToFolio}
                />
              )}
            </AnimatePresence>

            {/* Results Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {mode === 'ask' ? 'Cited Source Passages' : 'Retrieved Passages'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-white/10 text-xs font-mono text-emerald-300 font-semibold">
                  {results.length} Found
                </span>
              </div>

              {/* Source breakdown counts */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>Quran: <strong className="text-slate-200">{results.filter(r => r.type === 'quran').length}</strong></span>
                <span>•</span>
                <span>Hadith: <strong className="text-slate-200">{results.filter(r => r.type === 'hadith').length}</strong></span>
                <span>•</span>
                <span>Tafsir: <strong className="text-slate-200">{results.filter(r => r.type === 'tafsir').length}</strong></span>
              </div>
            </div>

            {/* List of Passages */}
            {results.length > 0 ? (
              <motion.div
                layout
                className="space-y-5"
              >
                {results.map((folio, idx) => (
                  <FolioCard
                    key={folio.id || idx}
                    folio={folio}
                    index={idx}
                    arabicFontSize={arabicFontSize}
                    isHighlighted={highlightedFolioId === folio.id}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center glass-card rounded-3xl border border-white/10 space-y-3"
              >
                <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">
                  No Passages Found
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Try searching with different keywords or adjusting the source filters above.
                </p>
              </motion.div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#04060b]/80 backdrop-blur-xl py-6 mt-16 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="text-slate-300 font-semibold text-xs tracking-wide">
            Islamic Research Engine • Grounded Scripture & Verified Hadith
          </p>
          <p className="text-[11px] text-slate-400">
            Quran (Arabic & Translations) • Canonical Hadith • Classical Tafsir
          </p>
        </div>
      </footer>

      {/* Backend Settings Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onEndpointUpdated={verifyBackend}
      />

    </div>
  );
}

export default App;
