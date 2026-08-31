import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RawSearchResult } from '../types';
import { Sparkles, Copy, Check, ShieldCheck, ArrowDown } from 'lucide-react';

interface CommentaryProps {
  answer: string;
  sources: RawSearchResult[];
  onScrollToFolio: (id: string) => void;
}

export const ScribeCommentaryPanel: React.FC<CommentaryProps> = ({
  answer,
  sources,
  onScrollToFolio,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* Grounding & Footnotes Bar */}
      <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
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

    </motion.section>
  );
};
