"""FastAPI backend for the Islamic research/search tool.

Endpoints:
    GET  /health
    POST /search       -> retrieval only, no LLM (fast, zero hallucination risk)
    POST /ask          -> retrieval + Gemini synthesis with configurable options
    POST /feedback     -> user feedback on synthesized answers (for training data)
    GET  /ask/options  -> available synthesis configuration options
    GET  /logs/stats   -> prompt log statistics
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from models import (
    SearchRequest, SearchResponse,
    AskRequest, AskResponse, SynthesisMetadata,
    FeedbackRequest, FeedbackResponse,
)
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
        return {
            "answer": "No relevant passages were found in the corpus.",
            "sources": [],
            "metadata": None,
            "query_id": None,
        }

    try:
        import llm
        result = llm.synthesize(
            req.query,
            passages,
            response_style=req.response_style,
            detail_level=req.detail_level,
            temperature=req.temperature,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM synthesis failed: {e}")

    # Log the interaction for training data
    query_id = None
    try:
        import prompt_logger
        query_id = prompt_logger.log_interaction(
            query=req.query,
            passages=passages,
            answer=result.answer,
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
        pass  # Logging failure should never block the response

    metadata = SynthesisMetadata(
        confidence=result.confidence,
        model_used=result.model_used,
        tokens_used=result.tokens_used,
        latency_ms=result.latency_ms,
        response_style=req.response_style,
        temperature=req.temperature,
    )

    return {
        "answer": result.answer,
        "sources": passages,
        "metadata": metadata,
        "query_id": query_id,
    }


@app.post("/feedback", response_model=FeedbackResponse)
def feedback_endpoint(req: FeedbackRequest):
    """Record user feedback on a synthesized answer."""
    try:
        import prompt_logger
        success = prompt_logger.log_feedback(
            query_id=req.query_id,
            rating=req.rating,
            comment=req.comment,
        )
        return {"success": success, "message": "Feedback recorded. Thank you!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record feedback: {e}")


@app.get("/ask/options")
def ask_options():
    """Return available synthesis configuration options for the frontend."""
    return {
        "response_styles": {
            "concise": {
                "label": "Concise",
                "description": "Short, direct answer in 2-3 paragraphs with essential citations only.",
                "icon": "⚡",
            },
            "scholarly": {
                "label": "Scholarly",
                "description": "Thorough analysis with all citations, authenticity grades, and cross-references.",
                "icon": "📖",
                "default": True,
            },
            "detailed": {
                "label": "Detailed",
                "description": "Exhaustive treatment with tafsir context, Arabic text, and thematic organization.",
                "icon": "📚",
            },
        },
        "detail_levels": ["brief", "standard", "comprehensive"],
        "temperature": {
            "min": 0.0,
            "max": 1.0,
            "default": 0.3,
            "description": "Lower = more precise and grounded, Higher = more creative and expansive",
        },
    }


@app.get("/logs/stats")
def log_stats():
    """Return prompt log statistics."""
    try:
        import prompt_logger
        return prompt_logger.get_log_stats()
    except Exception as e:
        return {"error": str(e)}
