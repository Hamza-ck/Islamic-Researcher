import { BookMarked, BookOpen, Scroll, Bookmark, ArrowRight } from 'lucide-react';
import { ResearchMode } from '../types';

interface CollectionsPanelProps {
  onStartResearch: (query: string, mode: ResearchMode) => void;
}

interface CuratedCollection {
  id: string;
  title: string;
  description: string;
  type: 'quran' | 'hadith' | 'tafsir' | 'scholars';
  count: string;
  recommendedQueries: string[];
}

const COLLECTIONS: CuratedCollection[] = [
  {
    id: 'quran-ethics',
    title: 'Quranic Morality & Ethics',
    description: 'Foundational Quranic guidance on patience (sabr), gratitude (shukr), justice, and upright character.',
    type: 'quran',
    count: '6,236 Ayahs',
    recommendedQueries: [
      'What does the Quran say about patience in hardship?',
      'Verses on justice and standing firm for truth',
      'Quranic verses on kindness to parents and orphans',
    ],
  },
  {
    id: 'bukhari-muslim',
    title: 'The Sahihayn: Bukhari & Muslim',
    description: 'Canonical traditions from Sahih al-Bukhari and Sahih Muslim with scholarly authentication.',
    type: 'hadith',
    count: '14,000+ Narrations',
    recommendedQueries: [
      'Actions are judged by intentions hadith commentary',
      'Hadith on the virtues of seeking knowledge',
      'Prophetic guidance on honesty in business',
    ],
  },
  {
    id: 'tafsir-classical',
    title: 'Classical Tafsir Exegesis',
    description: 'Exegesis and linguistic commentary by Ibn Kathir, Tabari, and classical mufassirun.',
    type: 'tafsir',
    count: 'Multi-volume',
    recommendedQueries: [
      'Tafsir of Surah Al-Baqarah verse 153',
      'Context and meaning of Ayat al-Kursi',
      'Ibn Kathir explanation of Surah Al-Asr',
    ],
  },
  {
    id: 'ikhtilaf-fiqh',
    title: 'Comparative Fiqh & Ikhtilaf',
    description: 'Scholarly disagreement and nuanced juristic rulings across the four classical madhhabs.',
    type: 'scholars',
    count: 'Jurists & Fatwas',
    recommendedQueries: [
      'Differences between Abu Hanifa and Shafi\'i on wudu',
      'Scholarly views on combining prayers when traveling',
      'Rules regarding zakat on modern currency and gold',
    ],
  },
];

export function CollectionsPanel({ onStartResearch }: CollectionsPanelProps) {
  const getIcon = (type: CuratedCollection['type']) => {
    switch (type) {
      case 'quran':
        return <BookOpen className="w-5 h-5 text-emerald-400" />;
      case 'hadith':
        return <Scroll className="w-5 h-5 text-sky-400" />;
      case 'tafsir':
        return <Bookmark className="w-5 h-5 text-amber-400" />;
      case 'scholars':
      default:
        return <BookMarked className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <BookMarked className="w-6 h-6 text-emerald-400" />
          Curated Research Collections
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Explore canonical Islamic sources, structured collections, and foundational thematic corpuses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {COLLECTIONS.map((c) => (
          <div
            key={c.id}
            className="glass-card rounded-2xl border border-white/10 bg-[#1e1f20]/80 p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  {getIcon(c.type)}
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                  {c.count}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">{c.title}</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{c.description}</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2">
              <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                Recommended Research Queries
              </span>
              <div className="space-y-1.5">
                {c.recommendedQueries.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onStartResearch(q, 'research')}
                    className="w-full text-left text-xs text-slate-300 hover:text-emerald-300 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-emerald-500/30 rounded-lg px-3 py-2 flex items-center justify-between group transition-all"
                  >
                    <span className="truncate pr-2">{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
