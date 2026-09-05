"""Resumable research sessions on top of existing hybrid retrieval."""
from __future__ import annotations

from backend.core.provenance import hit_to_evidence
from backend.core.research.external import acquire_external
from backend.core.research.state import append_timeline, load_state, new_state, save_state
from backend.core.research.sufficiency import classify_sufficiency
from backend.core.routing import route
from backend.core.verification import verify_research
from backend.generation.llm import synthesize
from backend.research.engine import research as retrieve_research
from backend.search import search


def _claims_from_answer(answer: str, sources: list[dict]) -> list[dict]:
    claims = []
    for i, src in enumerate(sources[:8], start=1):
        cit = src.get('citation') or src.get('id')
        if cit and cit.lower() in (answer or '').lower():
            claims.append({
                'id': f'c{i}',
                'text': (src.get('text') or '')[:280],
                'sources': [src.get('id')],
                'support': 'supported',
            })
    return claims


def _response(state: dict) -> dict:
    conf = state.get('confidence') or {}
    return {
        'research_id': state['research_id'],
        'query': state['original_query'],
        'status': state.get('status', 'completed'),
        'mode': state.get('mode', 'research'),
        'answer': state.get('answer', ''),
        'claims': state.get('claims', []),
        'sources': state.get('evidence', []),
        'contradictions': state.get('contradictions', []),
        'confidence': {
            'level': conf.get('level', 'low'),
            'score': conf.get('score', 0.0),
            'note': 'Confidence is an evidence-coverage signal, not a probability of religious truth.',
        },
        'sufficiency': state.get('sufficiency') or {},
        'external_research_used': bool(state.get('external_sources')),
        'timeline': state.get('timeline', []),
        'metadata': {
            'routing': state.get('routing'),
            'research_plan': state.get('plan'),
            'verification': state.get('verification'),
            'evidence_units': [hit_to_evidence(h) for h in state.get('evidence') or []],
        },
    }


def run_research(
    query: str,
    *,
    mode: str = 'research',
    top_k: int = 10,
    types=None,
    collections=None,
    min_grade=None,
    allow_external: bool = False,
    response_style: str = 'scholarly',
    detail_level: str = 'standard',
    temperature: float = 0.2,
    state: dict | None = None,
) -> dict:
    state = state or new_state(query, mode)
    append_timeline(state, 'query_understood', f'mode={mode}')
    routing = route(query)
    state['routing'] = routing
    append_timeline(state, 'routing', routing.get('router', 'rules_v1'))

    if mode == 'quick':
        plan = {'language': 'n/a', 'subqueries': [query], 'source_tracks': ['quran', 'hadith', 'tafsir', 'scholar']}
        hits = search(query, top_k=top_k, types=types, collections=collections, min_grade=min_grade)
    else:
        plan, hits = retrieve_research(query, top_k=top_k, types=types, collections=collections, min_grade=min_grade)
        if mode == 'deep' and len(hits) < top_k:
            extra = search(query, top_k=top_k, types=types, collections=collections, min_grade=min_grade)
            seen = {h.get('id') for h in hits}
            for h in extra:
                if h.get('id') not in seen:
                    hits.append(h)
                    seen.add(h.get('id'))
            hits = hits[: max(top_k, 12)]

    state['plan'] = plan
    state['subqueries'] = list(plan.get('subqueries') or [query])
    state['sources_searched'] = list(plan.get('source_tracks') or [])
    state['search_history'].append({'query': query, 'hit_ids': [h.get('id') for h in hits]})
    append_timeline(state, 'retrieval', f'{len(hits)} hits')
    append_timeline(state, 'reranking', 'optional cross-encoder if ENABLE_RERANKER')

    sufficiency = classify_sufficiency(query, hits, mode=mode)
    state['sufficiency'] = sufficiency
    append_timeline(state, 'evidence_check', sufficiency['status'])

    if sufficiency['status'] in {'insufficient', 'low_quality', 'conflicted'} and allow_external:
        append_timeline(state, 'external_research', 'attempting supplementary providers')
        external = acquire_external(query, force=allow_external)
        state['external_sources'] = external
        if external:
            hits = list(hits) + external
            append_timeline(state, 'external_research', f'{len(external)} external snippets (priority=external)')
        else:
            append_timeline(state, 'external_research', 'no external snippets (disabled or empty)')
            state['unanswered_questions'].append('External evidence was requested but no provider returned usable passages.')
    elif sufficiency['status'] in {'insufficient', 'low_quality'} and not allow_external:
        append_timeline(state, 'external_research', 'not requested')

    if sufficiency['status'] == 'conflicted':
        types_found = sorted({h.get('type', '') for h in hits if h.get('type')})
        state['contradictions'] = [{
            'summary': 'Multiple source types retrieved for a disagreement-oriented query. Do not collapse them into one ruling.',
            'source_ids': [h.get('id') for h in hits[:8]],
            'source_types': types_found,
        }]

    result = synthesize(query, hits, response_style, detail_level, temperature)
    if sufficiency['status'] == 'insufficient' and not hits:
        result.answer = (
            'Evidence is insufficient to make a reliable conclusion. '
            'The indexed Islamic corpus returned no supporting passages for this query.'
        )
    elif sufficiency['status'] == 'insufficient':
        result.answer = (
            result.answer
            + '\n\nEvidence is insufficient to make a reliable conclusion. Treat the passages above as leads, not a ruling.'
        )
    elif sufficiency['status'] == 'conflicted':
        result.answer = (
            result.answer
            + '\n\nScholarly disagreement detected: the retrieved sources should be read as distinct positions, not a blended consensus.'
        )

    verification = verify_research(result.answer, hits, query)
    state['answer'] = result.answer
    state['verification'] = verification
    state['claims'] = verification.get('claims') or _claims_from_answer(result.answer, hits)
    state['contradictions'] = verification.get('contradictions') or state.get('contradictions') or []
    state['evidence'] = hits
    state['confidence'] = {
        'level': result.confidence,
        'score': float(result.confidence_score or sufficiency.get('score') or 0),
    }
    state['status'] = 'completed'
    append_timeline(state, 'verification', verification.get('status', ''))
    append_timeline(state, 'complete')
    save_state(state)
    return _response(state)


def continue_research(research_id: str, query: str | None = None, allow_external: bool = False, **kwargs) -> dict | None:
    state = load_state(research_id)
    if not state:
        return None
    follow = (query or '').strip() or state['original_query']
    append_timeline(state, 'continue', follow)
    merged = run_research(follow, state=state, allow_external=allow_external, mode=state.get('mode', 'research'), **kwargs)
    return merged


def get_research(research_id: str) -> dict | None:
    state = load_state(research_id)
    return _response(state) if state else None
