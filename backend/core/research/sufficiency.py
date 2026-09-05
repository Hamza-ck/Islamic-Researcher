"""Transparent evidence-sufficiency rules. Not a truth classifier."""

PRIMARY = {'quran', 'hadith'}
LOW_QUALITY_TYPES = {'lecture_transcript'}


def classify_sufficiency(query: str, evidence: list[dict], mode: str = 'research') -> dict:
    n = len(evidence)
    types = {str(e.get('type') or e.get('source_type') or '') for e in evidence}
    scores = [float(e.get('score') or 0) for e in evidence]
    avg = sum(scores) / max(1, len(scores))
    primary = sum(1 for e in evidence if (e.get('type') or e.get('source_type')) in PRIMARY)
    low = sum(1 for e in evidence if (e.get('type') or e.get('source_type')) in LOW_QUALITY_TYPES)
    secondary = sum(
        1
        for e in evidence
        if (e.get('metadata') or {}).get('provenance_status') == 'secondary_summary_verify_before_publication'
    )
    conflict_cue = any(tok in query.lower() for tok in (' vs ', 'versus', 'differ', 'disagree', 'ikhtilaf'))
    missing = []
    if n == 0:
        return {
            'status': 'insufficient',
            'score': 0.0,
            'reason': 'No internal corpus evidence was retrieved for this query.',
            'missing_information': ['indexed passages matching the query'],
        }
    if low == n or (secondary == n and n > 0):
        return {
            'status': 'low_quality',
            'score': round(min(avg, 0.4), 3),
            'reason': 'Retrieved items are secondary summaries or lecture material, not primary source text.',
            'missing_information': ['primary Qur\'an or Hadith passages'],
        }
    if conflict_cue and len(types) >= 2:
        return {
            'status': 'conflicted',
            'score': round(min(0.7, 0.35 + 0.1 * n), 3),
            'reason': 'The query asks about disagreement and multiple source types were retrieved. Positions should be presented separately.',
            'missing_information': [],
        }
    need = 2 if mode == 'quick' else 3 if mode == 'research' else 5
    if n < need or primary == 0:
        if n < need:
            missing.append(f'at least {need} distinct evidence units')
        if primary == 0:
            missing.append('primary Qur\'an or Hadith evidence')
        return {
            'status': 'insufficient',
            'score': round(min(avg, 0.45), 3),
            'reason': 'Internal evidence is too thin or lacks primary sources for a reliable conclusion.',
            'missing_information': missing,
        }
    score = min(1.0, 0.25 * min(n, 8) / 4 + 0.4 * avg + 0.2 * (1 if primary else 0) + 0.15 * min(len(types), 3) / 3)
    return {
        'status': 'sufficient',
        'score': round(score, 3),
        'reason': f'{n} internal evidence units including {primary} primary-source item(s).',
        'missing_information': [],
    }
