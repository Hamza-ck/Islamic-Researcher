import time
from functools import lru_cache
from backend.core.config import RETRIEVAL_CANDIDATES
from backend.retrieval.hybrid import search as hybrid_search
from backend.retrieval.reranker import rerank

@lru_cache(maxsize=512)
def _cached(query,top_k,types_key,collections_key,min_grade):
    types=list(types_key) if types_key else None; collections=list(collections_key) if collections_key else None
    candidates=hybrid_search(query,top_k=max(top_k*3,RETRIEVAL_CANDIDATES),types=types,collections=collections,min_grade=min_grade)
    return rerank(query,candidates,top_k)

def search(query,top_k=10,types=None,collections=None,min_grade=None,research=False):
    started=time.time(); clean=query.strip()
    if not clean: return []
    results=list(_cached(clean,top_k,tuple(sorted(types or [])),tuple(sorted(collections or [])),min_grade))
    for r in results:
        r['score']=float(max(0.0,min(1.0,(r.get('score',0.0)+1)/2)))
        r.setdefault('metadata',{})['retrieved_at_ms']=int((time.time()-started)*1000)
    return results
