"""Rule-based source routing used until a trained neural router exists."""
from backend.retrieval.quality import TYPE_WEIGHT

KEYWORD_BOOSTS = {
    'quran': ('quran', 'qur\'an', 'ayah', 'surah', 'ayat'),
    'hadith': ('hadith', 'sunnah', 'bukhari', 'muslim', 'nawawi'),
    'tafsir': ('tafsir', 'exegesis', 'ibn kathir', 'commentary'),
    'scholar': ('scholar', 'fiqh', 'fatwa', 'imam'),
}


def route_sources(query: str, retrieval_quality: dict | None = None) -> dict:
    q = (query or '').lower()
    weights = {k: float(v) for k, v in TYPE_WEIGHT.items()}
    for source, keys in KEYWORD_BOOSTS.items():
        if any(k in q for k in keys):
            weights[source] = weights.get(source, 1.0) * 1.15
    external_prob = 0.05
    if any(w in q for w in ('youtube', 'lecture', 'contemporary', 'news')):
        external_prob = 0.35
        weights['lecture_transcript'] = weights.get('lecture_transcript', 0.85) * 1.1
    quality = retrieval_quality or {}
    if quality.get('hit_count', 1) == 0:
        external_prob = max(external_prob, 0.6)
    return {
        'quran_weight': weights.get('quran', 1.0),
        'hadith_weight': weights.get('hadith', 1.0),
        'tafsir_weight': weights.get('tafsir', 1.0),
        'scholar_weight': weights.get('scholar', 1.0),
        'web_weight': 0.25,
        'youtube_weight': 0.2,
        'external_research_probability': round(min(external_prob, 1.0), 3),
        'router': 'rules_v1',
    }
