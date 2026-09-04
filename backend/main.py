import sys
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parents[1]
if str(WORKSPACE_DIR) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_DIR))
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models import SearchRequest,SearchResponse,AskRequest,AskResponse,SynthesisMetadata,FeedbackRequest,FeedbackResponse
from backend.search import search
from backend.research.engine import research


app=FastAPI(title='Islamic Researcher API',version='2.0.0')
app.add_middleware(CORSMiddleware,allow_origins=['*'],allow_methods=['*'],allow_headers=['*'])

@app.get('/')
def root(): return {'status':'ok','service':'Islamic Researcher','version':'2.0.0','retrieval':'hybrid lexical+semantic+reranker'}

@app.get('/health')
def health():
    from backend.core.config import CORPUS_PATH,SQLITE_PATH,EMBEDDING_MODEL
    return {'status':'ok','corpus_available':CORPUS_PATH.exists(),'local_index_available':SQLITE_PATH.exists(),'embedding_model':EMBEDDING_MODEL}

@app.post('/search',response_model=SearchResponse)
def search_endpoint(req:SearchRequest):
    if req.research:
        plan,results=research(req.query,req.top_k,req.types,req.collections,req.min_grade)
        return {'results':results,'metadata':{'research_plan':plan}}
    return {'results':search(req.query,req.top_k,req.types,req.collections,req.min_grade),'metadata':{'mode':'hybrid'}}

@app.post('/ask',response_model=AskResponse)
def ask_endpoint(req:AskRequest):
    import time
    start=time.time()
    if req.research:
        plan,passages=research(req.query,req.top_k,req.types,req.collections,req.min_grade)
    else:
        plan=None; passages=search(req.query,req.top_k,req.types,req.collections,req.min_grade)
    from backend.generation.llm import synthesize
    result=synthesize(req.query,passages,req.response_style,req.detail_level,req.temperature)
    qid=None
    try:
        import prompt_logger
        qid=prompt_logger.log_interaction(req.query,passages,result.answer,response_style=req.response_style,detail_level=req.detail_level,temperature=req.temperature,model_used=result.model_used,tokens_used=result.tokens_used,latency_ms=result.latency_ms,confidence=result.confidence,language_detected=result.language_detected)
    except Exception: pass
    meta=SynthesisMetadata(confidence=result.confidence,confidence_score=result.confidence_score,model_used=result.model_used,tokens_used=result.tokens_used,latency_ms=int((time.time()-start)*1000),response_style=req.response_style,temperature=req.temperature,verification=result.verification,research_plan=plan)
    return {'answer':result.answer,'sources':passages,'metadata':meta,'query_id':qid}

@app.post('/feedback',response_model=FeedbackResponse)
def feedback(req:FeedbackRequest):
    try:
        import prompt_logger; prompt_logger.log_feedback(req.query_id,req.rating,req.comment)
        return {'success':True,'message':'Feedback recorded'}
    except Exception as e: raise HTTPException(500,str(e))

@app.get('/ask/options')
def options(): return {'response_styles':['concise','scholarly','detailed'],'detail_levels':['brief','standard','comprehensive'],'temperature':{'min':0,'max':1,'default':0.2}}

@app.get('/logs/stats')
def logs():
    try:
        import prompt_logger; return prompt_logger.get_log_stats()
    except Exception as e: return {'error':str(e)}
