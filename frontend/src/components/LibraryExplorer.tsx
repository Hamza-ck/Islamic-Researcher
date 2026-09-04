import React, { useState } from 'react';
import { 
  BookOpen, 
  Mic, 
  Search, 
  ExternalLink, 
  Sparkles, 
  ChevronRight, 
  BookMarked, 
  Clock
} from 'lucide-react';
import { HADITH_COLLECTIONS, SCHOLAR_LECTURES } from '../data/libraryCatalog';
import { SearchMode } from '../types';

interface LibraryExplorerProps {
  onStartResearch: (prompt: string, mode: SearchMode) => void;
  arabicFontSize: 'normal' | 'large' | 'huge';
}

export const LibraryExplorer: React.FC<LibraryExplorerProps> = ({
  onStartResearch,
  arabicFontSize,
}) => {
  const [activeTab, setActiveTab] = useState<'hadith' | 'scholars'>('hadith');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('bukhari');
  const [hadithSearchQuery, setHadithSearchQuery] = useState('');

  // Scholar Archive State
  const [selectedScholar, setSelectedScholar] = useState<string>('all');
  const [scholarSearchQuery, setScholarSearchQuery] = useState('');

  const currentCollection = HADITH_COLLECTIONS.find((c) => c.id === selectedCollectionId) || HADITH_COLLECTIONS[0];

  const filteredBooks = currentCollection.books.filter((b) => 
    b.nameEnglish.toLowerCase().includes(hadithSearchQuery.toLowerCase()) ||
    (b.nameArabic && b.nameArabic.includes(hadithSearchQuery)) ||
    (b.description && b.description.toLowerCase().includes(hadithSearchQuery.toLowerCase()))
  );

  const filteredLectures = SCHOLAR_LECTURES.filter((l) => {
    const matchesScholar = selectedScholar === 'all' || l.scholar.toLowerCase().includes(selectedScholar.toLowerCase());
    const matchesSearch = 
      l.title.toLowerCase().includes(scholarSearchQuery.toLowerCase()) ||
      l.transcriptExcerpt.toLowerCase().includes(scholarSearchQuery.toLowerCase()) ||
      l.topics.some(t => t.toLowerCase().includes(scholarSearchQuery.toLowerCase()));
    return matchesScholar && matchesSearch;
  });

  const fontSizeClass = 
    arabicFontSize === 'huge' ? 'text-2xl sm:text-3xl' :
    arabicFontSize === 'large' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Islamic Reference Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Canonical Hadith & Scholar Discourse Archives
          </h1>
          <p className="text-sm text-slate-400">
            Browse section-wise hadiths with chapter headings and explore digitized transcripts of Dr. Israr Ahmed & Sayyid Qutb.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="inline-flex rounded-2xl bg-[#1e1f20] p-1.5 border border-white/[0.08] shrink-0">
          <button
            onClick={() => setActiveTab('hadith')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'hadith'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Hadith Collections (Section-Wise)</span>
          </button>
          <button
            onClick={() => setActiveTab('scholars')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'scholars'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Scholar Lectures & Transcripts</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HADITH SECTION-WISE BROWSER */}
      {/* ========================================================================= */}
      {activeTab === 'hadith' && (
        <div className="space-y-6">
          {/* Collection Selector Pills */}
          <div className="flex flex-wrap gap-2.5">
            {HADITH_COLLECTIONS.map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  setSelectedCollectionId(col.id);
                }}
                className={`flex items-center gap-2.5 py-2 px-4 rounded-xl text-xs font-semibold border transition-all ${
                  selectedCollectionId === col.id
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-sm'
                    : 'bg-[#1e1f20] border-white/[0.08] text-slate-400 hover:text-white hover:bg-[#282a2c]'
                }`}
              >
                <span>{col.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-300">
                  {col.totalHadith.toLocaleString()}
                </span>
              </button>
            ))}
          </div>

          {/* Collection Header Card */}
          <div className="p-6 rounded-3xl bg-[#1e1f20] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {currentCollection.title}
                </h2>
                <span className="arabic-text text-xl font-medium text-amber-400/90">
                  {currentCollection.arabicTitle}
                </span>
              </div>
              <p className="text-xs text-blue-400 font-medium font-mono">
                {currentCollection.scholar}
              </p>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                {currentCollection.description}
              </p>
            </div>

            {/* Inquire on whole collection */}
            <button
              onClick={() => onStartResearch(`What are the key themes, structure, and foundational hadiths in ${currentCollection.title}?`, 'ask')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-xs font-semibold text-blue-300 shrink-0 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Research Collection with AI</span>
            </button>
          </div>

          {/* Book Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={hadithSearchQuery}
              onChange={(e) => setHadithSearchQuery(e.target.value)}
              placeholder={`Filter through ${currentCollection.books.length} books in ${currentCollection.title} (e.g. Revelation, Belief, Prayer)...`}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#1e1f20] border border-white/[0.08] focus:border-blue-500/50 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Section Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="group p-5 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-white/[0.08] hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-blue-400 font-bold">
                      Book {book.bookNumber}
                    </span>
                    {book.nameArabic && (
                      <span className="arabic-text text-sm text-amber-300/80 font-medium">
                        {book.nameArabic}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {book.nameEnglish}
                  </h3>

                  {book.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {book.hadithCount} Hadiths
                  </span>
                  <button
                    onClick={() => onStartResearch(`Show authentic hadiths and scholarly commentary from ${currentCollection.title}, Book ${book.bookNumber} (${book.nameEnglish})`, 'ask')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>Analyze Section</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCHOLAR LECTURES & TRANSCRIPTS ARCHIVE */}
      {/* ========================================================================= */}
      {activeTab === 'scholars' && (
        <div className="space-y-6">
          {/* Scholar Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Scholars' },
                { id: 'israr', label: 'Dr. Israr Ahmed' },
                { id: 'qutb', label: 'Sayyid Qutb' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScholar(s.id)}
                  className={`py-1.5 px-3.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedScholar === s.id
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm'
                      : 'bg-[#1e1f20] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={scholarSearchQuery}
                onChange={(e) => setScholarSearchQuery(e.target.value)}
                placeholder="Search lectures or topics..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1e1f20] border border-white/[0.08] focus:border-purple-500/50 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Scholar Bio Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/15 space-y-2">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Dr. Israr Ahmed (1932–2010)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Renowned Islamic philosopher and founder of Tanzeem-e-Islami. Famed for his rigorous, intellectual <em>Bayan-ul-Quran</em> audio-video exegesis, <em>Muntakhab Nisab</em>, and profound discourses on modern socio-political trials.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/15 space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Sayyid Qutb (1906–1966)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Influential 20th-century Quranic commentator. Author of the monumental <em>Fi Zilal al-Qur'an</em> (In the Shade of the Quran) and foundational studies on Islamic social justice, human liberation, and ethical governance.
              </p>
            </div>
          </div>

          {/* Lectures List */}
          <div className="space-y-4">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="p-6 rounded-3xl bg-[#1e1f20] border border-white/[0.08] hover:border-purple-500/30 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30">
                        {lecture.scholar}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {lecture.series}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {lecture.title}
                    </h3>
                  </div>

                  {lecture.duration && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{lecture.duration}</span>
                      {lecture.timestampAnchor && (
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] text-purple-400 font-mono font-bold">
                          @{lecture.timestampAnchor}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Arabic Script if associated with Surah */}
                {lecture.arabicText && (
                  <div className="p-4 rounded-2xl bg-[#151617] border border-white/[0.04]">
                    <p className={`arabic-text ${fontSizeClass} text-amber-300/90 font-medium`}>
                      {lecture.arabicText}
                    </p>
                  </div>
                )}

                {/* Transcript Excerpt */}
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.04]">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                    Transcript Discourse Excerpt
                  </span>
                  <p className="whitespace-pre-wrap">{lecture.transcriptExcerpt}</p>
                </div>

                {/* Topics & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {lecture.topics.map((top, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[11px] text-slate-400"
                      >
                        #{top}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {lecture.videoUrl && (
                      <a
                        href={lecture.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 transition-colors"
                      >
                        <span>Listen to Discourse</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => onStartResearch(`What did ${lecture.scholar} teach in "${lecture.title}" regarding: ${lecture.topics.join(', ')}? Cross-reference with authentic Quran and Hadiths.`, 'ask')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Research with AI</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
