"""Build a normalized, source-aware corpus. The output is deterministic and chunk IDs are stable."""
import sys
import json
from pathlib import Path

PIPELINE_DIR = Path(__file__).resolve().parent
if str(PIPELINE_DIR) not in sys.path:
    sys.path.insert(0, str(PIPELINE_DIR))
WORKSPACE_DIR = Path(__file__).resolve().parents[1]
if str(WORKSPACE_DIR) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_DIR))

try:
    from config import RAW_DIR, CORPUS_PATH, MAX_CHUNK_CHARS, CHUNK_OVERLAP_CHARS
    from processing.chunk import chunk_record
except ImportError:
    from data_pipeline.config import RAW_DIR, CORPUS_PATH, MAX_CHUNK_CHARS, CHUNK_OVERLAP_CHARS
    from data_pipeline.processing.chunk import chunk_record


def load_jsonl(path):
    if not path.exists(): return []
    with open(path,encoding='utf-8') as f:return [json.loads(x) for x in f if x.strip()]

def main():
    sources={'quran':'quran.jsonl','hadith':'hadith.jsonl','tafsir':'tafsir.jsonl','scholar':'scholars.jsonl','lecture_transcript':'lectures.jsonl'}
    out=[]; seen=set()
    for typ,filename in sources.items():
        for rec in load_jsonl(RAW_DIR/filename):
            rec=dict(rec); rec.setdefault('type',typ); rec.setdefault('metadata',{})
            rec['metadata'].setdefault('source_priority', 'primary' if typ in {'quran','hadith'} else 'commentary')
            rec['metadata'].setdefault('provenance', rec['metadata'].get('provenance_status') or f'{typ}_ingest')
            rec['metadata'].setdefault('license', rec['metadata'].get('license') or 'see docs/data-sources.md')
            rec.setdefault('original_text', rec.get('text',''))
            for item in chunk_record(rec,MAX_CHUNK_CHARS,CHUNK_OVERLAP_CHARS):
                if item['id'] in seen: continue
                seen.add(item['id']); out.append(item)
    with open(CORPUS_PATH,'w',encoding='utf-8') as f:
        for r in out:f.write(json.dumps(r,ensure_ascii=False,sort_keys=True)+'\n')
    print(f'Wrote {len(out)} deterministic chunks to {CORPUS_PATH}')
if __name__=='__main__':main()
