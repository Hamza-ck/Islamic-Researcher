import re

def verify_answer(answer, sources):
    citations=[s.get('citation','') for s in sources if s.get('citation')]
    cited=sum(1 for c in citations if c.lower() in answer.lower())
    sentences=[s.strip() for s in re.split(r'(?<=[.!?۔])\s+',answer) if s.strip()]
    grounded=sum(1 for s in sentences if any(c.lower() in s.lower() for c in citations))
    coverage=grounded/max(1,len(sentences))
    citation_rate=cited/max(1,len(citations))
    score=round(0.55*coverage+0.45*citation_rate,3)
    return {'citation_coverage':round(coverage,3),'source_citation_rate':round(citation_rate,3),'score':score,'status':'verified' if score>=0.6 else 'partially_verified'}
