import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RawSearchResult, SynthesisMetadata } from '../types';
import { Sparkles, Copy, Check, ShieldCheck, ArrowDown, ThumbsUp, ThumbsDown, RefreshCw, Cpu, Zap, Clock } from 'lucide-react';

interface CommentaryProps {
  answer: string;
  sources: RawSearchResult[];
  onScrollToFolio: (id: string) => void;
  metadata?: SynthesisMetadata | null;
  queryId?: string | null;
  onFeedback?: (queryId: string, rating: number) => void;
  onRegenerate?: () => void;
}

export const ScribeCommentaryPanel: React.FC<CommentaryProps> = ({
  answer,
  sources,
  onScrollToFolio,
  metadata,
  queryId,
  onFeedback,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    if (feedbackGiven) return; // Already gave feedback
    setFeedbackGiven(type);
    if (queryId && onFeedback) {
      onFeedback(queryId, type === 'up' ? 5 : 1);
    }
  };

  // Enhance text with interactive citation pills
  const renderInteractiveText = (text: string) => {
    const citationRegex = /(\((?:Surah|Sahih|Ṣaḥīḥ|Jami|Jāmi|Sunan|Tafsir|Tafsīr|Quran|Qurʾān)[^)]+\)|\[(?:Surah|Sahih|Ṣaḥīḥ|Jami|Jāmi|Sunan|Tafsir|Tafsīr|Quran|Qurʾān)[^\]]+\])/gi;
    const parts = text.split(citationRegex);

    return parts.map((part, index) => {
      if (citationRegex.test(part)) {
        const cleanRef = part.replace(/[()[\]]/g, '').toLowerCase();
        
        const matchedSource = sources.find(s => {
          const sCitation = s.citation.toLowerCase();
          return sCitation.includes(cleanRef) || cleanRef.includes(sCitation) ||
            (s.metadata.collection && cleanRef.includes(s.metadata.collection.toLowerCase()));
        });

        return (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (matchedSource) {
                onScrollToFolio(matchedSource.id);
              }
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer mx-1 shadow-sm"
            title={matchedSource ? `Jump to ${matchedSource.citation}` : 'Primary Source Reference'}
          >
            <span>{part}</span>
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const confidenceColor = metadata?.confidence === 'high'
    ? 'text-emerald-400'
    : metadata?.confidence === 'medium'
      ? 'text-amber-400'
      : 'text-red-400';

  const confidenceLabel = metadata?.confidence === 'high'
    ? 'High Confidence'
    : metadata?.confidence === 'medium'
      ? 'Medium Confidence'
      : 'Low Confidence';

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden space-y-5"
    >
      {/* Top Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                AI Synthesized Answer
              </h2>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                100% Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Directly compiled from retrieved authentic Quran, Hadith, and Tafsir passages
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Regenerate Button */}
          {onRegenerate && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-white/10 hover:border-indigo-500/30 text-xs font-semibold shadow-sm transition-all"
              title="Regenerate with slightly different parameters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </motion.button>
          )}

          {/* Copy Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleCopyAnswer}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 text-xs font-semibold shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Answer</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Answer Paragraphs */}
      <div className="text-slate-200 text-base sm:text-lg leading-relaxed space-y-4 font-normal">
        {answer.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed">
            {renderInteractiveText(paragraph)}
          </p>
        ))}
      </div>

      {/* Feedback Bar */}
      <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
        <span className="text-xs text-slate-400 font-medium">Was this helpful?</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => handleFeedback('up')}
          disabled={feedbackGiven !== null}
          className={`p-2 rounded-xl border transition-all ${
            feedbackGiven === 'up'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : feedbackGiven !== null
                ? 'opacity-40 cursor-not-allowed border-white/5 text-slate-500'
                : 'border-white/10 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30'
          }`}
          title="Thumbs up — great answer"
        >
          <ThumbsUp className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => handleFeedback('down')}
          disabled={feedbackGiven !== null}
          className={`p-2 rounded-xl border transition-all ${
            feedbackGiven === 'down'
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : feedbackGiven !== null
                ? 'opacity-40 cursor-not-allowed border-white/5 text-slate-500'
                : 'border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30'
          }`}
          title="Thumbs down — needs improvement"
        >
          <ThumbsDown className="w-4 h-4" />
        </motion.button>
        {feedbackGiven && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-emerald-400 font-medium"
          >
            Thank you for your feedback!
          </motion.span>
        )}
      </div>

      {/* Synthesis Metadata & Grounding Bar */}
      <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Click any citation pill above to jump to its corresponding source passage below.</span>
        </div>

        {sources.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span>{sources.length} Sources Cited</span>
            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Model & Performance Metadata */}
      {metadata && (
        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1" title={`Confidence: ${metadata.confidence}`}>
            <Zap className={`w-3 h-3 ${confidenceColor}`} />
            <span className={confidenceColor}>{confidenceLabel}</span>
          </div>
          <div className="flex items-center gap-1" title={`Model: ${metadata.model_used}`}>
            <Cpu className="w-3 h-3" />
            <span>{metadata.model_used}</span>
          </div>
          {metadata.tokens_used > 0 && (
            <div className="flex items-center gap-1" title={`${metadata.tokens_used} tokens used`}>
              <span>{metadata.tokens_used.toLocaleString()} tokens</span>
            </div>
          )}
          {metadata.latency_ms > 0 && (
            <div className="flex items-center gap-1" title={`Response time: ${metadata.latency_ms}ms`}>
              <Clock className="w-3 h-3" />
              <span>{(metadata.latency_ms / 1000).toFixed(1)}s</span>
            </div>
          )}
          {metadata.response_style && (
            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-white/5">
              {metadata.response_style}
            </span>
          )}
        </div>
      )}

    </motion.section>
  );
};

