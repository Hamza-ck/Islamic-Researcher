# Islamic Researcher — Zero-Budget Research Engine

A source-grounded Islamic research/search application designed to run locally or on free hosting. The architecture is now **retrieval-first**: lexical search + semantic search + reciprocal-rank fusion + optional neural reranking, followed by conservative answer generation and claim/citation verification.

## What changed

- One canonical FastAPI entry point: `backend.main:app`.
- Removed the duplicate Gradio/FastAPI server path.
- One canonical embedding model: `EMBEDDING_MODEL` (default `intfloat/multilingual-e5-base`).
- Added local SQLite FTS5 lexical retrieval.
- Added optional FAISS semantic retrieval.
- Qdrant remains optional for existing deployments.
- Added RRF hybrid fusion and optional `BAAI/bge-reranker-v2-m3` cross-encoder reranking.
- Added research mode with query decomposition.
- Added evidence/citation verification and calibrated confidence labels.
- Added source-quality weighting without treating similarity as probability of truth.
- Corpus builder now supports Quran, Hadith, Tafsir, scholars and lecture transcripts when files exist.
- Quran/Hadith entries remain atomic; long commentary is split on semantic boundaries rather than blindly slicing characters.
- Gemini is optional. Without a key, `/ask` degrades to a retrieval-only evidence summary rather than hallucinating.
- Added local FAISS index builder and retrieval evaluation scaffold.

## Zero-budget architecture

`React -> FastAPI -> research planner -> hybrid retrieval (SQLite FTS5 + FAISS/Qdrant) -> RRF -> cross-encoder reranker -> evidence selection -> optional local/free LLM -> citation verification -> answer`

No paid service is required for the core retrieval system.

## Run locally

```bash
python -m pip install -r backend/requirements.txt
python -m data_pipeline.run_pipeline --fetch-only
# optional semantic index
python -m data_pipeline.indexing.build_faiss
uvicorn backend.main:app --reload --port 8000
```

Then run the existing frontend with `npm install && npm run dev`.

## Environment

```text
EMBEDDING_MODEL=intfloat/multilingual-e5-base
QDRANT_URL=                 # optional
QDRANT_API_KEY=             # optional
QDRANT_COLLECTION=Islamic_Researcher
GEMINI_API_KEY=             # optional
GEMINI_MODEL=gemini-2.5-flash
ALLOW_REMOTE_LLM=true
```

## Important scholarly safeguards

The system does **not** convert vector similarity into truth probability. Hadith grading remains source metadata and preserves raw scholar grades. Conflicting interpretations should be surfaced rather than silently averaged. If evidence is insufficient, the answer layer should say so.

The tool is a research assistant, not a mufti. Users should consult qualified scholars for religious rulings.
