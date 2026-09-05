import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  Mic, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus,
  Clock
} from 'lucide-react';
import { AppView, HistorySession } from '../types';

interface GeminiSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  onNewResearch: () => void;
  history: HistorySession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isLiveBackend: boolean | null;
  onOpenSettings: () => void;
}

export const GeminiSidebar: React.FC<GeminiSidebarProps> = ({
  isOpen,
  onToggle,
  activeView,
  onViewChange,
  onNewResearch,
  history,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  isLiveBackend,
  onOpenSettings,
}) => {
  const closeOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-50 lg:z-30 bg-[#1e1f20] border-r border-white/[0.08] transition-all duration-300 flex flex-col ${
          isOpen 
            ? 'translate-x-0 w-64 shadow-2xl lg:shadow-none' 
            : '-translate-x-full lg:translate-x-0 lg:w-16'
        }`}
      >
        {/* Top Header & Collapse Toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06]">
          {isOpen ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-amber-400 p-[1.5px] shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#1e1f20] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <div className="leading-tight truncate">
                <span className="text-sm font-extrabold tracking-tight text-white block">DALIL RESEARCH</span>
                <span className="text-[10px] text-emerald-400/90 font-medium tracking-wide block">Search. Verify. Understand.</span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-amber-400 p-[1.5px] flex items-center justify-center cursor-pointer" onClick={onToggle}>
                <div className="w-full h-full bg-[#1e1f20] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onToggle}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors ${!isOpen && 'hidden'}`}
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* New Research Action Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewResearch();
              closeOnMobile();
            }}
            className={`w-full flex items-center gap-3 py-3 px-3.5 rounded-full bg-[#282a2c] hover:bg-[#333538] border border-white/10 hover:border-blue-500/40 text-sm font-medium text-slate-200 hover:text-white transition-all shadow-sm ${
              isOpen ? 'justify-start' : 'justify-center px-0'
            }`}
            title="New Research"
          >
            <Plus className="w-5 h-5 text-blue-400 shrink-0" />
            {isOpen && <span className="truncate">New Research</span>}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-3 py-2 space-y-1">
          <button
            onClick={() => {
              onViewChange('chat');
              closeOnMobile();
            }}
            className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
              activeView === 'chat'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
            } ${!isOpen && 'justify-center px-0'}`}
            title="Research Studio"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            {isOpen && <span>Research Studio</span>}
          </button>

          <button
            onClick={() => {
              onViewChange('library');
              closeOnMobile();
            }}
            className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
              activeView === 'library'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
            } ${!isOpen && 'justify-center px-0'}`}
            title="Hadith Library (Section-Wise)"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            {isOpen && <span>Hadith Library</span>}
          </button>

          <button
            onClick={() => {
              onViewChange('scholars');
              closeOnMobile();
            }}
            className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
              activeView === 'scholars'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
            } ${!isOpen && 'justify-center px-0'}`}
            title="Scholar Lectures & Transcripts"
          >
            <Mic className="w-4 h-4 shrink-0" />
            {isOpen && <span>Scholar Lectures</span>}
          </button>
        </div>

        {/* Recent Research History List */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto px-3 py-3 border-t border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Recent Inquiries</span>
              <Clock className="w-3 h-3" />
            </div>

            {history.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-500">
                No recent searches. Ask anything to begin.
              </div>
            ) : (
              history.map((session) => (
                <div
                  key={session.id}
                  className={`group relative flex items-center justify-between py-2 px-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    activeSessionId === session.id
                      ? 'bg-white/[0.08] text-white font-medium'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    closeOnMobile();
                  }}
                >
                  <span className="truncate pr-5">{session.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 rounded transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bottom Pinned Footer & Settings */}
        <div className="p-3 border-t border-white/[0.08] space-y-2 mt-auto bg-[#18191a]/40">
          {/* Backend Status indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[#252729] border border-white/[0.06] text-xs ${
            isOpen ? 'justify-between' : 'justify-center'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                isLiveBackend === true 
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
                  : isLiveBackend === false 
                    ? 'bg-amber-400' 
                    : 'bg-slate-500 animate-pulse'
              }`} />
              {isOpen && (
                <span className="text-slate-300 font-medium text-xs">
                  {isLiveBackend === true ? 'Live Vector DB' : isLiveBackend === false ? 'Offline Fallback' : 'Connecting...'}
                </span>
              )}
            </div>
            {isOpen && isLiveBackend === true && (
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono">45K+ Docs</span>
            )}
          </div>

          {/* Settings Button */}
          <button
            onClick={() => {
              onOpenSettings();
              closeOnMobile();
            }}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors ${
              !isOpen && 'justify-center px-0'
            }`}
            title="Settings & Models"
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-400" />
            {isOpen && <span>Settings & API Endpoint</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
