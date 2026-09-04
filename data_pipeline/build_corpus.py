"""Merge all raw sources into one chunked corpus.jsonl, ready for embedding.

Quran/hadith entries are short and kept as a single chunk each. Tafsir entries
can be long, so they're split with a small overlap so no passage is lost or
truncated at embedding time.
"""
import json

from config import RAW_DIR, CORPUS_PATH, MAX_CHUNK_CHARS, CHUNK_OVERLAP_CHARS


def chunk_text(text: str, max_chars: int, overlap: int) -> list[str]:
    if len(text) <= max_chars:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        chunks.append(text[start:end])
        start = end - overlap
    return chunks


def load_jsonl(path):
    if not path.exists():
        print(f"  (skipping, not found: {path})")
        return []
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def main():
    sources = {
        "quran": RAW_DIR / "quran.jsonl",
        "hadith": RAW_DIR / "hadith.jsonl",
        "tafsir": RAW_DIR / "tafsir.jsonl",
    }

    out_records = []
    for name, path in sources.items():
        print(f"Loading {name} from {path}...")
        records = load_jsonl(path)
        for rec in records:
            raw_text = rec.get("text", "")
            if not raw_text or not raw_text.strip():
                continue
            pieces = chunk_text(raw_text, MAX_CHUNK_CHARS, CHUNK_OVERLAP_CHARS)
            for i, piece in enumerate(pieces):
                clean_piece = piece.strip()
                if not clean_piece:
                    continue
                chunk_rec = dict(rec)
                chunk_rec["text"] = clean_piece
                if len(pieces) > 1:
                    chunk_rec["id"] = f"{rec['id']}:chunk{i}"
                out_records.append(chunk_rec)
        print(f"  -> {len(records)} source records")

    with open(CORPUS_PATH, "w", encoding="utf-8") as f:
        for rec in out_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(f"\nTotal chunks written: {len(out_records)} -> {CORPUS_PATH}")


if __name__ == "__main__":
    main()
