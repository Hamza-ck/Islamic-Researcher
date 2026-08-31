
import os
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

from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchAny
from sentence_transformers import SentenceTransformer

QDRANT_URL = os.environ["QDRANT_URL"]
QDRANT_API_KEY = os.environ["QDRANT_API_KEY"]
COLLECTION_NAME = os.environ.get("QDRANT_COLLECTION", "islamic_corpus")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "intfloat/multilingual-e5-base")

_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
_model = SentenceTransformer(EMBEDDING_MODEL)

# Coarse ranking used only for the min_grade filter -- see fetch_hadith.py for
# how grade_category is derived from the raw per-scholar grades.
GRADE_RANK = {"sahih": 3, "hasan": 2, "unclassified": 1, "weak": 0}


@spaces.GPU
def encode_query(text: str):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    return _model.encode(text, normalize_embeddings=True, device=device).tolist()



def _build_filter(types, collections) -> Optional[Filter]:
    must = []
    if types:
        must.append(FieldCondition(key="type", match=MatchAny(any=types)))
    if collections:
        must.append(FieldCondition(key="metadata.collection", match=MatchAny(any=collections)))
    return Filter(must=must) if must else None


def search(query: str, top_k=10, types=None, collections=None, min_grade=None):
    query_vector = encode_query(f"query: {query}")
    qfilter = _build_filter(types, collections)

    # Over-fetch when grade-filtering client-side so results don't come up short.
    fetch_limit = top_k * 3 if min_grade else top_k
    try:
        hits = _client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            query_filter=qfilter,
            limit=fetch_limit,
        ).points
    except Exception as e:
        print(f"Warning: Qdrant query failed ({e}). If the collection is not yet created, please run the data pipeline.")
        return []

    min_rank = GRADE_RANK.get(min_grade, -1) if min_grade else -1
    results = []
    for h in hits:
        payload = h.payload
        if min_grade and payload["type"] == "hadith":
            rank = GRADE_RANK.get(payload["metadata"].get("grade_category", "unclassified"), -1)
            if rank < min_rank:
                continue
        results.append({
            "id": payload["id"],
            "type": payload["type"],
            "text": payload["text"],
            "citation": payload["citation"],
            "score": h.score,
            "arabic": payload.get("arabic"),
            "metadata": payload["metadata"],
        })
        if len(results) >= top_k:
            break
    return results
