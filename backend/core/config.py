import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = BASE_DIR / 'backend'
DATA_DIR = BASE_DIR / 'data_pipeline'


def _bool(name: str, default: str = 'false') -> bool:
    return os.getenv(name, default).strip().lower() in {'1', 'true', 'yes', 'on'}


def _int(name: str, default: str) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return int(default)


class Settings:
    """Single environment surface for backend + index builders."""

    corpus_path: Path
    sqlite_path: Path
    faiss_path: Path
    faiss_meta_path: Path
    embedding_model: str
    qdrant_url: str
    qdrant_api_key: str
    qdrant_collection: str
    gemini_model: str
    gemini_api_key: str
    local_llm_model: str
    retrieval_candidates: int
    rerank_candidates: int
    enable_reranker: bool
    reranker_model: str
    allow_remote_llm: bool
    log_level: str

    def __init__(self) -> None:
        self.corpus_path = Path(os.getenv('CORPUS_PATH', str(DATA_DIR / 'corpus.jsonl')))
        self.sqlite_path = Path(os.getenv('SQLITE_PATH', str(DATA_DIR / 'index.sqlite3')))
        self.faiss_path = Path(os.getenv('FAISS_PATH', str(DATA_DIR / 'index.faiss')))
        self.faiss_meta_path = Path(os.getenv('FAISS_META_PATH', str(self.faiss_path.with_name('index.meta.json'))))
        self.embedding_model = os.getenv('EMBEDDING_MODEL', 'intfloat/multilingual-e5-base')
        self.qdrant_url = os.getenv('QDRANT_URL', '')
        self.qdrant_api_key = os.getenv('QDRANT_API_KEY', '')
        self.qdrant_collection = os.getenv('QDRANT_COLLECTION', 'Islamic_Researcher')
        self.gemini_model = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY', '')
        self.local_llm_model = os.getenv('LOCAL_LLM_MODEL', '')
        self.retrieval_candidates = _int('RETRIEVAL_CANDIDATES', '40')
        self.rerank_candidates = _int('RERANK_CANDIDATES', '30')
        self.enable_reranker = _bool('ENABLE_RERANKER', 'false')
        self.reranker_model = os.getenv('RERANKER_MODEL', 'BAAI/bge-reranker-base')
        self.allow_remote_llm = _bool('ALLOW_REMOTE_LLM', 'true')
        self.enable_neural_router = _bool('ENABLE_NEURAL_ROUTER', 'false')
        self.enable_external_search = _bool('ENABLE_EXTERNAL_SEARCH', 'false')
        self.external_request_timeout = _int('EXTERNAL_REQUEST_TIMEOUT', '8')
        self.log_level = os.getenv('LOG_LEVEL', 'INFO').upper()

    def index_fingerprint(self) -> dict:
        return {
            'embedding_model': self.embedding_model,
            'corpus_path': str(self.corpus_path),
            'faiss_path': str(self.faiss_path),
        }


settings = Settings()

# Backward-compatible aliases for existing imports.
CORPUS_PATH = settings.corpus_path
SQLITE_PATH = settings.sqlite_path
FAISS_PATH = settings.faiss_path
FAISS_META_PATH = settings.faiss_meta_path
EMBEDDING_MODEL = settings.embedding_model
QDRANT_URL = settings.qdrant_url
QDRANT_API_KEY = settings.qdrant_api_key
QDRANT_COLLECTION = settings.qdrant_collection
GEMINI_MODEL = settings.gemini_model
LOCAL_LLM_MODEL = settings.local_llm_model
RETRIEVAL_CANDIDATES = settings.retrieval_candidates
RERANK_CANDIDATES = settings.rerank_candidates
ALLOW_REMOTE_LLM = settings.allow_remote_llm
ENABLE_RERANKER = settings.enable_reranker
RERANKER_MODEL = settings.reranker_model
ENABLE_NEURAL_ROUTER = settings.enable_neural_router
ENABLE_EXTERNAL_SEARCH = settings.enable_external_search
