# Migration Plan

Do **not** blindly rewrite working retrieval, chunking, or generation. Promote the existing modular monolith toward the plan’s architecture in phases. Keep `/search` and `/ask` working until the frontend is switched to `/research`.

## Target layout (incremental)

```
backend/
  main.py                 # stays the API surface
  models.py               # request/response contracts
  core/
    config.py             # single settings object
    query/                # NEW: analyze, normalize, decompose
    routing/              # NEW: rule fallback + small neural router
    research/             # NEW: ResearchState, sufficiency, external/
    verification/         # migrate generation/verifier.py, add claims
    provenance/           # NEW
    generation/           # migrate generation/llm.py (later)
  retrieval/              # KEEP until tests cover it; then re-export from core
data_pipeline/            # KEEP fetch/chunk; add validation + index metadata
frontend/src/             # Research Workspace; label mock data
evaluation/               # Recall@k, MRR, nDCG, citation metrics
```

Existing `backend/retrieval/*` remains the implementation of hybrid search. New research/session/sufficiency/external code is added beside it, then wired through the API.

## Compatibility rules

1. One embedding model: `EMBEDDING_MODEL` (default `intfloat/multilingual-e5-base`) in backend and pipeline.
2. One Qdrant collection default: `Islamic_Researcher`.
3. Gemini remains optional. Local/retrieval-only must work without a key.
4. Vector similarity is never presented as probability of religious truth.
5. Hadith grades stay per-authority metadata; do not collapse into a single truth label.
6. Mock/offline corpus must be labeled `OFFLINE DEMO DATA` in API metadata and UI.
7. External evidence never outranks curated primary sources by default.

## Phase map

| Phase | Status | Notes |
|-------|--------|--------|
| 0 Audit + docs | Done | `CURRENT_STATE.md`, this file, `architecture.md` |
| 1 Backend foundation | Done | Settings object, logging, health/index metadata, `/stats`, `/sources/{id}` |
| 2 Canonical data model | In progress | `EvidenceUnit` + `core/provenance.py` mapper; pipeline original/normalized still pending |
| 3 Data pipeline | Pending | Validation, duplicate detection, deterministic indexes |
| 4 Hybrid retrieval | Mostly done | Add filters/caching polish; keep FTS5+FAISS+RRF |
| 5 Neural retrieval | Partial | Reranker exists; rule router `core/routing/rules.py`; neural net pending |
| 6 Research engine | Partial | Persisted JSON `ResearchState`; `POST /research` + continue |
| 7 Sufficiency | Partial | Transparent rules in `core/research/sufficiency.py` |
| 8 External research | Missing | Pluggable web + YouTube interfaces |
| 9 Verification | Partial | Claims, matching, contradictions |
| 10 Generation | Partial | Local LLM adapter; keep Gemini optional |
| 11 API | Partial | `/research`, `/research/{id}`, `/continue`, `/verify`, `/sources/{id}`, `/stats` live; `/ask` kept |
| 12–14 Frontend | Missing | Research Workspace |
| 15–16 Eval + tests | Thin | Expand pytest + evaluation set |
| 17–18 Performance + deploy | Partial | Cache exists; CI/docs remaining |
| 19 Documentation | Partial | README exists; licensing/architecture remaining |
| 20 Acceptance | Pending | E2E scenarios in the PDF |

## After each major phase

Run `python -m pytest tests -q` and fix regressions before starting the next phase. Do not delete Streamlit until a replacement path and tests exist (can mark leftover in docs; remove once Research Workspace ships).
