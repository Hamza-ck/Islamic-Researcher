import { LibraryCollection, ScholarLecture } from '../types';

export const HADITH_COLLECTIONS: LibraryCollection[] = [
  {
    id: 'bukhari',
    title: 'Sahih al-Bukhari',
    arabicTitle: 'صحيح البخاري',
    scholar: 'Imam Muhammad al-Bukhari (194–256 AH)',
    totalHadith: 7563,
    description: 'Universally recognized as the most authentic collection of Prophetic traditions (Sunnah) after the Holy Quran.',
    books: [
      { id: 'bukhari-1', bookNumber: 1, nameArabic: 'بدء الوحي', nameEnglish: 'Revelation', hadithCount: 7, description: 'How divine inspiration began descending upon the Messenger of Allah (pbuh).' },
      { id: 'bukhari-2', bookNumber: 2, nameArabic: 'الإيمان', nameEnglish: 'Belief (Iman)', hadithCount: 51, description: 'The pillars of faith, speech of the tongue, actions of the limbs, and increase of belief.' },
      { id: 'bukhari-3', bookNumber: 3, nameArabic: 'العلم', nameEnglish: 'Knowledge', hadithCount: 77, description: 'The virtues of seeking sacred knowledge, teaching others, and verifying truth.' },
      { id: 'bukhari-4', bookNumber: 4, nameArabic: 'الوضوء', nameEnglish: 'Ablution (Wudu)', hadithCount: 112, description: 'Purification requirements, acts of the Sunnah, and cleanliness etiquette.' },
      { id: 'bukhari-8', bookNumber: 8, nameArabic: 'الصلاة', nameEnglish: 'Prayers (Salat)', hadithCount: 289, description: 'The second pillar of Islam: times, conditions, bowings, and spiritual prostrations.' },
      { id: 'bukhari-24', bookNumber: 24, nameArabic: 'الزكاة', nameEnglish: 'Obligatory Charity (Zakat)', hadithCount: 104, description: 'Purifying wealth, distribution to the needy, and prohibition of hoarding.' },
      { id: 'bukhari-31', bookNumber: 31, nameArabic: 'الصوم', nameEnglish: 'Fasting (Sawm)', hadithCount: 88, description: 'Observing Ramadan, night prayers, Laylat al-Qadr, and fasting etiquette.' },
      { id: 'bukhari-34', bookNumber: 34, nameArabic: 'البيوع', nameEnglish: 'Sales & Transactions', hadithCount: 173, description: 'Islamic economic ethics, honesty in contracts, and prohibition of interest (Riba).' },
      { id: 'bukhari-56', bookNumber: 56, nameArabic: 'الجهاد والسير', nameEnglish: 'Jihad & Expeditions', hadithCount: 275, description: 'Virtues of striving in the way of Allah and ethical rules of engagement.' },
      { id: 'bukhari-65', bookNumber: 65, nameArabic: 'التفسير', nameEnglish: 'Prophetic Quranic Exegesis', hadithCount: 494, description: 'Direct explanations of Quranic verses transmitted from the Prophet (pbuh).' },
      { id: 'bukhari-67', bookNumber: 67, nameArabic: 'النكاح', nameEnglish: 'Wedlock & Marriage', hadithCount: 133, description: 'Rights of spouses, marriage contracts, and family sanctity in Islam.' },
      { id: 'bukhari-78', bookNumber: 78, nameArabic: 'الأدب', nameEnglish: 'Good Manners & Etiquette', hadithCount: 236, description: 'Kindness to parents, maintaining family ties, truthfulness, and humility.' },
      { id: 'bukhari-81', bookNumber: 81, nameArabic: 'الرقاق', nameEnglish: 'Heart-Softening Traditions (Ar-Riqaq)', hadithCount: 168, description: 'Transcending worldly attachments, contemplating mortality, and preparing for the Hereafter.' },
      { id: 'bukhari-96', bookNumber: 96, nameArabic: 'الاعتصام بالكتاب والسنة', nameEnglish: 'Holding Fast to Quran & Sunnah', hadithCount: 97, description: 'Preserving orthodoxy, rejecting unlawful innovations, and adhering to divine guidance.' },
      { id: 'bukhari-97', bookNumber: 97, nameArabic: 'التوحيد', nameEnglish: 'Oneness of Allah (Tawheed)', hadithCount: 191, description: 'Divine attributes, absolute transcendence, and the cornerstone of monotheism.' },
    ]
  },
  {
    id: 'muslim',
    title: 'Sahih Muslim',
    arabicTitle: 'صحيح مسلم',
    scholar: 'Imam Muslim ibn al-Hajjaj (204–261 AH)',
    totalHadith: 7500,
    description: 'Renowned for rigorous thematic organization, exact chain-of-narration preservation, and zero variant ambiguity.',
    books: [
      { id: 'muslim-1', bookNumber: 1, nameArabic: 'كتاب الإيمان', nameEnglish: 'The Book of Faith', hadithCount: 434, description: 'The famous Hadith of Jibril defining Islam, Iman, and Ihsan, and trials of the end times.' },
      { id: 'muslim-2', bookNumber: 2, nameArabic: 'كتاب الطهارة', nameEnglish: 'The Book of Purification', hadithCount: 135, description: 'Physical and spiritual purity as half of faith.' },
      { id: 'muslim-4', bookNumber: 4, nameArabic: 'كتاب الصلاة', nameEnglish: 'The Book of Prayer', hadithCount: 780, description: 'Establishing presence of heart, congregation, and prostrations.' },
      { id: 'muslim-12', bookNumber: 12, nameArabic: 'كتاب الزكاة', nameEnglish: 'The Book of Zakat', hadithCount: 215, description: 'Purification of capital, charity in secret, and avoiding showing off.' },
      { id: 'muslim-13', bookNumber: 13, nameArabic: 'كتاب الصيام', nameEnglish: 'The Book of Fasting', hadithCount: 300, description: 'Spiritual shield, moon sighting, and fasting six days of Shawwal.' },
      { id: 'muslim-33', bookNumber: 33, nameArabic: 'كتاب الإمارة', nameEnglish: 'The Book of Leadership & Governance', hadithCount: 260, description: 'Accountability of leaders, justice, and obedience in righteous matters.' },
      { id: 'muslim-35', bookNumber: 35, nameArabic: 'كتاب الذكر والدعاء والتوبة', nameEnglish: 'Supplication, Dhikr & Repentance', hadithCount: 180, description: 'The vastness of divine mercy, morning/evening invocations, and Istighfar.' },
      { id: 'muslim-45', bookNumber: 45, nameArabic: 'كتاب البر والصلة والآداب', nameEnglish: 'Virtue, Ties & Good Character', hadithCount: 210, description: 'Prohibition of enmity, backbiting, and the believer as a mirror to another believer.' },
    ]
  },
  {
    id: 'tirmidhi',
    title: "Jami' at-Tirmidhi",
    arabicTitle: 'جامع الترمذي',
    scholar: 'Imam Abu Isa Muhammad at-Tirmidhi (209–279 AH)',
    totalHadith: 3956,
    description: 'Unique among the Six Books for grading hadiths directly (Hasan, Sahih, Gharib) and detailing legal differences among jurists.',
    books: [
      { id: 'tirmidhi-1', bookNumber: 1, nameArabic: 'أبواب الطهارة', nameEnglish: 'Purification', hadithCount: 148, description: 'Essential hygienic practices and ritual cleansing.' },
      { id: 'tirmidhi-2', bookNumber: 2, nameArabic: 'أبواب الصلاة', nameEnglish: 'Prayer', hadithCount: 300, description: 'Congregational prayers, voluntary Sunan, and Qiyam al-Layl.' },
      { id: 'tirmidhi-14', bookNumber: 14, nameArabic: 'أبواب السير', nameEnglish: 'Prophetic Expeditions', hadithCount: 120, description: 'Historical military conduct and treaties.' },
      { id: 'tirmidhi-36', bookNumber: 36, nameArabic: 'أبواب صفة القيامة والرقائق', nameEnglish: 'Day of Judgment & Softening of Hearts', hadithCount: 180, description: 'Graphic accounts of the resurrection, the balance (Mizan), and paradise.' },
      { id: 'tirmidhi-45', bookNumber: 45, nameArabic: 'أبواب الدعوات', nameEnglish: 'Supplications', hadithCount: 230, description: 'Prophetic prayers for anxiety, illness, protection, and gratitude.' },
    ]
  },
  {
    id: 'abudawud',
    title: 'Sunan Abu Dawud',
    arabicTitle: 'سنن أبي داود',
    scholar: 'Imam Abu Dawud Sulayman ibn al-Ashath (202–275 AH)',
    totalHadith: 5274,
    description: 'Dedicated specifically to Ahkam (legal rulings, jurisprudence, and civic laws) extracted from the Sunnah.',
    books: [
      { id: 'abudawud-1', bookNumber: 1, nameArabic: 'كتاب الطهارة', nameEnglish: 'Purification', hadithCount: 390, description: 'Water purification and ceremonial cleanliness.' },
      { id: 'abudawud-2', bookNumber: 2, nameArabic: 'كتاب الصلاة', nameEnglish: 'Prayer', hadithCount: 750, description: 'Detailed rulings on prayer postures, timings, and exceptions.' },
      { id: 'abudawud-25', bookNumber: 25, nameArabic: 'كتاب القضاء', nameEnglish: 'Judicial Rulings & Justice', hadithCount: 85, description: 'Ethics of judges, evidentiary standards, and judicial impartiality.' },
      { id: 'abudawud-36', bookNumber: 36, nameArabic: 'كتاب الملاحم', nameEnglish: 'Tribulations & End-Time Portents', hadithCount: 70, description: 'Trials before the Day of Resurrection and spiritual steadfastness.' },
    ]
  }
];

