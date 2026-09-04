
import os
import time
from functools import lru_cache
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
# pyrefly: ignore [missing-import]
import torch

try:
    import spaces
except ImportError:
    class spaces:
        @staticmethod
        def GPU(fn=None, **kwargs):
            if fn is None:
                return lambda f: f
            return fn

import json
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchAny, HasIdCondition
from sentence_transformers import SentenceTransformer

QDRANT_URL = os.environ["QDRANT_URL"]
QDRANT_API_KEY = os.environ["QDRANT_API_KEY"]
COLLECTION_NAME = os.environ.get("QDRANT_COLLECTION", "Islamic_Researcher")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "intfloat/multilingual-e5-small")

_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
_model = SentenceTransformer(EMBEDDING_MODEL)

# Load list of known empty corpus UUIDs so Qdrant never returns them as search candidates
_EMPTY_POINTS_PATH = Path(__file__).parent / "empty_points.json"
try:
    if _EMPTY_POINTS_PATH.exists():
        with open(_EMPTY_POINTS_PATH, "r", encoding="utf-8") as f:
            EMPTY_POINT_IDS = json.load(f)
    else:
        EMPTY_POINT_IDS = []
except Exception:
    EMPTY_POINT_IDS = []

# Coarse ranking used only for the min_grade filter -- see fetch_hadith.py for
# how grade_category is derived from the raw per-scholar grades.
GRADE_RANK = {"sahih": 3, "hasan": 2, "unclassified": 1, "weak": 0}

# Simple in-memory search result cache with TTL (5 minutes)
_SEARCH_CACHE: dict[str, tuple[float, list[dict]]] = {}
_CACHE_TTL_SECONDS = 300
_CACHE_MAX_ENTRIES = 1000


@lru_cache(maxsize=2048)
def _encode_query_cached(text: str) -> tuple[float, ...]:
    """Cache query vector computations so repeat or related searches are instant."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    vec = _model.encode(text, normalize_embeddings=True, device=device).tolist()
    return tuple(vec)


@spaces.GPU
def encode_query(text: str) -> list[float]:
    return list(_encode_query_cached(text))


def _build_filter(types, collections) -> Optional[Filter]:
    must = []
    must_not = []
    if types:
        must.append(FieldCondition(key="type", match=MatchAny(any=types)))
    if collections:
        must.append(FieldCondition(key="metadata.collection", match=MatchAny(any=collections)))
    if EMPTY_POINT_IDS:
        must_not.append(HasIdCondition(has_id=EMPTY_POINT_IDS))
    
    if must or must_not:
        return Filter(
            must=must if must else None,
            must_not=must_not if must_not else None
        )
    return None


def search(query: str, top_k=10, types=None, collections=None, min_grade=None):
    clean_query = query.strip()
    if not clean_query:
        return []

    # Check in-memory result cache
    cache_key = f"{clean_query.lower()}|{top_k}|{sorted(types) if types else ''}|{sorted(collections) if collections else ''}|{min_grade or ''}"
    now = time.time()
    if cache_key in _SEARCH_CACHE:
        cached_time, cached_results = _SEARCH_CACHE[cache_key]
        if now - cached_time < _CACHE_TTL_SECONDS:
            return cached_results

    query_vector = encode_query(f"query: {clean_query}")
    qfilter = _build_filter(types, collections)

    # Adaptive fetch limit: over-fetch candidate points from Qdrant Cloud to guarantee
    # we never return empty or truncated lists due to empty text chunks or grade filters.
    fetch_limit = min(max(top_k * 5, 50), 150)
    try:
        hits = _client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            query_filter=qfilter,
            limit=fetch_limit,
        ).points
    except Exception as e:
        # If filtered query failed (e.g. temporary index mismatch), fallback to base query + post-filter
        if qfilter is not None:
            try:
                base_filter = Filter(must_not=[HasIdCondition(has_id=EMPTY_POINT_IDS)]) if EMPTY_POINT_IDS else None
                hits = _client.query_points(
                    collection_name=COLLECTION_NAME,
                    query=query_vector,
                    query_filter=base_filter,
                    limit=max(fetch_limit, 100),
                ).points
            except Exception as e2:
                print(f"Warning: Qdrant query failed ({e2}).")
                return []
        else:
            print(f"Warning: Qdrant query failed ({e}). If the collection is not yet created, please run the data pipeline.")
            return []

    min_rank = GRADE_RANK.get(min_grade, -1) if min_grade else -1
    results = []
    for h in hits:
        payload = h.payload
        text_content = payload.get("text", "")
        # Filter out records with empty or whitespace-only text
        if not text_content or not text_content.strip():
            continue
        # Strictly enforce type and collection filters
        if types and payload.get("type") not in types:
            continue
        if collections and payload.get("metadata", {}).get("collection") not in collections:
            continue
        if min_grade and payload.get("type") == "hadith":
            rank = GRADE_RANK.get(payload.get("metadata", {}).get("grade_category", "unclassified"), -1)
            if rank < min_rank:
                continue
        results.append({
            "id": payload.get("id"),
            "type": payload.get("type"),
            "text": text_content,
            "citation": payload.get("citation", "Unknown"),
            "score": float(h.score) if h.score is not None else 0.0,
            "arabic": payload.get("arabic"),
            "metadata": payload.get("metadata", {}),
        })
        if len(results) >= top_k:
            break

    # Cache successful search results
    if len(_SEARCH_CACHE) >= _CACHE_MAX_ENTRIES:
        # Evict oldest entry
        oldest_key = min(_SEARCH_CACHE.keys(), key=lambda k: _SEARCH_CACHE[k][0])
        del _SEARCH_CACHE[oldest_key]
    _SEARCH_CACHE[cache_key] = (now, results)

    return results
