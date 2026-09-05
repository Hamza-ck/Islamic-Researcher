"""Claim extraction, claim-evidence matching, and contradiction flags.

Lexical overlap is used first. Semantic/entailment checks are optional and skipped
when extra models are unavailable. Similarity is never treated as truth probability.
"""
from __future__ import annotations

import re

from backend.generation.verifier import verify_answer as citation_verify

TOKEN_RE = re.compile(r"[\w\u0600-\u06ff]+", re.UNICODE)


def _tokens(text: str) -> set[str]:
    return {t.lower() for t in TOKEN_RE.findall(text or '') if len(t) > 2}


def extract_claims(answer: str, sources: list[dict]) -> list[dict]:
    sentences = [s.strip() for s in re.split(r'(?<=[.!?۔])\s+', answer or '') if s.strip()]
    claims = []
    for i, sent in enumerate(sentences, start=1):
        if len(sent) < 20:
            continue
        matched = []
        st = _tokens(sent)
        for src in sources:
            cit = (src.get('citation') or '').lower()
            overlap = len(st & _tokens(src.get('text') or '')) / max(1, len(st))
            if cit and cit in sent.lower():
                matched.append(src.get('id'))
            elif overlap >= 0.22:
                matched.append(src.get('id'))
        support = 'supported' if matched else 'unsupported'
        if matched and not any((src.get('citation') or '').lower() in sent.lower() for src in sources):
            support = 'weak'
        claims.append({'id': f'c{i}', 'text': sent, 'sources': [m for m in matched if m], 'support': support})
    return claims


def match_claims(claims: list[dict], sources: list[dict]) -> dict:
    by_id = {s.get('id'): s for s in sources}
    supported = weak = unsupported = 0
    for c in claims:
        ids = [i for i in c.get('sources') or [] if i in by_id]
        c['sources'] = ids
        if c.get('support') == 'supported' and ids:
            supported += 1
        elif c.get('support') == 'weak' or ids:
            weak += 1
            c['support'] = 'weak' if c.get('support') != 'supported' else c['support']
        else:
            unsupported += 1
            c['support'] = 'unsupported'
    total = max(1, len(claims))
    return {
        'claims': claims,
        'supported': supported,
        'weak': weak,
        'unsupported': unsupported,
        'unsupported_rate': round(unsupported / total, 3),
    }


def detect_contradictions(query: str, sources: list[dict]) -> list[dict]:
    types = sorted({s.get('type') for s in sources if s.get('type')})
    cue = any(tok in (query or '').lower() for tok in (' vs ', 'versus', 'differ', 'disagree', 'ikhtilaf', 'conflict'))
    out = []
    if cue and len(types) >= 2:
        out.append({
            'summary': 'Query indicates disagreement and retrieved sources span multiple genres. Present each position with its own citations.',
            'source_ids': [s.get('id') for s in sources[:12] if s.get('id')],
        })
    texts = [(s.get('id'), _tokens(s.get('text') or '')) for s in sources[:12]]
    for i, (a_id, a_tok) in enumerate(texts):
        for b_id, b_tok in texts[i + 1 :]:
            if not a_id or not b_id or a_id == b_id:
                continue
            inter = a_tok & b_tok
            if len(inter) < 4:
                continue
            neg = {'not', 'no', 'never', 'لا', 'ليس'}
            if (a_tok & neg and not (b_tok & neg)) or (b_tok & neg and not (a_tok & neg)):
                out.append({
                    'summary': f'Sources {a_id} and {b_id} share topic terms but differ in negation cues. Do not average them.',
                    'source_ids': [a_id, b_id],
                })
                if len(out) >= 5:
                    return out
    return out


def verify_research(answer: str, sources: list[dict], query: str = '') -> dict:
    citation = citation_verify(answer, sources)
    claims = extract_claims(answer, sources)
    matching = match_claims(claims, sources)
    contradictions = detect_contradictions(query, sources)
    score = round(0.5 * citation.get('score', 0) + 0.5 * (1 - matching['unsupported_rate']), 3)
    return {
        **citation,
        'score': score,
        'claims': matching['claims'],
        'unsupported_claim_rate': matching['unsupported_rate'],
        'contradictions': contradictions,
        'status': 'verified' if score >= 0.6 and matching['unsupported'] == 0 else 'partially_verified',
    }
