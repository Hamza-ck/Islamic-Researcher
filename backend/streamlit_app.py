import os
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

# Page configuration
st.set_page_config(
    page_title="Islamic Research Tool — Scholarly Retrieval Engine",
    page_icon="📖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for rich aesthetics, Arabic calligraphy typography, and modern cards
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .main-title {
        font-size: 2.3rem;
        font-weight: 700;
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #d97706 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }

    .sub-title {
        color: #94a3b8;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }

    .arabic-text {
        font-family: 'Amiri', serif;
        font-size: 1.45rem;
        line-height: 2.2;
        direction: rtl;
        text-align: right;
        color: #f1f5f9;
        background: rgba(15, 23, 42, 0.6);
        padding: 1.2rem 1.5rem;
        border-radius: 12px;
        border-right: 4px solid #10b981;
        margin: 1rem 0;
    }

    .result-card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 14px;
        padding: 1.3rem;
        margin-bottom: 1.2rem;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .result-card:hover {
        border-color: rgba(16, 185, 129, 0.4);
        transform: translateY(-2px);
    }

    .badge {
        display: inline-block;
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .badge-quran {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-hadith {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .badge-tafsir {
        background: rgba(217, 119, 6, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(217, 119, 6, 0.3);
    }

    .grade-sahih {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
        border: 1px solid #10b981;
    }
    .grade-hasan {
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
        border: 1px solid #f59e0b;
    }
    .grade-weak {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
        border: 1px solid #ef4444;
    }

    .score-badge {
        font-size: 0.8rem;
        color: #94a3b8;
        background: rgba(15, 23, 42, 0.8);
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
    }

    .stButton>button {
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: white;
        font-weight: 600;
        border: none;
        border-radius: 10px;
        padding: 0.55rem 1.4rem;
        transition: all 0.2s ease;
    }
    .stButton>button:hover {
        background: linear-gradient(135deg, #047857 0%, #059669 100%);
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
        transform: translateY(-1px);
    }
</style>
""", unsafe_allow_html=True)


# Lazy loading of search and llm modules to keep initial load responsive
@st.cache_resource
def get_search_module():
    import search
    return search


@st.cache_resource
def get_llm_module():
    import llm
    return llm


def format_grade_html(grade: str) -> str:
    if not grade:
        return ""
    g_lower = grade.lower()
    if "sahih" in g_lower:
        return f'<span class="badge grade-sahih">🟢 Sahih ({grade})</span>'
    elif "hasan" in g_lower:
        return f'<span class="badge grade-hasan">🟡 Hasan ({grade})</span>'
    elif "da'if" in g_lower or "weak" in g_lower or "daif" in g_lower:
        return f'<span class="badge grade-weak">🔴 Da\'if ({grade})</span>'
    return f'<span class="badge" style="background: rgba(148,163,184,0.15); color: #cbd5e1;">⚪ {grade}</span>'


def render_source_card(i: int, r: dict):
    st_type = r.get("type", "source").lower()
    citation = r.get("citation", "Unknown Citation")
    arabic = r.get("arabic")
    text = r.get("text", "")
    score = r.get("score", 0.0)
    meta = r.get("metadata", {})
    score_pct = f"{score * 100:.1f}%"

    badge_class = f"badge-{st_type}" if st_type in ["quran", "hadith", "tafsir"] else "badge-quran"
    grade_html = format_grade_html(meta.get("grade_category", "")) if st_type == "hadith" else ""

    card_header = f"""
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
        <div>
            <span class="badge {badge_class}">{st_type.upper()}</span>
            <strong style="font-size: 1.1rem; margin-left: 0.5rem; color: #f8fafc;">{citation}</strong>
            {grade_html}
        </div>
        <span class="score-badge">Similarity: {score_pct}</span>
    </div>
    """

    arabic_html = f'<div class="arabic-text">{arabic}</div>' if arabic else ''

    chapter_info = ""
    if meta.get("chapter"):
        chapter_info = f'<div style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.5rem;">📖 <em>Chapter/Book:</em> {meta["chapter"]}</div>'

    st.markdown(f"""
    <div class="result-card">
        {card_header}
        {arabic_html}
        <div style="color: #e2e8f0; font-size: 0.98rem; line-height: 1.6; margin-top: 0.5rem;">
            {text}
        </div>
        {chapter_info}
    </div>
    """, unsafe_allow_html=True)


# Sidebar Configuration
with st.sidebar:
    st.image("https://img.icons8.com/color/96/quran.png", width=64)
    st.markdown("### 📖 Islamic Research Engine")
    st.caption("Multilingual Semantic Search & Grounded Scholarly AI")
    st.markdown("---")

    st.subheader("🔍 Search Filters")
    type_options = st.multiselect(
        "Source Corpus",
        options=["quran", "hadith", "tafsir"],
        default=["quran", "hadith", "tafsir"],
        format_func=lambda x: {"quran": "📖 Holy Quran", "hadith": "📜 Hadith Collections", "tafsir": "📚 Tafsir Ibn Kathir"}.get(x, x)
    )

    hadith_collections = st.multiselect(
        "Hadith Collections",
        options=["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "malik"],
        default=[],
        help="Leave empty to include all indexed hadith collections",
        format_func=lambda x: {
            "bukhari": "Sahih al-Bukhari",
            "muslim": "Sahih Muslim",
            "abudawud": "Sunan Abi Dawud",
            "tirmidhi": "Jami` at-Tirmidhi",
            "nasai": "Sunan an-Nasa'i",
            "ibnmajah": "Sunan Ibn Majah",
            "malik": "Muwatta Malik"
        }.get(x, x)
    )

    min_grade = st.selectbox(
        "Minimum Hadith Authenticity",
        options=["all", "sahih", "hasan", "weak"],
        index=0,
        format_func=lambda x: {
            "all": "All Grades (Sahih, Hasan, Da'if)",
            "sahih": "🟢 Sahih Only (Authentic)",
            "hasan": "🟡 Hasan & Above (Good)",
            "weak": "🔴 Include Weak (Da'if)"
        }.get(x, x)
    )

    top_k = st.slider("Max Results (top_k)", min_value=1, max_value=25, value=6)
    
    st.markdown("---")
    st.caption("⚡ Powered by Qdrant Vector Cloud, multilingual-e5 embeddings, and Gemini 3.6 Flash")


# Main Page Header
st.markdown('<div class="main-title">Islamic Research Tool</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">Semantic exploration across the Quran, Canonical Hadith with authentic grading, and Classical Tafsir</div>', unsafe_allow_html=True)

# Tabs
tab_search, tab_ask, tab_diagnostics = st.tabs([
    "🔍 Semantic Search",
    "🧠 Grounded AI Synthesis (/ask)",
    "⚙️ System Status & API"
])

# Tab 1: Semantic Vector Search
with tab_search:
    st.markdown("##### Search by meaning, concept, topic, or keyword")

    # Sample query chips
    sample_queries = [
        "Patience during hardship and trials",
        "Rights and obligations towards neighbors",
        "Actions are judged by intentions (Niyyah)",
        "The virtue of seeking beneficial knowledge",
        "Night of Decree (Laylat al-Qadr)"
    ]

    selected_sample = st.pills("Quick query examples:", sample_queries, selection_mode="single") if hasattr(st, "pills") else None

    col_q, col_btn = st.columns([5, 1])
    with col_q:
        default_val = selected_sample if selected_sample else ""
        query = st.text_input(
            "Enter research query",
            value=default_val,
            placeholder="e.g., patience during hardship, intention in deeds, treatment of parents...",
            label_visibility="collapsed"
        )
    with col_btn:
        search_clicked = st.button("Search Corpus", use_container_width=True)

    if (search_clicked or query) and query.strip():
        search_mod = get_search_module()
        with st.spinner("Searching indexed corpus across vector embeddings..."):
            coll_filter = [c.lower() for c in hadith_collections] if hadith_collections else None
            grade_filter = min_grade.lower() if min_grade != "all" else None
            types_filter = type_options if type_options else None

            results = search_mod.search(
                query=query.strip(),
                top_k=top_k,
                types=types_filter,
                collections=coll_filter,
                min_grade=grade_filter
            )

        if results:
            st.success(f"Found **{len(results)}** relevant passages for: *'{query}'*")
            for i, r in enumerate(results, 1):
                render_source_card(i, r)
        else:
            st.warning("🔍 No matching passages found. Try adjusting your filters or search keywords.")

# Tab 2: Grounded AI Synthesis
with tab_ask:
    st.markdown("##### Ask any scholarly question — Synthesized strictly from authentic retrieved texts")
    st.info("ℹ️ **Zero-Hallucination Policy**: Gemini is instructed to answer solely using the verified retrieved passages and cite every source.")

    ask_query = st.text_area(
        "Your Question:",
        placeholder="e.g., What are the core obligations and spiritual benefits of fasting according to the Quran and Hadith?",
        height=100
    )
    
    col_ask_topk, col_ask_btn = st.columns([3, 1])
    with col_ask_topk:
        ask_top_k = st.slider("Source passages to ground answer:", min_value=2, max_value=12, value=5)
    with col_ask_btn:
        st.write("")
        st.write("")
        synthesize_btn = st.button("Synthesize Answer", use_container_width=True)

    if synthesize_btn and ask_query.strip():
        search_mod = get_search_module()
        llm_mod = get_llm_module()

        with st.spinner("1/2: Retrieving authoritative source passages..."):
            passages = search_mod.search(query=ask_query.strip(), top_k=ask_top_k)

        if not passages:
            st.warning("No relevant passages could be retrieved to ground the answer.")
        else:
            with st.spinner("2/2: Synthesizing grounded scholarly answer with Gemini..."):
                try:
                    result = llm_mod.synthesize(ask_query.strip(), passages)
                    answer = result.answer
                    
                    st.markdown("### 📜 Grounded Synthesis")
                    st.markdown(f"""
                    <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; border-radius: 8px; padding: 1.2rem 1.5rem; margin-bottom: 1.5rem; line-height: 1.7; color: #f1f5f9;">
                    {answer}
                    </div>
                    """, unsafe_allow_html=True)

                    with st.expander(f"📚 View Retrieved Grounding Passages ({len(passages)})", expanded=False):
                        for i, p in enumerate(passages, 1):
                            render_source_card(i, p)

                except Exception as e:
                    st.error(f"Synthesis failed: {e}")

# Tab 3: System Status & API
with tab_diagnostics:
    st.markdown("### ⚙️ System & Server Diagnostics")
    
    col_stat1, col_stat2 = st.columns(2)
    
    with col_stat1:
        st.markdown("#### Database & Vectors")
        q_url = os.environ.get("QDRANT_URL", "Not configured")
        q_col = os.environ.get("QDRANT_COLLECTION", "Islamic_Researcher")
        emb = os.environ.get("EMBEDDING_MODEL", "intfloat/multilingual-e5-small")
        
        st.write(f"**Qdrant URL:** `{q_url[:35]}...`" if len(q_url) > 35 else f"**Qdrant URL:** `{q_url}`")
        st.write(f"**Target Collection:** `{q_col}`")
        st.write(f"**Embedding Model:** `{emb}`")
        
        if st.button("Test Qdrant Connection"):
            try:
                import qdrant_client
                c = qdrant_client.QdrantClient(url=q_url, api_key=os.environ.get("QDRANT_API_KEY", ""))
                cols = [col.name for col in c.get_collections().collections]
                st.success(f"Connected successfully! Collections found: {', '.join(cols)}")
            except Exception as e:
                st.error(f"Connection failed: {e}")

    with col_stat2:
        st.markdown("#### LLM & Synthesis")
        gemini_set = bool(os.environ.get("GEMINI_API_KEY"))
        gemini_model = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")
        st.write(f"**Gemini API Key:** {'Configured ✅' if gemini_set else 'Missing ⚠️'}")
        st.write(f"**Gemini Model:** `{gemini_model}`")
        
        if st.button("Test Gemini Heartbeat"):
            try:
                import google.generativeai as genai
                genai.configure(api_key=os.environ["GEMINI_API_KEY"])
                m = genai.GenerativeModel(gemini_model)
                res = m.generate_content("Ping test: reply with 'OK'")
                st.success(f"Gemini response: {res.text.strip()}")
            except Exception as e:
                st.error(f"Gemini test failed: {e}")

    st.markdown("---")
    st.markdown("#### 🔌 Available REST API Endpoints (FastAPI Backend)")
    st.code("""
# Semantic Search
POST /search
Content-Type: application/json
{"query": "patience during hardship", "top_k": 5, "types": ["quran", "hadith"]}

# Grounded AI Synthesis
POST /ask
Content-Type: application/json
{"query": "What are the virtues of charity?", "top_k": 5}
    """, language="bash")
