"""FastAPI backend for the Islamic research/search tool.

Endpoints:
    GET  /health
    POST /search  -> retrieval only, no LLM (fast, zero hallucination risk)
    POST /ask     -> retrieval + optional Gemini synthesis, always returns sources
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from models import SearchRequest, SearchResponse, AskRequest, AskResponse
import search as search_module

app = FastAPI(title="Islamic Research Tool API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend's domain before going live
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/search", response_model=SearchResponse)
def search_endpoint(req: SearchRequest):
    results = search_module.search(
        req.query, top_k=req.top_k, types=req.types,
        collections=req.collections, min_grade=req.min_grade,
    )
    return {"results": results}


@app.post("/ask", response_model=AskResponse)
def ask_endpoint(req: AskRequest):
    passages = search_module.search(req.query, top_k=req.top_k)
    if not passages:
        return {"answer": "No relevant passages were found in the corpus.", "sources": []}

    try:
        import llm
        answer = llm.synthesize(req.query, passages)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM synthesis failed: {e}")

    return {"answer": answer, "sources": passages}
