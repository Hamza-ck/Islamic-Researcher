GRADE_RANK = {'sahih': 3, 'hasan': 2, 'unclassified': 1, 'weak': 0}
TYPE_WEIGHT = {'quran': 1.12, 'hadith': 1.05, 'tafsir': 0.98, 'scholar': 0.92, 'lecture_transcript': 0.85}

def grade_rank(value):
    return GRADE_RANK.get(str(value or 'unclassified').lower(), 1)

def source_weight(result):
    return TYPE_WEIGHT.get(result.get('type', 'source'), 0.8)

def quality_score(result):
    meta = result.get('metadata') or {}
    score = source_weight(result)
    if result.get('type') == 'hadith':
        score *= 0.95 + 0.05 * (grade_rank(meta.get('grade_category')) / 3)
    if meta.get('author') or meta.get('scholar'):
        score += 0.03
    if meta.get('provenance_status') == 'secondary_summary_verify_before_publication':
        score *= 0.75
    return min(score, 1.25)
