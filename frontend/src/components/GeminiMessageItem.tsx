import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCw, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Mic
} from 'lucide-react';
import { ChatMessage, RawSearchResult } from '../types';
import { FolioCard } from './FolioCard';

interface GeminiMessageItemProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  onFeedback?: (queryId: string, rating: number) => void;
  onExportCitation?: (results: RawSearchResult[]) => void;
  arabicFontSize: 'normal' | 'large' | 'huge';
}

export const GeminiMessageItem: React.FC<GeminiMessageItemProps> = ({
  message,
  onRegenerate,
  onFeedback,
  onExportCitation,
  arabicFontSize,
}) => {
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showSources, setShowSources] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRate = (rating: number) => {
    setUserRating(rating);
    if (message.queryId && onFeedback) {
      onFeedback(message.queryId, rating);
    }
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end my-4 max-w-4xl mx-auto px-4">
        <div className="max-w-2xl bg-[#282a2c] text-slate-100 rounded-3xl rounded-tr-sm px-5 py-3.5 text-sm sm:text-base leading-relaxed border border-white/[0.08] shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant Response
  const sources = message.results || [];
  const hasTranscripts = sources.some(s => s.type === 'lecture_transcript' || s.metadata?.scholar);

  return (
    <div className="my-6 max-w-4xl mx-auto px-4 space-y-4">
      {/* Top Header with Gemini Sparkle Icon */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-amber-400 p-[1.5px] shrink-0 flex items-center justify-center shadow-[0_0_12px_rgba(66,133,244,0.3)]">
          <div className="w-full h-full bg-[#1e1f20] rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white tracking-wide">
            Islamic Research Assistant
          </span>
          {message.metadata?.confidence && (
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
              message.metadata.confidence === 'high'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {message.metadata.confidence} Confidence
            </span>
          )}
          {hasTranscripts && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <Mic className="w-3 h-3 text-purple-400" />
              <span>Scholar Transcripts Grounded</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Synthesized Markdown Content */}
      <div className="pl-0 sm:pl-11 space-y-4">
        <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-3 font-normal whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs text-slate-400">
          <div className="flex items-center gap-1">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
              title="Copy answer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Thumbs Up / Down */}
            <button
              onClick={() => handleRate(1)}
              className={`p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors ${
                userRating === 1 ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-white'
              }`}
              title="Helpful analysis"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRate(-1)}
              className={`p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors ${
                userRating === -1 ? 'text-rose-400 bg-rose-500/10' : 'hover:text-white'
              }`}
              title="Needs refinement"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>

            {/* Regenerate Button */}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
                title="Regenerate synthesis"
              >
                <RotateCw className="w-4 h-4" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            )}

            {/* Export Citation Folio */}
            {onExportCitation && sources.length > 0 && (
              <button
                onClick={() => onExportCitation(sources)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
                title="Export Academic Citation Folio"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Export Folio</span>
              </button>
            )}
          </div>

          {/* Collapsible Sources Drawer Toggle */}
          {sources.length > 0 && (
            <button
              onClick={() => setShowSources(!showSources)}
              className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-[#282a2c] hover:bg-[#333538] border border-white/10 text-xs text-slate-200 font-medium transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>{sources.length} Cited Sources</span>
              {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Expanded Sources / Folios Accordion */}
        {showSources && sources.length > 0 && (
          <div className="pt-4 space-y-4 border-t border-white/[0.08] animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                Verified Evidentiary Passages
              </span>
              <span>{sources.length} passages matched</span>
            </div>

            <div className="space-y-4">
              {sources.map((folio, idx) => (
                <div key={folio.id || idx} className="space-y-2">
                  <FolioCard
                    folio={folio}
                    index={idx}
                    arabicFontSize={arabicFontSize}
                  />

                  {/* If this is a video/lecture transcript with a timestamp anchor, show quick watch button */}
                  {folio.metadata?.video_url && (
                    <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-purple-300">
                        <Mic className="w-4 h-4 text-purple-400" />
                        <span>Lecture Discourse: <strong>{folio.metadata.scholar || 'Scholar Lecture'}</strong></span>
                        {folio.metadata.timestamp_anchor && (
                          <span className="font-mono text-purple-400">@{folio.metadata.timestamp_anchor}</span>
                        )}
                      </div>
                      <a
                        href={folio.metadata.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                      >
                        <span>Listen to Discourse</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
