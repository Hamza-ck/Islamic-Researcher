"""Core query understanding, analysis, normalization, and decomposition."""
from backend.core.query.analyzer import analyze_query, detect_intent, detect_language, extract_entities, extract_topics
from backend.core.query.decomposer import decompose_query
from backend.core.query.normalizer import (
    normalize_arabic_letters,
    normalize_for_retrieval,
    normalize_whitespace,
    strip_arabic_diacritics,
)

__all__ = [
    'analyze_query',
    'detect_intent',
    'detect_language',
    'extract_entities',
    'extract_topics',
    'decompose_query',
    'normalize_arabic_letters',
    'normalize_for_retrieval',
    'normalize_whitespace',
    'strip_arabic_diacritics',
]
