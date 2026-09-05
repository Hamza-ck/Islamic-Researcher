"""Map retrieval hits onto the canonical evidence schema without dropping grades."""


def hit_to_evidence(hit: dict) -> dict:
    meta = hit.get('metadata') or {}
    grades = meta.get('grades')
    if grades is None and meta.get('grade_category'):
        grades = {'category': meta.get('grade_category'), 'raw': meta.get('grade')}
    origin = hit.get('origin') or ('offline_demo' if meta.get('offline_demo') else 'internal')
    if origin == 'external' or meta.get('external'):
        origin = 'external'
    text = hit.get('text') or ''
    return {
        'id': str(hit.get('id', '')),
        'source_type': hit.get('type') or meta.get('source_type') or 'source',
        'collection': meta.get('collection'),
        'book': meta.get('book'),
        'chapter': meta.get('chapter'),
        'author': meta.get('author') or meta.get('scholar'),
        'title': meta.get('title') or hit.get('citation'),
        'language': meta.get('language'),
        'text': text,
        'original_text': hit.get('original_text') or meta.get('original_text') or text,
        'normalized_text': hit.get('normalized_text') or meta.get('normalized_text') or text,
        'translation': hit.get('translation') or meta.get('translation'),
        'arabic': hit.get('arabic'),
        'reference': hit.get('citation') or meta.get('reference'),
        'url': meta.get('url') or hit.get('url'),
        'source_priority': hit.get('source_priority') or meta.get('source_priority') or (
            'external' if origin == 'external' else 'primary'
        ),
        'provenance': meta.get('provenance') or meta.get('provenance_status'),
        'license': meta.get('license'),
        'grading': grades if isinstance(grades, dict) else None,
        'origin': origin,
        'metadata': meta,
    }
