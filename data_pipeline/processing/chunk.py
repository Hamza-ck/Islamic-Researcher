import re

ARABIC_DIACRITICS = re.compile(r'[\u064b-\u065f\u0670]')


def normalize_text(text):
    """Whitespace-normalize for retrieval. Does not strip letters needed for citations."""
    return re.sub(r'\s+', ' ', text or '').strip()


def retrieval_normalize(text):
    folded = ARABIC_DIACRITICS.sub('', normalize_text(text))
    return folded.lower()


def chunk_record(record, max_chars=1200, overlap=120):
    original = record.get('original_text') or record.get('text', '')
    text = normalize_text(original)
    if not text:
        return []
    typ = record.get('type')
    license_ = (record.get('metadata') or {}).get('license') or record.get('license')
    provenance = (record.get('metadata') or {}).get('provenance') or record.get('provenance')

    def decorate(item, piece, index=None):
        meta = dict(item.get('metadata') or {})
        if license_:
            meta.setdefault('license', license_)
        if provenance:
            meta.setdefault('provenance', provenance)
        item['metadata'] = meta
        item['original_text'] = original if index is None else piece
        item['text'] = piece
        item['normalized_text'] = retrieval_normalize(piece)
        if index is not None:
            item['id'] = f"{record.get('id', 'record')}:chunk{index}"
            item['metadata']['chunk_index'] = index
        return item

    if typ in {'quran', 'hadith'} or len(text) <= max_chars:
        return [decorate(dict(record), text)]

    chunks = []
    start = 0
    while start < len(text):
        end = min(len(text), start + max_chars)
        if end < len(text):
            boundary = max(text.rfind('. ', start, end), text.rfind('۔', start, end), text.rfind('\n', start, end))
            if boundary > start + max_chars // 2:
                end = boundary + 1
        piece = text[start:end].strip()
        if piece:
            chunks.append(decorate(dict(record), piece, len(chunks)))
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return chunks
