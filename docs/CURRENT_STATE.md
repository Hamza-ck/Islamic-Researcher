# Current State — Islamic Researcher

Audit date: 2026-09-05. Authoritative product spec: `Islamic-Researcher-Full-Implementation-Plan.pdf`.

This document describes the repository **as it exists today**. Target architecture and the migration path live in `docs/MIGRATION.md`.

## Product vs code

The live system is a **retrieval-first grounded search/ask API** plus a **Gemini-style chat frontend**. It is not yet the Research Workspace / sessioned research engine described in the plan.

Working today:

- Canonical FastAPI entry: `backend.main:app`
- Hybrid retrieval: SQLite FTS5 + FAISS (or optional Qdrant) + RRF + source-quality weights
- Optional cross-encoder reranker (off by default)
- Optional Gemini synthesis; retrieval-only fallback when no key
- Thin research flag (`research=true` on `/search` and `/ask`) that decomposes queries with regex and merges hits
- Lexical citation overlap verification after generation

Not present:

- Persisted `ResearchState` / resumable sessions
- Evidence sufficiency classifier (sufficient / insufficient / conflicted / low-quality)
- Neural source router
- External web / YouTube evidence acquisition
- Claim extraction, claim–evidence matching, contradiction views
- Target APIs: `POST /research`, `POST /research/{id}/continue`, `GET /research/{id}`, `POST /verify`, `GET /sources/{id}`, `GET /stats`
- Research Workspace UI (Quick / Research / Deep, timeline, evidence panel, conflict panel)
- Honest `OFFLINE DEMO DATA` labeling on mock results

## Entry points

| Path | Role | Verdict |
|------|------|---------|
| `backend/main.py` | FastAPI app and routes | Canonical |
| `backend/app.py` | Re-exports `app` | Harmless shim |
| `backend/llm.py` | Re-exports `generation.llm` | Duplicate import path |
| `backend/streamlit_app.py` + `run_streamlit.bat` | Old Streamlit UI | Leftover; Streamlit not in requirements |
| `backend/README.md` | HF Spaces / Gradio / ZeroGPU | Stale; contradicts root README |
| `backend/test_all_features.py` | Manual smoke script | Not pytest |

Runtime path: React frontend → FastAPI `backend.main:app`.

## Backend layout

```
backend/
  main.py, models.py, search.py, prompt_logger.py
  core/config.py          # env/paths only
  retrieval/              # FTS5, FAISS/Qdrant, RRF, rerank, quality
  research/planner.py     # regex split + language heuristic
  research/engine.py      # multi-subquery retrieve + dedupe
  generation/llm.py       # Gemini + fallback
  generation/verifier.py  # citation substring scoring
```

Target `core/query`, `core/routing`, `core/research` (sufficiency, external), `core/verification`, and `core/provenance` do not exist.

## Live API

| Method | Path | Notes |
|--------|------|--------|
| GET | `/` | Service banner |
| GET | `/health` | Corpus + SQLite + embedding model name |
| POST | `/search` | Hybrid search; `research=true` uses planner/engine |
| POST | `/ask` | Search + synthesize + inline verify |
| POST | `/feedback` | Prompt-logger ratings |
| GET | `/ask/options` | Style/detail/temperature |
| GET | `/logs/stats` | Logger counts, not product stats |

Frontend never sends `research: true`.

## Config inconsistencies

- `backend/core/config.py` vs `data_pipeline/.env.example`: Qdrant collection `Islamic_Researcher` vs `islamic_corpus`
- `LOCAL_LLM_MODEL` and `RETRIEVAL_CANDIDATES` are declared and unused
- `ENABLE_RERANKER` / `RERANKER_MODEL` / `GEMINI_API_KEY` are read from env in modules, not centralized
- No `backend/.env.example`
- FAISS index has no sidecar metadata recording embedding model / dimension / corpus fingerprint

## Retrieval and data pipeline

Pipeline: fetch Quran / Hadith / Tafsir / scholars → `build_corpus.py` → optional FAISS / Qdrant.

Chunking in `data_pipeline/processing/chunk.py` is source-aware (atomic Quran/Hadith; boundary windows for long commentary), not blind character slices. Original vs normalized text are not stored separately. License/provenance are incomplete as first-class fields.

SQLite FTS5 is built lazily in `backend/retrieval/local_index.py`, not as a pipeline step. Duplicate IDs are skipped at corpus build; there is no corpus validator or hash-level dedupe.

## Frontend

Modular Gemini chat (`App.tsx` orchestrates sidebar, hero, messages, input, library, settings). Modes are `ask` | `search`, not Quick / Research / Deep Research.

`frontend/src/data/mockCorpus.ts` is used when the backend is unreachable. Results use the same folio cards as live evidence; only a sidebar “Offline Fallback” hint exists. That violates the plan’s demo-contamination guardrail.

Unused legacy UI: `SearchApparatus.tsx`, `FolioHeader.tsx`, `ScribeCommentaryPanel.tsx`.

## Tests and evaluation

- `tests/test_research_pipeline.py`: three unit tests (planner, RRF, verifier)
- `evaluation/evaluate_retrieval.py`: expected-type recall over `questions.jsonl` (file missing); no MRR/nDCG/citation coverage

## Guardrails already in code (keep)

- Retrieval-only answer when Gemini is unavailable
- Explicit refusal to invent a ruling when no passages are found
- Hadith grade as metadata, not a universal truth probability
- Source-quality weighting separate from cosine similarity
- Quran/Hadith kept atomic at chunk time
