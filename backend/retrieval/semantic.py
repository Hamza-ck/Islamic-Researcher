import os
from functools import lru_cache
from pathlib import Path
from backend.core.config import EMBEDDING_MODEL, QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION

@lru_cache(maxsize=1)
def get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(EMBEDDING_MODEL)

def local_semantic_search(query, top_k=40, types=None, collections=None, min_grade=None):
    # Optional local FAISS index; intentionally graceful when FAISS/model is unavailable.
    try:
        import faiss, json
        from backend.core.config import FAISS_PATH, CORPUS_PATH
        if not Path(FAISS_PATH).exists() or not Path(CORPUS_PATH).exists(): return []
        index=faiss.read_index(str(FAISS_PATH)); q=get_model().encode(['query: '+query], normalize_embeddings=True)
        scores, ids=index.search(q, top_k*3)
        records=[]
        with open(CORPUS_PATH,encoding='utf-8') as f: records=[json.loads(x) for x in f if x.strip()]
        out=[]
        for score,idx in zip(scores[0],ids[0]):
            if idx<0 or idx>=len(records): continue
            r=records[idx]; meta=r.get('metadata',{})
            if types and r.get('type') not in types: continue
            if collections and meta.get('collection') not in collections: continue
            if min_grade and r.get('type')=='hadith':
                from backend.retrieval.quality import grade_rank
                if grade_rank(meta.get('grade_category')) < grade_rank(min_grade): continue
            out.append({**r,'semantic_score':float(score)})
            if len(out)>=top_k: break
        return out
    except Exception:
        return []

def qdrant_search(query, top_k=40, types=None, collections=None, min_grade=None):
    if not (QDRANT_URL and QDRANT_API_KEY): return []
    try:
        from qdrant_client import QdrantClient
        from qdrant_client.models import Filter,FieldCondition,MatchAny
        vec=get_model().encode('query: '+query, normalize_embeddings=True).tolist()
        must=[]
        if types: must.append(FieldCondition(key='type',match=MatchAny(any=types)))
        if collections: must.append(FieldCondition(key='metadata.collection',match=MatchAny(any=collections)))
        client=QdrantClient(url=QDRANT_URL,api_key=QDRANT_API_KEY)
        hits=client.query_points(collection_name=QDRANT_COLLECTION,query=vec,query_filter=Filter(must=must) if must else None,limit=top_k).points
        return [{**(h.payload or {}),'semantic_score':float(h.score or 0)} for h in hits if (h.payload or {}).get('text','').strip()]
    except Exception:
        return []
