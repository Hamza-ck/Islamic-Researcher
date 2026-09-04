from collections import defaultdict
from backend.retrieval.local_index import lexical_search
from backend.retrieval.semantic import local_semantic_search, qdrant_search
from backend.retrieval.quality import quality_score

def reciprocal_rank_fusion(lists, k=60):
    fused=defaultdict(lambda: {'item':None,'score':0.0,'signals':{}})
    for results in lists:
        for rank,item in enumerate(results,1):
            rid=item.get('id')
            if not rid: continue
            fused[rid]['item']=item
            fused[rid]['score'] += 1/(k+rank)
            fused[rid]['signals'].update({key:value for key,value in item.items() if key.endswith('_score')})
    out=[]
    for v in fused.values():
        item=dict(v['item']); item['retrieval_score']=v['score']; item['score']=v['score']*quality_score(item)
        item['metadata']={**item.get('metadata',{}),'retrieval_signals':v['signals']}
        out.append(item)
    return sorted(out,key=lambda x:x['score'],reverse=True)

def search(query, top_k=10, types=None, collections=None, min_grade=None):
    lexical=lexical_search(query, top_k=max(top_k*4,40),types=types,collections=collections,min_grade=min_grade)
    semantic=local_semantic_search(query, top_k=max(top_k*4,40),types=types,collections=collections,min_grade=min_grade)
    if not semantic:
        semantic=qdrant_search(query, top_k=max(top_k*4,40),types=types,collections=collections,min_grade=min_grade)
    fused=reciprocal_rank_fusion([lexical,semantic])
    return fused[:top_k]
