"""Query understanding: language detection, intent classification, topic and entity extraction."""
from __future__ import annotations

import re
from typing import TypedDict

ROMAN_URDU_WORDS = {'kya', 'hai', 'mein', 'ke', 'ka', 'ki', 'aur', 'ko', 'kaise', 'kab', 'se', 'kyun', 'karna', 'hona'}

SCHOLARS = [
    'abu hanifa', 'malik', 'shafii', 'shafi\'i', 'ahmad ibn hanbal', 'ibn hanbal',
    'bukhari', 'muslim', 'tirmidhi', 'abu dawood', 'nasai', 'ibn majah',
    'nawawi', 'ibn taymiyyah', 'ibn kathir', 'tabari', 'qurtubi', 'ghazali', 'asqalani'
]

TOPICS = {
    'prayer': ['salah', 'namaz', 'prayer', 'prostration', 'sujud', 'ruku', 'tahajjud', 'wudu'],
    'fasting': ['sawm', 'fasting', 'ramadan', 'roza', 'iftar', 'suhoor'],
    'charity': ['zakat', 'sadaqah', 'charity'],
    'pilgrimage': ['hajj', 'umrah', 'tawaf', 'arafah', 'mecca', 'makkah'],
    'creed': ['tawhid', 'iman', 'aqeedah', 'shirk', 'allah', 'prophet', 'angels', 'qiyamah', 'afterlife'],
    'ethics': ['sabr', 'patience', 'shukr', 'gratitude', 'truthfulness', 'sidq', 'character', 'akhlaq'],
    'finance': ['riba', 'interest', 'usury', 'halal investment', 'murabaha', 'trade'],
}


class QueryAnalysis(TypedDict):
    language: str
    intent: str
    entities: list[str]
    topics: list[str]
    is_comparative: bool
    source_focus: list[str]


def detect_language(query: str) -> str:
    q = query or ''
    if any('\u0600' <= c <= '\u06ff' for c in q):
        # Could be Arabic or Urdu script
        urdu_specific = any(c in 'ٹڈڑںہےۓ' for c in q)
        return 'urdu' if urdu_specific else 'arabic_or_urdu'
    if any('\u0900' <= c <= '\u097f' for c in q):
        return 'hindi'
    words = set(re.findall(r'\b[a-zA-Z]+\b', q.lower()))
    if len(words & ROMAN_URDU_WORDS) >= 2:
        return 'roman_urdu'
    return 'english'


def detect_intent(query: str) -> str:
    ql = (query or '').lower()
    if any(k in ql for k in ('vs', 'versus', 'differ', 'disagree', 'ikhtilaf', 'difference between', 'opinions on')):
        return 'comparative_disagreement'
    if any(k in ql for k in ('authentic', 'grade', 'is this hadith', 'chain', 'is it sahih', 'daif')):
        return 'hadith_authenticity'
    if any(k in ql for k in ('tafsir', 'meaning of verse', 'explanation of ayah', 'surah explanation')):
        return 'tafsir_explanation'
    if any(k in ql for k in ('is it allowed', 'permissible', 'haram', 'halal', 'ruling on', 'obligation', 'fard', 'wajib')):
        return 'fiqh_ruling'
    if any(k in ql for k in ('tawhid', 'who is', 'nature of', 'creed', 'attributes of')):
        return 'theology_creed'
    return 'general_research'


def extract_entities(query: str) -> list[str]:
    ql = (query or '').lower()
    found = []
    for scholar in SCHOLARS:
        if scholar in ql:
            found.append(scholar.title())
    surah_match = re.search(r'\b(surah|surat)\s+([a-zA-Z-]+|\d+)', ql)
    if surah_match:
        found.append(surah_match.group(0).title())
    return found


def extract_topics(query: str) -> list[str]:
    ql = (query or '').lower()
    matched = []
    for topic, keywords in TOPICS.items():
        if any(k in ql for k in keywords):
            matched.append(topic)
    return matched


def analyze_query(query: str) -> QueryAnalysis:
    ql = (query or '').lower()
    lang = detect_language(query)
    intent = detect_intent(query)
    entities = extract_entities(query)
    topics = extract_topics(query)
    is_comparative = intent == 'comparative_disagreement' or any(
        k in ql for k in ('vs', 'versus', 'difference between', 'compare', 'ikhtilaf')
    )
    sources = []
    if 'quran' in ql or "qur'an" in ql:
        sources.append('quran')
    if 'hadith' in ql or 'bukhari' in ql or 'muslim' in ql or 'sunnah' in ql:
        sources.append('hadith')
    if 'tafsir' in ql or 'ibn kathir' in ql:
        sources.append('tafsir')
    if any(s in ql for s in SCHOLARS):
        sources.append('scholar')
    if not sources:
        sources = ['quran', 'hadith', 'tafsir', 'scholar']

    return {
        'language': lang,
        'intent': intent,
        'entities': entities,
        'topics': topics,
        'is_comparative': is_comparative,
        'source_focus': sources,
    }
