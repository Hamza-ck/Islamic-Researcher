import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RawSearchResult } from '../types';
import { X, Check, Copy, BookOpen } from 'lucide-react';

interface CitationExportModalProps {
  folio: RawSearchResult;
  onClose: () => void;
}

export const CitationExportModal: React.FC<CitationExportModalProps> = ({ folio, onClose }) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Generate different formats
  const generateCitations = () => {
    const meta = folio.metadata;
    let traditional = folio.citation;
    let chicago = '';
    let mla = '';
    let bibtex = '';

    if (folio.type === 'quran') {
      const surahName = meta.surah_name || 'Al-Qur\'an';
      const surah = meta.surah || 1;
      const ayah = meta.ayah || 1;
      const trans = meta.edition || 'Abdullah Yusuf Ali Translation';
      
      traditional = `Quran ${surah}:${ayah} (${surahName}), trans. ${trans}.`;
      chicago = `The Holy Qur'an: Translation and Commentary. Translated by Abdullah Yusuf Ali. Surah ${surahName} (${surah}:${ayah}).`;
      mla = `The Holy Qur'an. Translated by Abdullah Yusuf Ali, Surah ${surahName}, ${surah}:${ayah}.`;
      bibtex = `@book{quran_${surah}_${ayah},\n  title={The Holy Qur'an},\n  author={Yusuf Ali, Abdullah},\n  note={Surah ${surahName} ${surah}:${ayah}}\n}`;
    } else if (folio.type === 'hadith') {
      const collName = meta.collection_name || 'Hadith Collection';
      const bookNum = meta.book_number || '';
      const hadithNum = meta.hadith_number || '';
      const chapter = meta.chapter || '';
      
      traditional = `${collName}, Book ${bookNum}${chapter ? ` (${chapter})` : ''}, Hadith ${hadithNum}.`;
      chicago = `Al-Bukhari, Muhammad ibn Ismail. ${collName}. Book ${bookNum}, Hadith ${hadithNum}.`;
      mla = `Al-Bukhari, Muhammad. "${chapter || 'Hadith'}." ${collName}, no. ${hadithNum}.`;
      bibtex = `@misc{hadith_${meta.collection || 'hadith'}_${hadithNum},\n  title={${collName}},\n  note={Book ${bookNum}, Hadith ${hadithNum}}\n}`;
    } else {
      const tafsir = meta.tafsir_name || 'Tafsir';
      const author = meta.author || 'Classical Scholar';
      traditional = `${author}, ${tafsir}, commentary on Surah ${meta.surah || ''}:${meta.ayah || ''}.`;
      chicago = `${author}. ${tafsir}. Cairo: Dar al-Hadith. Commentary on ${meta.surah || ''}:${meta.ayah || ''}.`;
      mla = `${author}. ${tafsir}. Commentary on Surah ${meta.surah || ''}:${meta.ayah || ''}.`;
      bibtex = `@book{tafsir_${meta.surah || 1},\n  author={${author}},\n  title={${tafsir}},\n  note={Surah ${meta.surah || ''}:${meta.ayah || ''}}\n}`;
    }

    return [
      { key: 'traditional', label: 'Standard Citation', text: traditional },
      { key: 'chicago', label: 'Chicago Style', text: chicago },
      { key: 'mla', label: 'MLA 9th Edition', text: mla },
      { key: 'bibtex', label: 'BibTeX Entry', text: bibtex },
    ];
  };

  const formats = generateCitations();

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(key);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl glass-panel border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Export Academic Citation
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/[0.06]">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Source Reference
              </span>
              <p className="text-sm font-bold text-white">{folio.citation}</p>
            </div>

            <div className="space-y-3">
              {formats.map((fmt) => (
                <div key={fmt.key} className="bg-slate-900/60 p-3.5 rounded-2xl border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{fmt.label}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(fmt.key, fmt.text)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 transition-all text-xs font-semibold"
                    >
                      {copiedFormat === fmt.key ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-950/80 rounded-xl border border-white/[0.04] font-mono text-xs text-slate-300 break-words whitespace-pre-wrap select-all">
                    {fmt.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.08] bg-slate-900/40 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
