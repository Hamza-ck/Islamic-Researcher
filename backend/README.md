---
title: Islamic Research Tool Engine
emoji: 📖
colorFrom: green
colorTo: blue
sdk: gradio
sdk_version: 5.20.0
app_file: app.py
pinned: false
---

# Islamic Research Tool — Gradio & FastAPI Backend (ZeroGPU Ready)

A unified **Gradio interactive interface** and **FastAPI REST API** powered by Hugging Face **ZeroGPU** (`@spaces.GPU`) for vector similarity search and Gemini-grounded synthesis over Quran, Hadith (with authenticity grading), and classical tafsir.

## Hugging Face Spaces Setup

1. Create a new Space on [Hugging Face](https://huggingface.co/new-space):
   - **SDK**: Select **Gradio** -> **Blank**
   - **Space Hardware**: Select **ZeroGPU** (or Free CPU if ZeroGPU is not enabled for your tier)
2. In **Space Settings -> Variables and secrets -> New secret**, add:
   - `QDRANT_URL`: `https://<cluster-id>.gcp.cloud.qdrant.io`
   - `QDRANT_API_KEY`: `<your-qdrant-api-key>`
   - `QDRANT_COLLECTION`: `Islamic_Researcher` (or your collection name)
   - `EMBEDDING_MODEL`: `intfloat/multilingual-e5-small`
   - `GEMINI_API_KEY`: `<your-gemini-api-key>`
3. Upload / push all files in this `backend/` directory (`app.py`, `main.py`, `models.py`, `search.py`, `llm.py`, `requirements.txt`, `README.md`).

## Dual Functionality: Gradio UI + REST API

- **Interactive UI**: Visit your Space URL `https://<user>-<space>.hf.space` in a browser to test vector searches, hadith filters, and grounded synthesis visually.
- **REST Endpoints**:
  - `POST /search` — Fast multilingual vector retrieval with authenticity grade filtering.
  - `POST /ask` — Retrieval + strictly-grounded Gemini synthesis with citations.
  - `GET /health` — Service connectivity heartbeat.
  - `GET /docs` — Interactive OpenAPI Swagger UI.

### Example API Request:
```bash
curl -X POST https://<your-space>.hf.space/search \
  -H "Content-Type: application/json" \
  -d '{"query": "patience during hardship", "top_k": 5, "types": ["quran", "hadith"]}'
```

