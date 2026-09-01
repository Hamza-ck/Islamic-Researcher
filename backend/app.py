import os
from dotenv import load_dotenv

load_dotenv()

try:
    import spaces
except ImportError:
    class spaces:
        @staticmethod
        def GPU(fn=None, **kwargs):
            if fn is None:
                return lambda f: f
            return fn

from gradio import Server
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import SearchRequest, SearchResponse, AskRequest, AskResponse
import search as search_module

app = Server()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_endpoint():
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
        result = llm.synthesize(req.query, passages)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM synthesis failed: {e}")

    return {"answer": result.answer, "sources": passages}


@app.get("/")
def root_status():
    return {
        "status": "ok",
        "service": "Islamic Research Tool API (gradio.Server)",
        "endpoints": ["/health", "/search", "/ask", "/docs"],
    }


app.launch(show_error=True)
