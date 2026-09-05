import sys
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parents[1]
if str(WORKSPACE_DIR) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_DIR))
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from backend.core.config import settings
from backend.core.index_meta import validate_index_metadata
from backend.core.logging import log_event, setup_logging
from backend.models import (
    AskRequest,
    AskResponse,
    ContinueResearchRequest,
    FeedbackRequest,
    FeedbackResponse,
    HealthResponse,
    ResearchRequest,
    ResearchResponse,
    SearchRequest,
    SearchResponse,
    SynthesisMetadata,
    VerifyRequest,
)
from backend.search import search
from backend.research.engine import research
from backend.core.research.session import continue_research, get_research, run_research

setup_logging()

app = FastAPI(
    title='Islamic Researcher API',
    version='2.1.0',
    description='Source-grounded Islamic research engine. Retrieval-first; Gemini optional.',
)
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])


@app.exception_handler(Exception)
async def unhandled_error(_request: Request, exc: Exception):
    if isinstance(exc, (HTTPException, StarletteHTTPException, RequestValidationError)):
        raise exc
    log_event('unhandled_error', error=str(exc), type=type(exc).__name__)
    return JSONResponse(status_code=500, content={'detail': 'Internal server error'})


@app.get('/')
def root():
    return {
        'status': 'ok',
        'service': 'Islamic Researcher',
        'version': '2.1.0',
        'retrieval': 'hybrid lexical+semantic+reranker',
    }


@app.get('/health', response_model=HealthResponse)
def health():
    index = validate_index_metadata()
    status = 'ok' if index.get('ok', True) or not index.get('faiss_available') else 'degraded'
    if not settings.corpus_path.exists() and not settings.sqlite_path.exists():
        status = 'degraded'
    return HealthResponse(
        status=status,
        corpus_available=settings.corpus_path.exists(),
        local_index_available=settings.sqlite_path.exists(),
        faiss_available=settings.faiss_path.exists(),
        embedding_model=settings.embedding_model,
        reranker_enabled=settings.enable_reranker,
        remote_llm_configured=bool(settings.allow_remote_llm and settings.gemini_api_key),
        local_llm_configured=bool(settings.local_llm_model),
        index=index,
    )


@app.post('/search', response_model=SearchResponse)
def search_endpoint(req: SearchRequest):
    log_event('search', query_len=len(req.query), research=req.research, top_k=req.top_k)
    if req.research:
        plan, results = research(req.query, req.top_k, req.types, req.collections, req.min_grade)
        return {'results': results, 'metadata': {'research_plan': plan, 'mode': 'research'}}
    return {'results': search(req.query, req.top_k, req.types, req.collections, req.min_grade), 'metadata': {'mode': 'hybrid'}}


@app.post('/ask', response_model=AskResponse)
def ask_endpoint(req: AskRequest):
    import time
    start = time.time()
    if req.research:
        plan, passages = research(req.query, req.top_k, req.types, req.collections, req.min_grade)
    else:
        plan = None
        passages = search(req.query, req.top_k, req.types, req.collections, req.min_grade)
    from backend.generation.llm import synthesize
    result = synthesize(req.query, passages, req.response_style, req.detail_level, req.temperature)
    qid = None
    try:
        from backend import prompt_logger
        qid = prompt_logger.log_interaction(
            req.query,
            passages,
            result.answer,
            response_style=req.response_style,
            detail_level=req.detail_level,
            temperature=req.temperature,
            model_used=result.model_used,
            tokens_used=result.tokens_used,
            latency_ms=result.latency_ms,
            confidence=result.confidence,
            language_detected=result.language_detected,
        )
    except Exception:
        pass
    meta = SynthesisMetadata(
        confidence=result.confidence,
        confidence_score=result.confidence_score,
        model_used=result.model_used,
        tokens_used=result.tokens_used,
        latency_ms=int((time.time() - start) * 1000),
        response_style=req.response_style,
        temperature=req.temperature,
        verification=result.verification,
        research_plan=plan,
    )
    return {'answer': result.answer, 'sources': passages, 'metadata': meta, 'query_id': qid}


@app.post('/feedback', response_model=FeedbackResponse)
def feedback(req: FeedbackRequest):
    try:
        from backend import prompt_logger
        prompt_logger.log_feedback(req.query_id, req.rating, req.comment)
        return {'success': True, 'message': 'Feedback recorded'}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get('/ask/options')
def options():
    return {
        'response_styles': ['concise', 'scholarly', 'detailed'],
        'detail_levels': ['brief', 'standard', 'comprehensive'],
        'temperature': {'min': 0, 'max': 1, 'default': 0.2},
        'research_modes': ['quick', 'research', 'deep'],
    }


@app.get('/logs/stats')
def logs():
    return stats()


@app.get('/stats')
def stats():
    try:
        from backend import prompt_logger
        payload = prompt_logger.get_log_stats()
    except Exception as e:
        payload = {'error': str(e)}
    payload.update({
        'embedding_model': settings.embedding_model,
        'corpus_available': settings.corpus_path.exists(),
        'sqlite_available': settings.sqlite_path.exists(),
        'faiss_available': settings.faiss_path.exists(),
        'reranker_enabled': settings.enable_reranker,
        'remote_llm_configured': bool(settings.allow_remote_llm and settings.gemini_api_key),
    })
    return payload


@app.get('/sources/{source_id}')
def get_source(source_id: str):
    from backend.retrieval.local_index import get_document
    doc = get_document(source_id)
    if not doc:
        raise HTTPException(404, f'Source not found: {source_id}')
    return doc


@app.post('/research', response_model=ResearchResponse)
def research_endpoint(req: ResearchRequest):
    log_event('research', query_len=len(req.query), mode=req.mode, allow_external=req.allow_external)
    return run_research(
        req.query,
        mode=req.mode,
        top_k=req.top_k,
        types=req.types,
        collections=req.collections,
        min_grade=req.min_grade,
        allow_external=req.allow_external,
        response_style=req.response_style,
        detail_level=req.detail_level,
        temperature=req.temperature,
    )


@app.get('/research/{research_id}', response_model=ResearchResponse)
def research_get(research_id: str):
    payload = get_research(research_id)
    if not payload:
        raise HTTPException(404, f'Research session not found: {research_id}')
    return payload


@app.post('/research/{research_id}/continue', response_model=ResearchResponse)
def research_continue(research_id: str, req: ContinueResearchRequest):
    payload = continue_research(research_id, query=req.query, allow_external=req.allow_external)
    if not payload:
        raise HTTPException(404, f'Research session not found: {research_id}')
    return payload


@app.post('/verify')
def verify_endpoint(req: VerifyRequest):
    from backend.generation.verifier import verify_answer
    from backend.retrieval.local_index import get_document
    sources = []
    for sid in req.source_ids:
        doc = get_document(sid)
        if doc:
            sources.append(doc)
    if req.source_ids and not sources:
        raise HTTPException(404, 'None of the cited source ids were found in the local index')
    return verify_answer(req.answer, sources)