export const SCHOLAR_LECTURES: ScholarLecture[] = [
  {
    id: 'israr-asr-01',
    scholar: 'Dr. Israr Ahmed',
    series: 'Bayan-ul-Quran / Muntakhab Nisab',
    title: 'Surah Al-Asr: The Charter of Salvation & Islamic Renaissance',
    surah: 103,
    ruku: 1,
    duration: '48 min',
    videoUrl: 'https://www.youtube.com/results?search_query=Dr+Israr+Ahmed+Surah+Asr',
    timestampAnchor: '12:45',
    topics: ['Four Conditions of Salvation', 'Patience (Sabr)', 'Truth (Haqq)', 'Decline of the Ummah'],
    arabicText: 'وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ۝ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
    transcriptExcerpt: `Imam ash-Shafi'i famously remarked: 'If people were to ponder over this surah alone, it would suffice them for their guidance.' 
Why? Because Allah swears by Time itself. The entire human race is structurally plunging into ultimate loss (Khusr), with only four exceptions: 
First, authentic Iman that permeates intellect and emotion. 
Second, righteous deeds (Amal-e-Saleh) that transform personal conduct. 
Third, mutual exhortation to Truth (Tawasau bil-Haqq) — which means standing up for social, political, and moral justice without compromise. 
Fourth, mutual exhortation to Patience and Steadfastness (Tawasau bis-Sabr) — because when you stand for truth in a corrupted society, opposition is guaranteed.`
  },
  {
    id: 'israr-baqarah-khilafah',
    scholar: 'Dr. Israr Ahmed',
    series: 'Bayan-ul-Quran',
    title: 'Surah Al-Baqarah (Ayah 30): The Vicegerency of Man (Khilafah)',
    surah: 2,
    ruku: 4,
    duration: '54 min',
    videoUrl: 'https://www.youtube.com/results?search_query=Dr+Israr+Ahmed+Surah+Baqarah+Ayah+30+Khilafah',
    timestampAnchor: '18:20',
    topics: ['Khilafah', 'Angels Dialogue', 'Purpose of Creation', 'Governance'],
    arabicText: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً',
    transcriptExcerpt: `When Allah said to the angels: 'Indeed, I am making upon the earth a Khalifa (vicegerent)', this establishes the core political theology of Islam. 
Man is not an accidental biological byproduct; man is entrusted with Amanah (the Divine Trust) to establish Allah's sovereignty on earth. 
Sovereignty (Hakimiyyah) belongs exclusively to Allah; human beings are merely delegated trustees. When humans usurp absolute sovereignty to dictate laws that contradict divine morality, tyranny and decay inevitably ensue.`
  },
  {
    id: 'israr-kahf-dajjal',
    scholar: 'Dr. Israr Ahmed',
    series: 'Thematic Lectures',
    title: 'Surah Al-Kahf & The Four Trials of Modern Civilization',
    surah: 18,
    ruku: 1,
    duration: '62 min',
    videoUrl: 'https://www.youtube.com/results?search_query=Dr+Israr+Ahmed+Surah+Kahf+Dajjal',
    timestampAnchor: '24:10',
    topics: ['Modern Materialism', 'Dajjal', 'Surah Al-Kahf', 'Scientism'],
    arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا',
    transcriptExcerpt: `The Prophet (pbuh) instructed us to recite Surah Al-Kahf every Friday specifically as a protective fortress against the Fitnah of Dajjal. 
Why? Because the four stories in Al-Kahf mirror the four deceptive illusions of contemporary civilization: 
1. The trial of Faith (the Youth in the Cave resisting state persecution). 
2. The trial of Wealth (the owner of the two gardens seduced by capitalist arrogance). 
3. The trial of Intellect and Empirical Knowledge (Musa and Khidr demonstrating that empirical perception misses transcendent reality). 
4. The trial of Political Power (Dhul-Qarnayn exercising authority in complete submission to divine justice).`
  },
  {
    id: 'qutb-zilal-baqarah',
    scholar: 'Sayyid Qutb',
    series: 'Fi Zilal al-Qur’an (In the Shade of the Quran)',
    title: 'The Essence of Divine Legislation & Freedom from Human Servitude',
    surah: 2,
    ruku: 23,
    duration: 'Textual Treatise',
    topics: ['Hakimiyyah', 'Tafsir Fi Zilal', 'Liberation of Humanity', 'Social Justice'],
    arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ',
    transcriptExcerpt: `Islam came to liberate humanity from the servitude of man to man, elevating them to the servitude of Allah alone. 
In the shade of the Qur'an, worship ('Ibadah) is not merely ritual prayers or secluded contemplation. True worship encompasses submitting the entirety of one's legal, moral, economic, and political systems to the Creator. 
When a community allows human rulers or elite oligarchies to define ultimate good and evil independent of revelation, they have in essence established false deities (Arbab) beside Allah.`
  },
  {
    id: 'qutb-social-justice',
    scholar: 'Sayyid Qutb',
    series: 'Social Justice in Islam',
    title: 'Economic Equilibrium and the Sacred Limits on Wealth Accumulation',
    duration: 'Textual Treatise',
    topics: ['Islamic Economics', 'Social Justice', 'Prohibition of Riba', 'Zakat Mechanism'],
    transcriptExcerpt: `The fundamental difference between Islamic economics and western capitalism or communism lies in the concept of ownership. 
In Islam, absolute ownership belongs to Allah alone. The individual is a steward, not an absolute proprietor. 
Therefore, private property is protected, but strictly bounded by ethical constraints: Riba (usury) is outlawed, hoarding (Iktinaz) is condemned, and wealth must continuously circulate so that it does not become a monopoly among the rich (Kay la yakuna dulatan bayn al-agniya' minkum). 
Social justice in Islam is rooted in spiritual conscience rather than Marxist class warfare.`
  },
  {
    id: 'israr-ramadan-quran',
    scholar: 'Dr. Israr Ahmed',
    series: 'Muntakhab Nisab',
    title: 'Ramadan, Tahajjud & The Living Connection with the Quran',
    surah: 2,
    ruku: 23,
    duration: '45 min',
    videoUrl: 'https://www.youtube.com/results?search_query=Dr+Israr+Ahmed+Ramadan+Tahajjud+Quran',
    timestampAnchor: '08:15',
    topics: ['Ramadan', 'Qiyam al-Layl', 'Spiritual Elevation', 'Quran Recitation'],
    arabicText: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ',
    transcriptExcerpt: `Ramadan is not merely a month of physical abstinence from food and drink; Ramadan is the festival of the Quran. 
The purpose of fasting (Taqwa) is to sensitize the human heart so that when you stand in Qiyam al-Layl (the night prayer) and listen to the recitation of the divine discourse, your heart vibrates in resonance with the speech of Allah. 
If our connection with the Quran remains restricted to dry theoretical study without the tears and contemplation of Tahajjud, our faith remains incomplete.`
  }
];
