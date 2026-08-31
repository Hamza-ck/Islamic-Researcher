import { RawSearchResult } from '../types';

export const MOCK_CORPUS: RawSearchResult[] = [
  {
    id: "quran_2_155",
    type: "quran",
    citation: "Surah Al-Baqarah (2:155)",
    score: 0.942,
    arabic: "وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ",
    text: "Be sure We shall test you with something of fear and hunger, some loss in goods or lives or the fruits (of your toil), but give glad tidings to those who patiently persevere.",
    metadata: {
      surah: 2,
      ayah: 155,
      surah_name: "Al-Baqarah",
      edition: "Yusuf Ali",
      author: "Abdullah Yusuf Ali"
    }
  },
  {
    id: "quran_2_156",
    type: "quran",
    citation: "Surah Al-Baqarah (2:156-157)",
    score: 0.935,
    arabic: "الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ ۝ أُولَٰئِكَ عَلَيْهِمْ صَلَوَاتٌ مِّن رَّبِّهِمْ وَرَحْمَةٌ ۖ وَأُولَٰئِكَ هُمُ الْمُهْتَدُونَ",
    text: "Who say, when afflicted with calamity: 'To Allah We belong, and to Him is our return': They are those on whom (Descend) blessings from Allah, and Mercy, and they are the ones that receive guidance.",
    metadata: {
      surah: 2,
      ayah: 156,
      surah_name: "Al-Baqarah",
      edition: "Yusuf Ali",
      author: "Abdullah Yusuf Ali"
    }
  },
  {
    id: "hadith_bukhari_5641",
    type: "hadith",
    citation: "Ṣaḥīḥ al-Bukhārī 5641",
    score: 0.928,
    arabic: "مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلاَ وَصَبٍ وَلاَ هَمٍّ وَلاَ حُزْنٍ وَلاَ أَذًى وَلاَ غَمٍّ حَتَّى الشَّوْكَةِ يُشَاكُهَا، إِلاَّ كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ",
    text: "The Prophet (ﷺ) said, 'No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim, even if it were the prick he receives from a thorn, but that Allah expiates some of his sins for that.'",
    metadata: {
      collection: "bukhari",
      collection_name: "Ṣaḥīḥ al-Bukhārī",
      book_number: 75,
      hadith_number: 1,
      chapter: "Patients (Kitab Al-Marda)",
      grade_category: "sahih",
      grades: [
        { scholar: "Imam al-Bukhari", grade: "Ṣaḥīḥ (Muttafaq 'Alayh)" },
        { scholar: "Zubair Ali Zai", grade: "Ṣaḥīḥ" }
      ]
    }
  },
  {
    id: "hadith_muslim_2999",
    type: "hadith",
    citation: "Ṣaḥīḥ Muslim 2999",
    score: 0.915,
    arabic: "عَجَبًا لأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ وَلَيْسَ ذَاكَ لأَحَدٍ إِلاَّ لِلْمُؤْمِنِ إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ",
    text: "The Messenger of Allah (ﷺ) said: 'Strange are the ways of a believer for there is good in every affair of his and this is not the case with anyone else except in the case of a believer for if he has an occasion to feel delight, he thanks (Allah), thus there is a good for him in it, and if he gets into trouble and shows resignation (and endures it patiently), there is a good for him in it.'",
    metadata: {
      collection: "muslim",
      collection_name: "Ṣaḥīḥ Muslim",
      book_number: 55,
      hadith_number: 82,
      chapter: "The Book of Zuhd and Softening of Hearts",
      grade_category: "sahih",
      grades: [
        { scholar: "Imam Muslim", grade: "Ṣaḥīḥ" },
        { scholar: "Darussalam", grade: "Ṣaḥīḥ" }
      ]
    }
  },
  {
    id: "tafsir_ibnkathir_2_155",
    type: "tafsir",
    citation: "Tafsīr Ibn Kathīr (Surah 2:155)",
    score: 0.892,
    arabic: "يخبر تعالى أنه يبتلي عباده، أي يختبرهم ويمتحنهم... ثم بين من هم الصابرون الذين شكرهم، فقال: {الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ}",
    text: "Allah informs us that He tests His servants, meaning He tries and tests them sometimes with ease and sometimes with hardship... Then Allah states who the patient ones are who will be rewarded: those who, when afflicted with calamity, console themselves with Istirja' (saying Inna lillahi wa inna ilayhi raji'un), knowing that they belong to Allah and are returning to Him.",
    metadata: {
      surah: 2,
      ayah: 155,
      surah_name: "Al-Baqarah",
      tafsir_name: "Tafsīr Ibn Kathīr",
      author: "Ismail ibn Kathir (d. 774 AH)"
    }
  },
  {
    id: "hadith_bukhari_5971",
    type: "hadith",
    citation: "Ṣaḥīḥ al-Bukhārī 5971",
    score: 0.938,
    arabic: "جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ صلى الله عليه وسلم فَقَالَ يَا رَسُولَ اللَّهِ مَنْ أَحَقُّ النَّاسِ بِحُسْنِ صَحَابَتِي قَالَ ‏'‏ أُمُّكَ ‏'‏‏.‏ قَالَ ثُمَّ مَنْ قَالَ ‏'‏ ثُمَّ أُمُّكَ ‏'‏‏.‏ قَالَ ثُمَّ مَنْ قَالَ ‏'‏ ثُمَّ أُمُّكَ ‏'‏‏.‏ قَالَ ثُمَّ مَنْ قَالَ ‏'‏ ثُمَّ أَبُوكَ ‏'‏‏.‏",
    text: "A man came to Allah's Messenger (ﷺ) and said, 'O Allah's Messenger! Who is more entitled to be treated with the best companionship by me?' The Prophet (ﷺ) said, 'Your mother.' The man said. 'Who is next?' The Prophet said, 'Your mother.' The man further said, 'Who is next?' The Prophet said, 'Your mother.' The man asked for the fourth time, 'Who is next?' The Prophet said, 'Then your father.'",
    metadata: {
      collection: "bukhari",
      collection_name: "Ṣaḥīḥ al-Bukhārī",
      book_number: 78,
      hadith_number: 2,
      chapter: "Good Manners and Form (Al-Adab)",
      grade_category: "sahih",
      grades: [
        { scholar: "Imam al-Bukhari", grade: "Ṣaḥīḥ" },
        { scholar: "Imam Muslim", grade: "Ṣaḥīḥ (Muttafaq 'Alayh)" }
      ]
    }
  },
  {
    id: "quran_17_23",
    type: "quran",
    citation: "Surah Al-Isra (17:23-24)",
    score: 0.951,
    arabic: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا ۚ إِمَّا يَبْلُغَنَّ عِندَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُل لَّهُمَا أُفٍّ وَلَا تَنْهَرْهُمَا وَقُل لَّهُمَا قَوْلًا كَرِيمًا ۝ وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    text: "Thy Lord hath decreed that ye worship none but Him, and that ye be kind to parents. Whether one or both of them attain old age in thy life, say not to them a word of contempt, nor repel them, but address them in terms of honour. And, out of kindness, lower to them the wing of humility, and say: 'My Lord! bestow on them thy Mercy even as they cherished me in childhood.'",
    metadata: {
      surah: 17,
      ayah: 23,
      surah_name: "Al-Isra",
      edition: "Yusuf Ali",
      author: "Abdullah Yusuf Ali"
    }
  },
  {
    id: "hadith_tirmidhi_1909",
    type: "hadith",
    citation: "Jāmiʿ at-Tirmidhī 1909",
    score: 0.884,
    arabic: "رِضَا الرَّبِّ فِي رِضَا الْوَالِدِ وَسَخَطُ الرَّبِّ فِي سَخَطِ الْوَالِدِ",
    text: "The Messenger of Allah (ﷺ) said: 'The Lord's pleasure is in the parent's pleasure, and the Lord's anger is in the parent's anger.'",
    metadata: {
      collection: "tirmidhi",
      collection_name: "Jāmiʿ at-Tirmidhī",
      book_number: 27,
      hadith_number: 15,
      chapter: "Chapters on Righteousness and Maintaining Good Ties",
      grade_category: "hasan",
      grades: [
        { scholar: "Imam at-Tirmidhi", grade: "Ḥasan Ghareeb" },
        { scholar: "Al-Albani", grade: "Ḥasan (Ṣaḥīḥ Mawqūf)" },
        { scholar: "Darussalam", grade: "Ḥasan" }
      ]
    }
  },
  {
    id: "quran_97_1",
    type: "quran",
    citation: "Surah Al-Qadr (97:1-5)",
    score: 0.965,
    arabic: "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ ۝ وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ ۝ لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ ۝ تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ ۝ سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ",
    text: "We have indeed revealed this (Message) in the Night of Power: And what will explain to thee what the Night of Power is? The Night of Power is better than a thousand months. Therein come down the angels and the Spirit by Allah's permission, on every errand: Peace!... This until the rise of morn!",
    metadata: {
      surah: 97,
      ayah: 1,
      surah_name: "Al-Qadr",
      edition: "Yusuf Ali",
      author: "Abdullah Yusuf Ali"
    }
  },
  {
    id: "hadith_bukhari_6014",
    type: "hadith",
    citation: "Ṣaḥīḥ al-Bukhārī 6014",
    score: 0.912,
    arabic: "مَا زَالَ جِبْرِيلُ يُوصِينِي بِالْجَارِ حَتَّى ظَنَنْتُ أَنَّهُ سَيُوَرِّثُهُ",
    text: "The Prophet (ﷺ) said, 'Gabriel continued to recommend me about treating the neighbor with kindness and politeness so much so that I thought he would order (me) to make them an heir.'",
    metadata: {
      collection: "bukhari",
      collection_name: "Ṣaḥīḥ al-Bukhārī",
      book_number: 78,
      hadith_number: 44,
      chapter: "Good Manners and Form (Al-Adab)",
      grade_category: "sahih",
      grades: [
        { scholar: "Imam al-Bukhari", grade: "Ṣaḥīḥ" },
        { scholar: "Imam Muslim", grade: "Ṣaḥīḥ" }
      ]
    }
  },
  {
    id: "hadith_abudawud_5129",
    type: "hadith",
    citation: "Sunan Abī Dāwūd 5129",
    score: 0.825,
    arabic: "إِنَّ الدَّالَّ عَلَى الْخَيْرِ كَفَاعِلِهِ",
    text: "The Prophet (ﷺ) said: 'The one who guides to something good has a reward similar to the one who does it.'",
    metadata: {
      collection: "abudawud",
      collection_name: "Sunan Abī Dāwūd",
      book_number: 43,
      hadith_number: 357,
      chapter: "General Behavior (Kitab Al-Adab)",
      grade_category: "sahih",
      grades: [
        { scholar: "Al-Albani", grade: "Ṣaḥīḥ" },
        { scholar: "Darussalam", grade: "Ṣaḥīḥ" }
      ]
    }
  },
  {
    id: "quran_2_255",
    type: "quran",
    citation: "Surah Al-Baqarah (2:255) — Āyat al-Kursī",
    score: 0.985,
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    text: "Allah! There is no god but He,-the Living, the Self-subsisting, Eternal. No slumber can seize Him nor sleep. His are all things in the heavens and on earth. Who is there can intercede in His presence except as He permitteth? He knoweth what (appeareth to His creatures as) before or after or behind them. Nor shall they compass aught of His knowledge except as He willeth. His Throne doth extend over the heavens and the earth, and He feeleth no fatigue in guarding and preserving them for He is the Most High, the Supreme (in glory).",
    metadata: {
      surah: 2,
      ayah: 255,
      surah_name: "Al-Baqarah",
      edition: "Yusuf Ali",
      author: "Abdullah Yusuf Ali"
    }
  }
];

