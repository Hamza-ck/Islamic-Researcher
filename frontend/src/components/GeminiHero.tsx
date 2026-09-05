import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Mic, Compass, ShieldCheck, Globe } from 'lucide-react';
import { SearchMode } from '../types';

interface GeminiHeroProps {
  onSelectPrompt: (prompt: string, mode: SearchMode) => void;
}

interface SupportingLanguage {
  id: 'en' | 'ar' | 'ur' | 'hi';
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  text: string;
}

const SUPPORTING_LANGUAGES: SupportingLanguage[] = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    text: 'Dalil Research helps you explore the Qur’an, Hadith, Tafsir, and scholarly sources through evidence-based research — with transparent citations, source comparison, and intelligent verification.',
  },
  {
    id: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    text: 'دليل للأبحاث يساعدك على استكشاف القرآن الكريم والحديث النبوي والتفسير والمصادر العلمية عبر أبحاث موثوقة بالأدلة — مع توثيق شفاف ومقارنة المصادر والتحقق الذكي.',
  },
  {
    id: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    dir: 'rtl',
    text: 'دلیل ریسرچ آپ کو مستند شواہد، شفاف حوالہ جات اور تفصیلی تحقیق کے ساتھ قرآن، حدیث، تفسیر اور کتبِ علم کی تلاش میں رہنمائی کرتا ہے۔',
  },
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    dir: 'ltr',
    text: 'दलील रिसर्च आपको प्रामाणिक साक्ष्य, पारदर्शी संदर्भों और स्रोत तुलना के साथ क़ुरआन, हदीस और तफ़सीर का साक्ष्य-आधारित अध्ययन करने में सक्षम बनाता है।',
  },
];

export const GeminiHero: React.FC<GeminiHeroProps> = ({ onSelectPrompt }) => {
  const [activeLangIndex, setActiveLangIndex] = useState<number>(0);
  const [isManual, setIsManual] = useState<boolean>(false);

  // Auto-rotate dynamic languages every 6 seconds unless user manually selects
  useEffect(() => {
    if (isManual) return;
    const interval = setInterval(() => {
      setActiveLangIndex((prev) => (prev + 1) % SUPPORTING_LANGUAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isManual]);

  const currentLang = SUPPORTING_LANGUAGES[activeLangIndex];

  const suggestions = [
    {
      title: 'Islamic Finance & Commercial System',
      subtitle: 'Principles of mutual consent, prohibition of usury/riba, and documentation',
      prompt: 'how Islamic Finance Systems works?',
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      mode: 'ask' as SearchMode,
      badge: 'Fiqh & Finance',
    },
    {
      title: 'Dr. Israr Ahmed on Surah Al-Asr',
      subtitle: 'The 4 conditions for salvation & modern socio-political trials',
      prompt: 'What did Dr. Israr Ahmed emphasize in his Bayan-ul-Quran regarding the four conditions of salvation in Surah Al-Asr?',
      icon: <Mic className="w-5 h-5 text-purple-400" />,
      mode: 'ask' as SearchMode,
      badge: 'Lecture Transcript',
    },
    {
      title: 'Authentic Hadiths on Purity of Intention (Ikhlas)',
      subtitle: 'Narrations from Sahih al-Bukhari & Sahih Muslim on sincerity',
      prompt: 'Find authentic hadiths on sincerity (Ikhlas) and the significance of intentions in actions.',
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      mode: 'ask' as SearchMode,
      badge: 'Sahih Hadith',
    },
    {
      title: 'Patience & Divine Wisdom in Hardship',
      subtitle: 'Quranic verses and classical commentary on Sabr during trials',
      prompt: 'patience during hardship and divine decree',
      icon: <BookOpen className="w-5 h-5 text-amber-400" />,
      mode: 'ask' as SearchMode,
      badge: 'Quran & Tafsir',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      {/* 1. HERO BRANDING & GREETING */}
      <div className="space-y-4 text-left sm:text-center">
        {/* LOGO TEXTOLOGY BADGE */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#181a1d] border border-emerald-500/25 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-xs font-extrabold tracking-wider text-white uppercase">
            DALIL RESEARCH
          </span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-emerald-400/90 font-medium tracking-wide">
            Search. Verify. Understand.
          </span>
        </div>

        {/* HERO HEADING */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            Find the Evidence.
          </span>{' '}
          <span className="text-white">Understand the Path.</span>
        </h1>

        {/* DYNAMIC MULTILINGUAL SUPPORTING TEXT */}
        <div className="max-w-3xl sm:mx-auto space-y-3 pt-1">
          {/* Active Dynamic Text with Smooth Transition */}
          <div
            key={currentLang.id}
            dir={currentLang.dir}
            className={`min-h-[4.5rem] flex items-center justify-center p-4 rounded-2xl bg-[#1e1f20]/60 border border-white/[0.06] backdrop-blur-sm transition-all duration-300 ${
              currentLang.dir === 'rtl' ? 'font-serif text-lg leading-[1.8]' : 'text-sm sm:text-base leading-relaxed'
            } text-slate-300`}
          >
            <p className="max-w-2xl text-center">{currentLang.text}</p>
          </div>

          {/* Dynamic Language Switcher Selector */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>Languages:</span>
            </span>
            {SUPPORTING_LANGUAGES.map((lang, idx) => (
              <button
                key={lang.id}
                onClick={() => {
                  setActiveLangIndex(idx);
                  setIsManual(true);
                }}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                  idx === activeLangIndex
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
                title={`Switch to ${lang.name}`}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SUGGESTED RESEARCH PROMPT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt, item.mode)}
            className="group p-5 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-white/[0.08] hover:border-emerald-500/30 text-left transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer"
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
              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {item.subtitle}
              </p>
            </div>

            <div className="text-[11px] text-emerald-400/80 group-hover:text-emerald-400 font-medium flex items-center gap-1">
              <span>Start Research inquiry</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
