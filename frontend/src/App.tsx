import { useState, useEffect, useCallback } from 'react';
import { 
  AppView, 
  SearchMode, 
  ResearchMode,
  FolioFilterState, 
  SynthesisOptions, 
  ChatMessage, 
  HistorySession, 
  RawSearchResult 
} from './types';
import { executeFolioQuery, executeResearchQuery, checkBackendHealth, getStoredBackendUrl, submitFeedback } from './services/api';
import { CollectionsPanel } from './components/CollectionsPanel';
import { GeminiSidebar } from './components/GeminiSidebar';
import { GeminiHero } from './components/GeminiHero';
import { GeminiInputDeck } from './components/GeminiInputDeck';
import { GeminiMessageItem } from './components/GeminiMessageItem';
import { LibraryExplorer } from './components/LibraryExplorer';
import { SettingsModal } from './components/SettingsModal';
import { CitationExportModal } from './components/CitationExportModal';
import { 
  Menu, 
  Sparkles, 
  RotateCw, 
  Type
} from 'lucide-react';

const STORAGE_KEY = 'islamic_research_gemini_history';

export function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [activeView, setActiveView] = useState<AppView>('chat');

  // Input & Search States
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('ask');
  const [researchMode, setResearchMode] = useState<ResearchMode>('research');
  const [allowExternal, setAllowExternal] = useState(false);
  const [filterState, setFilterState] = useState<FolioFilterState>({
    types: [],
    collections: [],
    minGrade: null,
  });
  const [synthesisOptions, setSynthesisOptions] = useState<SynthesisOptions>({
    responseStyle: 'scholarly',
    detailLevel: 'standard',
    temperature: 0.3,
  });

  // Conversation & History State
  const [history, setHistory] = useState<HistorySession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // System & Backend States
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean | null>(null);
  const [arabicFontSize, setArabicFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [exportFolio, setExportFolio] = useState<RawSearchResult | null>(null);

  // Responsive resize handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist history:', e);
    }
  }, [history]);

  // Check backend health
  const verifyBackend = useCallback(async () => {
    const url = getStoredBackendUrl();
    const ok = await checkBackendHealth(url);
    setIsLiveBackend(ok);
  }, []);

  useEffect(() => {
    verifyBackend();
  }, [verifyBackend]);

  // Start a fresh research session
  const handleNewResearch = () => {
    setActiveSessionId(null);
    setMessages([]);
    setQuery('');
    setActiveView('chat');
  };

  // Select a session from history
  const handleSelectSession = (id: string) => {
    const session = history.find((s) => s.id === id);
    if (session) {
      setActiveSessionId(session.id);
      setMessages(session.messages);
      setActiveView('chat');
    }
  };

  // Delete a session from history
  const handleDeleteSession = (id: string) => {
    setHistory((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      handleNewResearch();
    }
  };

  // Execute query handler
  const handleExecuteResearch = async (customQuery?: string, customMode?: SearchMode) => {
    const activeQuery = (customQuery ?? query).trim();
    const activeMode = customMode ?? mode;

    if (!activeQuery || isLoading) return;

    // Switch to chat view if triggered from another tab
    setActiveView('chat');
    setIsLoading(true);

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: activeQuery,
      mode: activeMode,
      timestamp: Date.now(),
    };

    // Update message stream with user turn
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setQuery('');

    try {
      const response =
        activeMode === 'search'
          ? await executeFolioQuery(activeMode, activeQuery, filterState, 8)
          : await executeResearchQuery(
              activeQuery,
              researchMode,
              filterState,
              researchMode === 'deep' ? 12 : 8,
              synthesisOptions,
              allowExternal,
            );

      setIsLiveBackend(response.isLive);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer || (response.results.length > 0
          ? `Found ${response.results.length} authentic passages matching your inquiry:`
          : 'No relevant passages were found in the corpus. Try adjusting your search keywords or removing specific filters.'),
        mode: activeMode,
        researchMode,
        results: response.results,
        metadata: response.metadata,
        queryId: response.queryId,
        timestamp: Date.now(),
        isDemo: response.isDemo || !response.isLive,
        research: response.research || null,
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      // Update or create history session
      const title = activeQuery.length > 38 ? `${activeQuery.slice(0, 38)}...` : activeQuery;
      const preview = (response.answer || 'Search results').slice(0, 70);

      if (activeSessionId) {
        setHistory((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, messages: finalMessages, preview } : s))
        );
      } else {
        const newSessionId = `session-${Date.now()}`;
        setActiveSessionId(newSessionId);
        const newSession: HistorySession = {
          id: newSessionId,
          title,
          preview,
          timestamp: Date.now(),
          messages: finalMessages,
        };
        setHistory((prev) => [newSession, ...prev]);
      }
    } catch (err) {
      console.error('Research execution error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'An unexpected connection error occurred while querying the Islamic knowledge base. Please check your backend endpoint in settings.',
        mode: activeMode,
        timestamp: Date.now(),
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // User feedback on synthesis
  const handleFeedback = async (queryId: string, rating: number) => {
    await submitFeedback(queryId, rating);
  };

  // Regenerate last synthesis
  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleExecuteResearch(lastUserMsg.content, lastUserMsg.mode);
    }
  };

  // Font size toggle
  const cycleFontSize = () => {
    setArabicFontSize((curr) => (curr === 'normal' ? 'large' : curr === 'large' ? 'huge' : 'normal'));
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] flex overflow-x-hidden font-sans antialiased">
      {/* Ambient Gemini Glow Orbs */}
      <div className="fixed top-0 left-1/3 w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-purple-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Gemini Navigation Sidebar */}
      <GeminiSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeView={activeView}
        onViewChange={setActiveView}
        onNewResearch={handleNewResearch}
        history={history}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        isLiveBackend={isLiveBackend}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 w-full ${
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-16'
        }`}
      >
        {/* Top Minimal Gemini Header Bar */}
        <header className="sticky top-0 z-20 h-14 border-b border-white/[0.06] bg-[#131314]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar toggle for mobile or collapsed */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 truncate">
              <span className="text-sm font-semibold text-slate-100 truncate">
                {activeView === 'chat'
                  ? 'Dalil Research Studio'
                  : activeView === 'library'
                  ? 'Canonical Hadith Library'
                  : 'Scholar Transcripts & Treatises'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Grounded Gemini 2.5</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick jump to Research Studio when in library mode */}
            {activeView !== 'chat' && (
              <button
                onClick={() => setActiveView('chat')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Ask AI Studio</span>
              </button>
            )}

            {/* Arabic Script Size Toggle */}
            <button
              onClick={cycleFontSize}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-white/[0.08] flex items-center gap-1 transition-all"
              title="Change Arabic font size"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="capitalize">{arabicFontSize}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Main Views */}
        <main className="flex-1 flex flex-col">
          {/* VIEW 1: GEMINI RESEARCH STUDIO */}
          {activeView === 'chat' && (
            <div className="flex-1 flex flex-col justify-between w-full min-h-[calc(100vh-3.5rem)]">
              {messages.length === 0 ? (
                /* Gemini Welcome Hero */
                <div className="flex-1 flex items-center">
                  <GeminiHero
                    onSelectPrompt={(p, m) => {
                      handleExecuteResearch(p, m);
                    }}
                  />
                </div>
              ) : (
                /* Conversational Stream */
                <div className="py-6 space-y-4 pb-8 flex-1">
                  {messages.map((msg) => (
                    <GeminiMessageItem
                      key={msg.id}
                      message={msg}
                      onRegenerate={msg.role === 'assistant' ? handleRegenerate : undefined}
                      onFeedback={handleFeedback}
                      onExportCitation={(results) => {
                        if (results.length > 0) setExportFolio(results[0]);
                      }}
                      arabicFontSize={arabicFontSize}
                    />
                  ))}

                  {/* Gemini Thinking / Loading State */}
                  {isLoading && (
                    <div className="my-6 max-w-4xl mx-auto px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-amber-400 p-[1.5px] shrink-0 animate-pulse">
                        <div className="w-full h-full bg-[#1e1f20] rounded-[10px] flex items-center justify-center">
                          <RotateCw className="w-4 h-4 text-blue-400 animate-spin" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-200 block">
                          Searching Islamic Corpus & Scholar Archives...
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Synthesizing verified verses, canonical hadiths, and scholar lecture transcripts
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pinned Input Deck at bottom of Chat Canvas ONLY */}
              <div className="sticky bottom-0 z-30 pb-4 pt-2 bg-gradient-to-t from-[#131314] via-[#131314]/95 to-transparent">
                <GeminiInputDeck
                  query={query}
                  onQueryChange={setQuery}
                  onSend={() => handleExecuteResearch()}
                  isLoading={isLoading}
                  mode={mode}
                  onModeChange={setMode}
                  filterState={filterState}
                  onFilterChange={setFilterState}
                  synthesisOptions={synthesisOptions}
                  onSynthesisOptionsChange={setSynthesisOptions}
                  researchMode={researchMode}
                  onResearchModeChange={setResearchMode}
                  allowExternal={allowExternal}
                  onAllowExternalChange={setAllowExternal}
                />
              </div>
            </div>
          )}

          {/* VIEW 2 & 3: SECTION-WISE HADITH LIBRARY & SCHOLAR LECTURES */}
          {(activeView === 'library' || activeView === 'scholars') && (
            <div className="flex-1 pb-16">
              <LibraryExplorer
                onStartResearch={(prompt, mode) => {
                  setActiveView('chat');
                  handleExecuteResearch(prompt, mode);
                }}
                arabicFontSize={arabicFontSize}
              />
            </div>
          )}

          {/* VIEW 4: CURATED COLLECTIONS */}
          {activeView === 'collections' && (
            <div className="flex-1 pb-16">
              <CollectionsPanel
                onStartResearch={(prompt, rMode) => {
                  setResearchMode(rMode);
                  handleExecuteResearch(prompt, 'ask');
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Settings Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onEndpointUpdated={verifyBackend}
      />

      {/* Academic Citation Export Modal */}
      {exportFolio && (
        <CitationExportModal
          folio={exportFolio}
          onClose={() => setExportFolio(null)}
        />
      )}
    </div>
  );
}

export default App;
