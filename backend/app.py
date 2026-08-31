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

import gradio as gr
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import SearchRequest, SearchResponse, AskRequest, AskResponse
import search as search_module


def format_hadith_badge(grade: str) -> str:
    color_map = {
        "sahih": "🟢 Sahih (Authentic)",
        "hasan": "🟡 Hasan (Good)",
        "daif": "🔴 Da'if (Weak)",
        "weak": "🔴 Da'if (Weak)",
        "unclassified": "⚪ Unclassified"
    }
    return color_map.get(grade.lower(), f"⚪ {grade}")


@spaces.GPU
def gradio_search(query: str, types: list, collections: list, min_grade: str, top_k: int):
    if not query.strip():
        return "⚠️ Please enter a query to search."
    
    type_filter = types if types else None
    coll_filter = [c.lower() for c in collections] if collections else None
    grade_filter = min_grade.lower() if min_grade and min_grade != "all" else None

    results = search_module.search(
        query=query,
        top_k=int(top_k),
        types=type_filter,
        collections=coll_filter,
        min_grade=grade_filter
    )

    if not results:
        return "🔍 No matching passages found in the indexed corpus. Ensure data pipeline has been run."

    md_output = [f"### Found {len(results)} Ranked Passages for *'{query}'*\n"]
    for i, r in enumerate(results, 1):
        score_pct = f"{r.get('score', 0) * 100:.1f}%"
        source_type = r.get("type", "source").upper()
        citation = r.get("citation", "Unknown Source")
        arabic = r.get("arabic")
        text = r.get("text", "")
        meta = r.get("metadata", {})

        md_output.append(f"---")
        header = f"#### {i}. [{source_type}] {citation} `(Match: {score_pct})`"
        if r.get("type") == "hadith" and meta.get("grade_category"):
            header += f" — **{format_hadith_badge(meta['grade_category'])}**"
        md_output.append(header)

        if arabic:
            md_output.append(f"\n> <div dir='rtl' style='font-size: 1.25rem; font-family: serif; line-height: 2.0;'>{arabic}</div>\n")
        
        md_output.append(f"\n**Translation / Excerpt:**\n{text}\n")
        
        if meta.get("chapter"):
            md_output.append(f"*Chapter:* {meta['chapter']}")

    return "\n".join(md_output)


@spaces.GPU
def gradio_ask(query: str, top_k: int):
    if not query.strip():
        return "⚠️ Please enter a question.", ""
    
    passages = search_module.search(query=query, top_k=int(top_k))
    if not passages:
        return "No relevant passages were found in the indexed corpus.", ""

    try:
        import llm
        answer = llm.synthesize(query, passages)
    except Exception as e:
        answer = f"❌ LLM Synthesis Error: {e}"

    sources_md = [f"### 📚 Retrieved Sources ({len(passages)})\n"]
    for i, p in enumerate(passages, 1):
        sources_md.append(f"**{i}. {p.get('citation')}** ({p.get('type').upper()})")
        sources_md.append(f"> {p.get('text')}\n")

    return answer, "\n".join(sources_md)


def check_system_status():
    import qdrant_client
    q_url = os.environ.get("QDRANT_URL", "Not set")
    q_col = os.environ.get("QDRANT_COLLECTION", "Islamic_Researcher")
    gemini = "Configured ✅" if os.environ.get("GEMINI_API_KEY") else "Missing ⚠️"
    
    try:
        c = qdrant_client.QdrantClient(url=q_url, api_key=os.environ.get("QDRANT_API_KEY", ""))
        cols = [col.name for col in c.get_collections().collections]
        q_status = f"Connected ✅ (Collections: {', '.join(cols) if cols else 'None'})"
    except Exception as e:
        q_status = f"Disconnected ❌ ({e})"

    return f"""
### ⚙️ System & Server Diagnostics
- **Qdrant Vector Cluster**: `{q_url}`
- **Qdrant Connectivity**: {q_status}
- **Target Collection**: `{q_col}`
- **Embedding Model**: `{os.environ.get('EMBEDDING_MODEL', 'intfloat/multilingual-e5-small')}`
- **ZeroGPU Acceleration**: `{'Available (@spaces.GPU active) 🚀' if hasattr(spaces, '__file__') else 'Standard / CPU'}`
- **Gemini LLM API**: {gemini}

#### 🔌 REST API Endpoints:
- `POST /search` - Semantic Vector Search with metadata filtering
- `POST /ask` - Grounded AI synthesis with strict scholarly citations
- `GET /health` - Service heartbeat check
- `GET /docs` - Interactive OpenAPI Swagger documentation
"""


