from backend.research.planner import plan
from backend.search import search

def research(query,top_k=8,types=None,collections=None,min_grade=None):
    p=plan(query); all_results=[]; seen=set()
    for sub in p['subqueries']:
        rs=search(sub,top_k=max(4,top_k//len(p['subqueries'])+2),types=types,collections=collections,min_grade=min_grade)
        for r in rs:
            if r['id'] not in seen: seen.add(r['id']); all_results.append(r)
    all_results.sort(key=lambda x:x.get('score',0),reverse=True)
    return p,all_results[:top_k]
