"""YouTube transcript interface. Uses youtube-transcript-api only if installed."""
from __future__ import annotations

import re

from backend.core.config import settings
from backend.core.research.external.base import ExternalProvider
from backend.core.research.external.source_filter import classify_external

YT_ID = re.compile(r'(?:v=|/shorts/|youtu\.be/)([A-Za-z0-9_-]{11})')


class YouTubeTranscriptProvider(ExternalProvider):
    name = 'youtube'

    def search(self, query: str, top_k: int = 3, force: bool = False) -> list[dict]:
        if not (settings.enable_external_search or force):
            return []
        video_id = None
        m = YT_ID.search(query)
        if m:
            video_id = m.group(1)
        if not video_id:
            return []
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
        except Exception:
            return []
        try:
            parts = YouTubeTranscriptApi.get_transcript(video_id)
        except Exception:
            return []
        text = ' '.join(p.get('text', '') for p in parts)[:1200]
        rec = {
            'id': f'ext:yt:{video_id}',
            'type': 'youtube_transcript',
            'text': text,
            'citation': f'YouTube transcript {video_id}',
            'score': 0.15,
            'origin': 'external',
            'source_priority': 'external',
            'metadata': {
                'external': True,
                'provider': self.name,
                'url': f'https://www.youtube.com/watch?v={video_id}',
                'provenance': 'youtube_transcript',
                'license': 'platform_terms',
            },
        }
        rec['metadata'].update(classify_external(rec))
        return [rec]
