from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from backend.core.config import BACKEND_DIR

SESSION_DIR = BACKEND_DIR / 'logs' / 'research'


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_state(query: str, mode: str = 'research') -> dict[str, Any]:
    return {
        'research_id': str(uuid.uuid4()),
        'original_query': query,
        'normalized_query': query.strip(),
        'mode': mode,
        'status': 'running',
        'subqueries': [],
        'sources_searched': [],
        'evidence': [],
        'claims': [],
        'contradictions': [],
        'external_sources': [],
        'unanswered_questions': [],
        'search_history': [],
        'timeline': [],
        'sufficiency': {},
        'routing': {},
        'answer': '',
        'created_at': _now(),
        'updated_at': _now(),
    }


def append_timeline(state: dict, stage: str, detail: str = '') -> None:
    state.setdefault('timeline', []).append({'stage': stage, 'detail': detail, 'at': _now()})
    state['updated_at'] = _now()


def save_state(state: dict) -> Path:
    SESSION_DIR.mkdir(parents=True, exist_ok=True)
    path = SESSION_DIR / f"{state['research_id']}.json"
    state['updated_at'] = _now()
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding='utf-8')
    return path


def load_state(research_id: str) -> dict | None:
    path = SESSION_DIR / f'{research_id}.json'
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding='utf-8'))
