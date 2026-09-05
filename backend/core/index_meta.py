"""FAISS / embedding index sidecar metadata."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from backend.core.config import FAISS_META_PATH, FAISS_PATH, settings


def corpus_fingerprint(corpus_path: Path) -> str:
    h = hashlib.sha256()
    path = Path(corpus_path)
    if not path.exists():
        return ''
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()[:16]


def write_faiss_metadata(
    *,
    embedding_model: str,
    ntotal: int,
    dimension: int,
    corpus_path: Path,
    faiss_path: Path | None = None,
) -> Path:
    meta_path = Path(faiss_path or FAISS_PATH).with_name('index.meta.json')
    payload = {
        'embedding_model': embedding_model,
        'ntotal': ntotal,
        'dimension': dimension,
        'corpus_path': str(corpus_path),
        'corpus_fingerprint': corpus_fingerprint(corpus_path),
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    meta_path.write_text(json.dumps(payload, indent=2), encoding='utf-8')
    return meta_path


def validate_index_metadata() -> dict:
    faiss_exists = Path(FAISS_PATH).exists()
    meta_path = Path(FAISS_META_PATH)
    result = {
        'faiss_available': faiss_exists,
        'metadata_available': meta_path.exists(),
        'embedding_model_expected': settings.embedding_model,
        'ok': True,
        'warnings': [],
    }
    if not faiss_exists:
        result['ok'] = True
        result['warnings'].append('FAISS index missing; semantic search will be skipped')
        return result
    if not meta_path.exists():
        result['ok'] = False
        result['warnings'].append('FAISS index has no index.meta.json; rebuild with data_pipeline.indexing.build_faiss')
        return result
    try:
        meta = json.loads(meta_path.read_text(encoding='utf-8'))
    except Exception as exc:
        result['ok'] = False
        result['warnings'].append(f'unreadable index metadata: {exc}')
        return result
    result['embedding_model_indexed'] = meta.get('embedding_model')
    result['ntotal'] = meta.get('ntotal')
    result['dimension'] = meta.get('dimension')
    if meta.get('embedding_model') and meta['embedding_model'] != settings.embedding_model:
        result['ok'] = False
        result['warnings'].append(
            f"embedding model mismatch: index={meta.get('embedding_model')} runtime={settings.embedding_model}"
        )
    return result
