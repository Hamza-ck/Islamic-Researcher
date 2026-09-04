import os,time
from dataclasses import dataclass,field
from backend.core.config import GEMINI_MODEL,ALLOW_REMOTE_LLM
from backend.generation.verifier import verify_answer

@dataclass
class SynthesisResult:
    answer:str
    citations_used:list[str]=field(default_factory=list)
    confidence:str='low'
    confidence_score:float=0.0
    model_used:str='retrieval-only'
    tokens_used:int=0
    latency_ms:int=0
    language_detected:str='english'
    verification:dict=field(default_factory=dict)

def _lang(q):
    if any('\u0600'<=c<='\u06ff' for c in q): return 'arabic_or_urdu'
    if any('\u0900'<=c<='\u097f' for c in q): return 'hindi'
    return 'english'

def _fallback_answer(query, passages):
    if not passages: return 'No sufficiently relevant evidence was found in the indexed corpus. I will not infer a religious claim without supporting source text.'
    lines=['Based on the retrieved source material, the following evidence is relevant to your question:','']
    for p in passages[:6]:
        grade=''
        if p.get('type')=='hadith': grade=f" [{p.get('metadata',{}).get('grade_category','unclassified')}]"
        lines.append(f"• {p.get('text','').strip()} — {p.get('citation','Unknown')}{grade}")
    lines.append('')
    lines.append('This evidence summary is intentionally conservative: interpretation beyond the retrieved passages is not asserted as a definitive ruling.')
    return '\n'.join(lines)

def _gemini(query,passages,style,detail,temp):
    if not ALLOW_REMOTE_LLM or not os.getenv('GEMINI_API_KEY'): return None
    try:
        from google import genai
        from google.genai import types
        client=genai.Client(api_key=os.environ['GEMINI_API_KEY'])
        context='\n\n'.join(f"[{i+1}] {p.get('citation')} | {p.get('type')} | {p.get('metadata',{}).get('grade_category','')}\n{p.get('text','')}" for i,p in enumerate(passages))
        prompt=f'''Question: {query}\n\nEvidence:\n{context}\n\nAnswer only from the evidence. Do not invent verses, hadith, grades, scholars, or citations. Every factual claim must include one or more exact source citations from the evidence. If evidence is insufficient, say so. Distinguish source text from interpretation and preserve scholarly disagreement. Style: {style}. Detail: {detail}.'''
        r=client.models.generate_content(model=GEMINI_MODEL,contents=prompt,config=types.GenerateContentConfig(temperature=temp,max_output_tokens=4096))
        return r.text or None,GEMINI_MODEL,getattr(getattr(r,'usage_metadata',None),'total_token_count',0)
    except Exception:
        return None

def synthesize(query,passages,response_style='scholarly',detail_level='standard',temperature=0.2):
    start=time.time(); generated=_gemini(query,passages,response_style,detail_level,temperature)
    if generated:
        answer,model,tokens=generated
    else:
        answer=_fallback_answer(query,passages); model='retrieval-only'; tokens=0
    verification=verify_answer(answer,passages)
    score=verification['score']
    conf='high' if score>=0.8 and len(passages)>=3 else 'medium' if score>=0.5 else 'low'
    return SynthesisResult(answer=answer,citations_used=[p.get('citation','') for p in passages if p.get('citation','').lower() in answer.lower()],confidence=conf,confidence_score=score,model_used=model,tokens_used=tokens,latency_ms=int((time.time()-start)*1000),language_detected=_lang(query),verification=verification)
