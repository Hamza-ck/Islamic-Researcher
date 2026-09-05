"""Corpus validation and duplicate detection. Run after build_corpus.py."""
from __future__ import annotations

import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

PIPELINE_DIR = Path(__file__).resolve().parent
if str(PIPELINE_DIR) not in sys.path:
    sys.path.insert(0, str(PIPELINE_DIR))
WORKSPACE_DIR = Path(__file__).resolve().parents[1]
if str(WORKSPACE_DIR) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_DIR))

try:
    from config import CORPUS_PATH
except ImportError:
    from data_pipeline.config import CORPUS_PATH

REQUIRED = {'id', 'type', 'text'}
RECOMMENDED_META = {'license', 'provenance'}


def validate_corpus(path=CORPUS_PATH) -> dict:
    path = Path(path)
    report = {
        'path': str(path),
        'ok': True,
        'records': 0,
        'errors': [],
        'warnings': [],
        'type_counts': {},
        'duplicate_ids': [],
        'duplicate_text_hashes': 0,
        'missing_license': 0,
        'missing_normalized_text': 0,
    }
    if not path.exists():
        report['ok'] = False
        report['errors'].append(f'corpus missing: {path}')
        return report

    ids = []
    hashes = Counter()
    types = Counter()
    with path.open(encoding='utf-8') as f:
        for i, line in enumerate(f, 1):
            if not line.strip():
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError as exc:
                report['ok'] = False
                report['errors'].append(f'line {i}: {exc}')
                continue
            report['records'] += 1
            missing = REQUIRED - set(rec)
            if missing:
                report['ok'] = False
                report['errors'].append(f"{rec.get('id', f'line {i}')} missing {sorted(missing)}")
            rid = rec.get('id')
            if rid:
                ids.append(rid)
            types[rec.get('type', 'unknown')] += 1
            text = rec.get('text') or ''
            if not str(text).strip():
                report['ok'] = False
                report['errors'].append(f'{rid}: empty text')
            hashes[hashlib.sha256(str(text).strip().lower().encode()).hexdigest()[:16]] += 1
            meta = rec.get('metadata') or {}
            if not rec.get('license') and not meta.get('license'):
                report['missing_license'] += 1
            if not rec.get('normalized_text') and not meta.get('normalized_text'):
                report['missing_normalized_text'] += 1
            if rec.get('type') == 'hadith':
                grades = meta.get('grades')
                if grades is not None and not isinstance(grades, (list, dict)):
                    report['warnings'].append(f'{rid}: grades should remain structured, not a collapsed string')

    dup_ids = [k for k, v in Counter(ids).items() if v > 1]
    report['duplicate_ids'] = dup_ids[:50]
    if dup_ids:
        report['ok'] = False
        report['errors'].append(f'{len(dup_ids)} duplicate ids')
    report['duplicate_text_hashes'] = sum(1 for n in hashes.values() if n > 1)
    report['type_counts'] = dict(types)
    if report['missing_license']:
        report['warnings'].append(f"{report['missing_license']} records lack license metadata")
    return report


def main():
    report = validate_corpus()
    print(json.dumps(report, indent=2, ensure_ascii=False))
    sys.exit(0 if report['ok'] else 1)


if __name__ == '__main__':
    main()
