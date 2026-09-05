"""Research planner utilizing core query understanding and decomposition."""
from backend.core.query import analyze_query, decompose_query, detect_language


def plan(query: str) -> dict:
    analysis = analyze_query(query)
    subqueries = decompose_query(query, max_subqueries=4)
    if not subqueries:
        subqueries = [query]
    return {
        'language': analysis['language'],
        'intent': analysis['intent'],
        'entities': analysis['entities'],
        'topics': analysis['topics'],
        'subqueries': subqueries,
        'source_tracks': analysis['source_focus'],
    }
