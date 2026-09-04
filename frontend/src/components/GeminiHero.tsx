import React from 'react';
import { Sparkles, BookOpen, Mic, Compass, ShieldCheck } from 'lucide-react';
import { SearchMode } from '../types';

interface GeminiHeroProps {
  onSelectPrompt: (prompt: string, mode: SearchMode) => void;
}

export const GeminiHero: React.FC<GeminiHeroProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      title: 'Dr. Israr Ahmed on Surah Al-Asr',
      subtitle: 'The 4 conditions for salvation & modern socio-political trials',
      prompt: 'What did Dr. Israr Ahmed emphasize in his Bayan-ul-Quran regarding the four conditions of salvation in Surah Al-Asr?',
      icon: <Mic className="w-5 h-5 text-purple-400" />,
      mode: 'ask' as SearchMode,
      badge: 'Lecture Transcript'
    },
    {
      title: 'Sayyid Qutb: Social Justice in Islam',
      subtitle: 'Stewardship of wealth, prohibition of usury, and human dignity',
      prompt: 'Explain Sayyid Qutb\'s perspective on social justice, distribution of wealth, and prohibition of exploitation in Islam.',
      icon: <BookOpen className="w-5 h-5 text-blue-400" />,
      mode: 'ask' as SearchMode,
      badge: 'Scholar Treatise'
    },
    {
      title: 'Authentic Hadiths on Purity of Intention (Ikhlas)',
      subtitle: 'Narrations from Sahih al-Bukhari & Sahih Muslim on sincerity',
      prompt: 'Find authentic hadiths on sincerity (Ikhlas) and the significance of intentions in actions.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      mode: 'ask' as SearchMode,
      badge: 'Sahih Hadith'
    },
    {
      title: 'Patience & Divine Wisdom in Trials',
      subtitle: 'Quranic verses and classical commentary on Sabr during hardship',
      prompt: 'patience during hardship and divine decree',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
      mode: 'ask' as SearchMode,
      badge: 'Quran & Tafsir'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-10">
      {/* Radiant Greeting Banner */}
      <div className="space-y-3 text-left sm:text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-slate-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Multilingual Grounded Islamic AI Research</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="gemini-gradient-text">Hello, Researcher</span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl sm:mx-auto font-normal">
          Inquire across verified Scripture, canonical Hadith collections, classical Tafsir, and contemporary scholar lecture archives.
        </p>
      </div>

      {/* Suggested Prompt Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt, item.mode)}
            className="group p-5 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-white/[0.08] hover:border-blue-500/30 text-left transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] group-hover:bg-white/[0.08] transition-colors">
                  {item.icon}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-semibold">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {item.subtitle}
              </p>
            </div>

            <div className="text-[11px] text-blue-400/80 group-hover:text-blue-400 font-medium flex items-center gap-1">
              <span>Start Research inquiry</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
