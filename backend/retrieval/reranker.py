import os
from backend.core.config import RERANK_CANDIDATES

_model=None

def _get_model():
    global _model
    if _model is None:
        if os.getenv('ENABLE_RERANKER', 'false').lower() not in {'1', 'true', 'yes'}:
            _model = False
            return _model
        try:
            from sentence_transformers import CrossEncoder
            model_name = os.getenv('RERANKER_MODEL', 'BAAI/bge-reranker-base')
            _model = CrossEncoder(model_name)
        except Exception:
            _model = False
    return _model


def rerank(query, candidates, top_k):
    if not candidates: return []
    model=_get_model()
    pool=candidates[:max(top_k,RERANK_CANDIDATES)]
    if model:
        try:
            pairs=[(query, x.get('text','')) for x in pool]
            scores=model.predict(pairs)
            for x,s in zip(pool,scores): x['rerank_score']=float(s); x['score']=0.65*float(s)+0.35*float(x.get('score',0))
        except Exception:
            pass
    return sorted(pool,key=lambda x:x.get('score',0),reverse=True)[:top_k]
