import re

def normalize_text(text):
    return re.sub(r'\s+',' ',text or '').strip()

def chunk_record(record,max_chars=1200,overlap=120):
    text=normalize_text(record.get('text',''))
    if not text:return []
    typ=record.get('type')
    # Preserve atomic revelation/tradition units whenever possible.
    if typ in {'quran','hadith'} or len(text)<=max_chars:return [dict(record,text=text)]
    chunks=[]; start=0
    while start < len(text):
        end = min(len(text), start + max_chars)
        if end < len(text):
            boundary = max(text.rfind('. ', start, end), text.rfind('۔', start, end), text.rfind('\n', start, end))
            if boundary > start + max_chars // 2:
                end = boundary + 1
        piece = text[start:end].strip()
        if piece:
            r = dict(record)
            r['text'] = piece
            r['id'] = f"{record.get('id', 'record')}:chunk{len(chunks)}"
            r.setdefault('metadata', {})['chunk_index'] = len(chunks)
            chunks.append(r)
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return chunks

