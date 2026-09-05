"""Wikipedia MediaWiki API — optional supplementary evidence, never primary."""
from __future__ import annotations

import json
from urllib.parse import quote
from urllib.request import Request, urlopen

from backend.core.config import settings
from backend.core.research.external.base import ExternalProvider
from backend.core.research.external.source_filter import classify_external


class WikipediaProvider(ExternalProvider):
    name = 'wikipedia'

    def search(self, query: str, top_k: int = 5, force: bool = False) -> list[dict]:
        if not (settings.enable_external_search or force):
            return []
        q = quote(query[:180])
        url = f'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={q}&utf8=&format=json&srlimit={min(top_k, 5)}'
        req = Request(url, headers={'User-Agent': 'IslamicResearcher/2.1 (local-first research engine)'})
        try:
            with urlopen(req, timeout=settings.external_request_timeout) as resp:
                data = json.loads(resp.read().decode('utf-8'))
        except Exception:
            return []
        hits = []
        for item in (data.get('query') or {}).get('search') or []:
            title = item.get('title') or ''
            snippet = (item.get('snippet') or '').replace('<span class="searchmatch">', '').replace('</span>', '')
            page_url = f'https://en.wikipedia.org/wiki/{quote(title.replace(" ", "_"))}'
            rec = {
                'id': f'ext:wiki:{item.get("pageid")}',
                'type': 'web',
                'text': snippet.strip(),
                'citation': f'Wikipedia — {title}',
                'score': 0.2,
                'origin': 'external',
                'source_priority': 'external',
                'url': page_url,
                'metadata': {
                    'external': True,
                    'provider': self.name,
                    'license': 'CC BY-SA',
                    'provenance': 'wikipedia_search_snippet',
                    'url': page_url,
                    'title': title,
                },
            }
            rec['metadata'].update(classify_external(rec))
            hits.append(rec)
        return hits