# Build the Gradio interface
with gr.Blocks(title="Islamic Research Engine") as demo:
    gr.Markdown("""
    # 📖 Islamic Research Tool — AI Engine & Vector Search
    ### Critical-Edition Scholarly Retrieval & Grounded Synthesis
    """)

    with gr.Tabs():
        with gr.TabItem("🔍 Vector Search"):
            with gr.Row():
                with gr.Column(scale=2):
                    query_input = gr.Textbox(
                        label="Research Query / Keyword / Concept",
                        placeholder="e.g., patience during hardship, intention in deeds, rights of neighbors...",
                        lines=2
                    )
                    with gr.Row():
                        types_input = gr.CheckboxGroup(
                            choices=["quran", "hadith", "tafsir"],
                            value=["quran", "hadith", "tafsir"],
                            label="Source Types"
                        )
                        min_grade_input = gr.Dropdown(
                            choices=["all", "sahih", "hasan", "weak"],
                            value="all",
                            label="Hadith Minimum Grade"
                        )
                    collections_input = gr.CheckboxGroup(
                        choices=["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "malik"],
                        value=[],
                        label="Hadith Collections Filter (optional)"
                    )
                    top_k_slider = gr.Slider(minimum=1, maximum=25, value=6, step=1, label="Results Count (top_k)")
                    search_btn = gr.Button("Search Corpus", variant="primary")

                with gr.Column(scale=3):
                    search_output = gr.Markdown(label="Ranked Citations & Passages")

            search_btn.click(
                fn=gradio_search,
                inputs=[query_input, types_input, collections_input, min_grade_input, top_k_slider],
                outputs=search_output
            )

        with gr.TabItem("🧠 Grounded AI Synthesis (/ask)"):
            with gr.Row():
                with gr.Column(scale=2):
                    ask_input = gr.Textbox(
                        label="Question for Grounded Synthesis",
                        placeholder="e.g., What are the virtues and obligations of fasting in Ramadan?",
                        lines=3
                    )
                    ask_top_k = gr.Slider(minimum=1, maximum=15, value=5, step=1, label="Source Passages to Provide LLM")
                    ask_btn = gr.Button("Synthesize Grounded Answer", variant="primary")

                with gr.Column(scale=3):
                    ask_output = gr.Markdown(label="Grounded Synthesis")
                    sources_output = gr.Markdown(label="Citations & Grounding Passages")

            ask_btn.click(
                fn=gradio_ask,
                inputs=[ask_input, ask_top_k],
                outputs=[ask_output, sources_output]
            )

        with gr.TabItem("📊 Status & API Specs"):
            status_output = gr.Markdown()
            refresh_status_btn = gr.Button("Check Connection Status")
            refresh_status_btn.click(fn=check_system_status, outputs=status_output)
            demo.load(fn=check_system_status, outputs=status_output)


# Attach CORS and FastAPI REST routes to the Gradio application
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@demo.app.get("/health")
def health_endpoint():
    return {"status": "ok"}


@demo.app.post("/search", response_model=SearchResponse)
def search_endpoint(req: SearchRequest):
    results = search_module.search(
        req.query, top_k=req.top_k, types=req.types,
        collections=req.collections, min_grade=req.min_grade,
    )
    return {"results": results}


@demo.app.post("/ask", response_model=AskResponse)
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


# Launch the server natively (Space runner executes demo.launch())
demo.launch(server_name="0.0.0.0", server_port=7860)
