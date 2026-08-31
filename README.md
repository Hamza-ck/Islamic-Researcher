# Islamic Research Tool

A retrieval-based research/search tool over the Quran, Hadith (with authenticity
grading preserved), and classical tafsir (commentary) — built on a 100% free-tier
cloud stack.

## Architecture

```
Data sources (free, no API key)          Data pipeline (run once, or whenever
  - Quran (Arabic + translation)           you add sources)
  - Hadith (Bukhari, Muslim, etc.)   -->    fetch -> chunk -> embed -> upload
  - Tafsir Ibn Kathir                              (Google Colab, free GPU)
                                                          |
                                                          v
                                                   Qdrant Cloud (free 1GB)
                                                          |
Query flow:                                              v
  React frontend  -->  FastAPI backend (HF Spaces)  -->  vector search
                              |                           + grade filters
                              v
                     Gemini API (free tier, optional)
                     synthesizes an answer strictly
                     from retrieved passages, always
                     citing sources
```

Retrieval (`/search`) never hallucinates — it returns the actual indexed text.
Generation (`/ask`) is a thin, strictly-grounded layer on top, and always
returns its sources alongside the answer.

## Project layout

- `data_pipeline/` — fetches Quran/Hadith/Tafsir from open datasets, chunks and
  embeds them, uploads to Qdrant Cloud. Run this first.
- `backend/` — FastAPI app exposing `/search` and `/ask`, deployable as a
  Hugging Face Space (Docker SDK).
- `frontend/` — "The Folio" React + TypeScript + Tailwind CSS critical-edition manuscript interface.

## Setup order

### 1. Create free accounts
- **Qdrant Cloud**: https://cloud.qdrant.io — create a free cluster, copy its
  URL and API key.
- **Google AI Studio**: https://aistudio.google.com — generate a free Gemini
  API key (only needed for `/ask`, not for `/search`).
- **Hugging Face**: https://huggingface.co — create an account to host the
  backend as a Space.

### 2. Run the data pipeline
```bash
cd data_pipeline
pip install -r requirements.txt
cp .env.example .env   # fill in QDRANT_URL and QDRANT_API_KEY
python run_pipeline.py
```
This fetches ~6,236 Quran verses, ~7 major hadith collections, and Tafsir Ibn
Kathir (114 surahs), chunks long entries, embeds everything with a free
multilingual model, and uploads it to your Qdrant Cloud cluster.

**Recommended: run this in Google Colab** (free GPU makes embedding much
faster) — upload this whole folder, or just the `data_pipeline/` directory,
then run the same commands in a Colab cell. CPU-only also works fine, just
slower.

To do a quick smoke test first without needing Qdrant, run:
```bash
python fetch_quran.py && python fetch_hadith.py && python fetch_tafsir.py && python build_corpus.py
```
and inspect `data_pipeline/corpus.jsonl` before spending time on the embedding step.

### 3. Deploy the backend
See `backend/README.md` for Hugging Face Spaces setup (it's short — mostly
adding secrets and pushing the folder).

### 4. Test it
```bash
curl -X POST https://<your-space>.hf.space/search \
  -H "Content-Type: application/json" \
  -d '{"query": "patience during hardship", "top_k": 5}'
```

### 5. Run the frontend ("The Folio")
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with "The Folio". You can test immediately using the embedded authentic manuscript corpus or connect directly to your live FastAPI backend or Hugging Face Space via the top-right apparatus settings.

### 6. Run the Streamlit App
You can also launch the Streamlit research interface:
```bash
cd backend
streamlit run streamlit_app.py --server.port 8502
```
or double-click `run_streamlit.bat` in the root folder.
Open `http://localhost:8502` to access the full semantic search, grounded AI synthesis, and diagnostics dashboard.


## Important notes on the data

- Sources are open datasets maintained by third parties
  ([fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api),
  [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api),
  [spa5k/tafsir_api](https://github.com/spa5k/tafsir_api)). Check each
  project's license before any commercial or public deployment.
- Hadith authenticity grading (`grade_category` in the metadata) is a
  **simplified heuristic** built from the scholars' raw grade text, meant only
  for coarse filtering (e.g. "show sahih only"). It is not a scholarly
  determination — the raw per-scholar grades are preserved in
  `metadata.grades` and should always be shown to the end user alongside any
  filtered view.
- The default English Quran translation is Yusuf Ali (public domain). The
  default tafsir is Ibn Kathir. Both are configurable in
  `data_pipeline/config.py`.