export const PRESET_QUERIES = [
  {
    label: "Patience in Hardship",
    query: "patience during hardship and illness",
    description: "Verses and authentic hadiths concerning trials, sabr, and expiation of sins."
  },
  {
    label: "The Status of Mothers & Parents",
    query: "status of mothers and kindness to parents",
    description: "Mandate of birr al-walidayn and triple precedence accorded to the mother."
  },
  {
    label: "Night of Decree (Laylat al-Qadr)",
    query: "the night of power laylatul qadr better than thousand months",
    description: "Scripture and exegesis on the revelation of the Quran and angelic descent."
  },
  {
    label: "Neighborly Obligations",
    query: "kindness and rights of neighbors",
    description: "Prophetic traditions on the sanctity and welfare of the neighbor."
  },
  {
    label: "Āyat al-Kursī (The Throne Verse)",
    query: "ayat al kursi living eternal supreme throne",
    description: "The greatest verse of the Quran on divine majesty and eternal sovereignty."
  }
];

export const SYNTHESIS_PRESETS: Record<string, string> = {
  "patience during hardship and illness": 
    "According to primary sources, trial and hardship in the Islamic tradition are regarded as divine tests accompanied by spiritual expiation and eternal reward for those who persevere. In the Quran, Allah explicitly informs believers that they will be tested with fear, hunger, and loss of life and wealth, granting glad tidings to those who maintain patience and recite the Istirja' (Surah Al-Baqarah 2:155-157). Classical exegesis explains that this patience reflects an acknowledgment that all creation belongs to and returns to Allah (Tafsīr Ibn Kathīr 2:155).\n\nIn prophetic tradition, physical affliction and emotional distress carry expiatory virtue: the Prophet (ﷺ) affirmed that no fatigue, illness, sorrow, or even the prick of a thorn befalls a Muslim except that Allah expiates sins through it (Ṣaḥīḥ al-Bukhārī 5641). Furthermore, the entire state of the believer is characterized as good, turning to gratitude in times of ease and patient resignation in adversity (Ṣaḥīḥ Muslim 2999).",
  
  "status of mothers and kindness to parents":
    "Primary Islamic texts establish the elevated duty of dutifulness to parents (birr al-walidayn), placing filial kindness directly alongside the monotheistic worship of Allah (Surah Al-Isra 17:23-24). Scripture commands believers to lower the wing of humility to aging parents, prohibiting even expressions of mild irritation like 'uff'.\n\nWithin this framework, prophetic traditions assign a distinct three-fold precedence to the mother. When asked who is most entitled to one's best companionship, the Prophet (ﷺ) replied 'your mother' three consecutive times before citing the father fourth (Ṣaḥīḥ al-Bukhārī 5971). Furthermore, seeking parental pleasure is described as inextricably tied to divine pleasure (Jāmiʿ at-Tirmidhī 1909 [Ḥasan])."
};
