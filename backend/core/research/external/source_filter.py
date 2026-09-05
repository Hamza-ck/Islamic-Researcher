def classify_external(record: dict) -> dict:
    url = (record.get('url') or (record.get('metadata') or {}).get('url') or '').lower()
    text = (record.get('text') or '').lower()
    quality = 'tertiary'
    if 'wikipedia.org' in url:
        quality = 'encyclopedia'
    if any(w in text for w in ('quran', 'hadith', 'islam', 'allah')):
        topical = True
    else:
        topical = False
    return {
        'external_quality': quality,
        'topical': topical,
        'must_not_outrank_primary': True,
    }


def filter_external(records: list[dict]) -> list[dict]:
    kept = []
    for r in records:
        text = (r.get('text') or '').strip()
        if len(text) < 40:
            continue
        meta = r.get('metadata') or {}
        if meta.get('topical') is False:
            continue
        r['origin'] = 'external'
        r['source_priority'] = 'external'
        kept.append(r)
    return kept
