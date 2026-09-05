"""Subquery decomposition for multi-facet and comparative research."""
from __future__ import annotations

import re
from backend.core.query.analyzer import analyze_query
from backend.core.query.normalizer import normalize_whitespace


def decompose_query(query: str, max_subqueries: int = 4) -> list[str]:
    """Decomposes a query into atomic subqueries for hybrid multi-track retrieval."""
    clean = normalize_whitespace(query)
    if not clean:
        return []

    analysis = analyze_query(clean)
    subqueries: list[str] = [clean]

    # If comparative, isolate sides of comparison
    if analysis['is_comparative']:
        comp_parts = re.split(r'\b(?:vs|versus|compared to|and between)\b|;', clean, flags=re.IGNORECASE)
        for part in comp_parts:
            p = normalize_whitespace(part)
            if p and len(p) > 3 and p not in subqueries:
                subqueries.append(p)

    # Split on questions or conjunctions
    parts = re.split(r'\?|\band\b|،|,|;', clean, flags=re.IGNORECASE)
    for p in parts:
        pt = normalize_whitespace(p)
        if pt and len(pt) > 5 and pt not in subqueries:
            subqueries.append(pt)

    # If scholars were identified, create scholar-specific subqueries
    for scholar in analysis['entities']:
        sub = f"{scholar} on {clean}"
        if len(subqueries) < max_subqueries and sub not in subqueries:
            subqueries.append(sub)

    return subqueries[:max_subqueries]
