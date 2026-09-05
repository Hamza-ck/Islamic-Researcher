# Architecture

Primary principle: optimize for the most **traceable, source-aware, evidence-backed** answer. When evidence is insufficient, say so.

```
USER QUERY
  -> query understanding (language, intent, entities, subqueries)
  -> internal Islamic research (Qur'an, Hadith, Tafsir, scholars)
  -> hybrid retrieval (FTS5 + FAISS + metadata filters)
  -> RRF + source-aware scoring + optional cross-encoder
  -> evidence sufficiency
       SUFFICIENT  -> claims -> verify -> answer
       CONFLICTED  -> disagreement analysis -> answer
       INSUFFICIENT / LOW_QUALITY -> optional external acquisition
  -> merge ResearchState -> claim/evidence graph -> final verification -> result
```

Zero-budget stack: FastAPI, SQLite FTS5, FAISS, Sentence Transformers, optional Hugging Face reranker, optional Gemini or local LLM, React + TypeScript.

See `docs/MIGRATION.md` for how the current repo moves toward this flow.
