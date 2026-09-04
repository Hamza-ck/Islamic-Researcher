import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RawSearchResult } from '../types';
import { ScholarGradeBadge } from './ScholarGradeBadge';
import { CitationExportModal } from './CitationExportModal';
import { Copy, Check, Quote, BookOpen, Scroll, Bookmark, Mic } from 'lucide-react';

interface FolioCardProps {
  folio: RawSearchResult;
  index: number;
  arabicFontSize?: 'normal' | 'large' | 'huge';
  isHighlighted?: boolean;
}

export const FolioCard: React.FC<FolioCardProps> = ({
  folio,
  index,
  arabicFontSize = 'normal',
  isHighlighted = false,
}) => {
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [copiedArabic, setCopiedArabic] = useState(false);
  const [copiedEnglish, setCopiedEnglish] = useState(false);

  const meta = folio.metadata;
  const isQuran = folio.type === 'quran';
  const isHadith = folio.type === 'hadith';

  const handleCopyArabic = () => {
    if (!folio.arabic) return;
    navigator.clipboard.writeText(folio.arabic);
    setCopiedArabic(true);
    setTimeout(() => setCopiedArabic(false), 2000);
  };

  const handleCopyEnglish = () => {
    navigator.clipboard.writeText(`${folio.text} - [${folio.citation}]`);
    setCopiedEnglish(true);
    setTimeout(() => setCopiedEnglish(false), 2000);
  };

  // Font size classes for Arabic script
  const getArabicSizeClass = () => {
    switch (arabicFontSize) {
      case 'large':
        return 'text-2xl sm:text-3xl leading-[2.3]';
      case 'huge':
        return 'text-3xl sm:text-4xl leading-[2.5]';
      case 'normal':
      default:
        return 'text-xl sm:text-2xl leading-[2.1]';
    }
  };

  // Type badge styling
  const getTypeBadge = () => {
    if (folio.type === 'lecture_transcript') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Mic className="w-3.5 h-3.5" />
          <span>Lecture Discourse</span>
        </span>
      );
    }
    if (isQuran) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Quran Verse</span>
        </span>
      );
    }
    if (isHadith) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Scroll className="w-3.5 h-3.5" />
          <span>Hadith Narration</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Bookmark className="w-3.5 h-3.5" />
        <span>Tafsir Commentary</span>
      </span>
    );
  };

  return (
    <>
      <motion.article
        id={`folio-${folio.id}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        className={`group relative glass-card rounded-2xl border transition-all duration-300 overflow-hidden shadow-xl ${
          isHighlighted
            ? 'border-emerald-400/80 shadow-glow-emerald ring-2 ring-emerald-500/20 bg-slate-900/90'
            : 'border-white/[0.08] hover:border-emerald-500/30 hover:shadow-2xl hover:bg-slate-900/80'
        }`}
      >
        <div className="flex flex-col md:flex-row">
          
          {/* LEFT METADATA & CITATION SIDEBAR */}
          <div className="w-full md:w-64 md:min-w-[16rem] p-5 bg-slate-900/40 border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-col justify-between space-y-4">
            
            <div className="space-y-3">
              {/* Type and Passage Number */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 font-medium">
                  #{index + 1}
                </span>
                {getTypeBadge()}
              </div>

              {/* Source Reference Header */}
              <div>
                <h4 className="text-sm font-bold text-slate-100 tracking-tight leading-snug break-words group-hover:text-emerald-300 transition-colors">
                  {folio.citation}
                </h4>
                {meta.chapter && (
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {meta.chapter}
                  </p>
                )}
                {meta.author && (
                  <p className="mt-0.5 text-xs text-amber-300/80 font-medium">
                    By {meta.author}
                  </p>
                )}
              </div>

              {/* Hadith Authenticity Grade */}
              {isHadith && (
                <div className="pt-1">
                  <div className="text-[11px] font-medium text-slate-400 mb-1.5">
                    Authenticity Grade:
                  </div>
                  <ScholarGradeBadge
                    gradeCategory={meta.grade_category}
                    grades={meta.grades}
                  />
                </div>
              )}

              {/* Match Relevance Score */}
              {folio.score !== undefined && (
                <div className="pt-1 flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Relevance: {(folio.score * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setShowCitationModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
                title="View academic citations (Chicago, MLA, BibTeX)"
              >
                <Quote className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cite</span>
              </button>

              <button
                type="button"
                onClick={handleCopyEnglish}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all"
                title="Copy Translation & Citation"
              >
                {copiedEnglish ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT PRIMARY CONTENT AREA */}
          <div className="flex-1 p-5 sm:p-6 space-y-4">
            
            {/* Arabic Script Matn */}
            {folio.arabic && (
              <div className="relative p-5 rounded-2xl bg-[#04060b]/60 border border-white/[0.06] shadow-inner group-hover:border-emerald-500/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-mono text-slate-400">Arabic Text</span>
                  <button
                    type="button"
                    onClick={handleCopyArabic}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-200 transition-colors text-xs flex items-center gap-1"
                    title="Copy Arabic text"
                  >
                    {copiedArabic ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p 
                  className={`arabic-text text-amber-100/95 font-medium ${getArabicSizeClass()}`}
                  lang="ar"
                >
                  {folio.arabic}
                </p>
              </div>
            )}

            {/* Translation / Excerpt */}
            <div className="space-y-2">
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
                {folio.text}
              </p>
            </div>

            {/* Metadata Badges Footer */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-t border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-3">
                {meta.edition && (
                  <span>Translation: <strong className="text-slate-300 font-medium">{meta.edition}</strong></span>
                )}
                {(meta.collection_title || meta.collection_name) && (
                  <span>Collection: <strong className="text-slate-300 font-medium">{meta.collection_title || meta.collection_name}</strong></span>
                )}
                {(meta.book ?? meta.book_number) !== undefined && (
                  <span>Book: {meta.book ?? meta.book_number}</span>
                )}
                {(meta.hadithnumber ?? meta.hadith_number) !== undefined && (
                  <span>Hadith: {meta.hadithnumber ?? meta.hadith_number}</span>
                )}
              </div>

              {meta.tafsir_name && (
                <span className="text-amber-300/90 font-medium">
                  {meta.tafsir_name}
                </span>
              )}
            </div>

          </div>

        </div>
      </motion.article>

      {/* Citation Export Modal */}
      {showCitationModal && (
        <CitationExportModal
          folio={folio}
          onClose={() => setShowCitationModal(false)}
        />
      )}
    </>
  );
};
