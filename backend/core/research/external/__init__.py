"""Controlled external acquisition. Never overrides curated primary sources."""
from backend.core.config import settings
from backend.core.research.external.source_filter import filter_external
from backend.core.research.external.web import WikipediaProvider
from backend.core.research.external.youtube import YouTubeTranscriptProvider


def acquire_external(query: str, top_k: int = 5, force: bool = False) -> list[dict]:
    if not (settings.enable_external_search or force):
        return []
    collected = []
    for provider in (WikipediaProvider(), YouTubeTranscriptProvider()):
        try:
            collected.extend(provider.search(query, top_k=top_k, force=force))
        except Exception:
            continue
    ranked = filter_external(collected)
    ranked.sort(key=lambda x: float(x.get('score') or 0), reverse=True)
    return ranked[:top_k]
