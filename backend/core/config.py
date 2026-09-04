import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = BASE_DIR / 'backend'
DATA_DIR = BASE_DIR / 'data_pipeline'
CORPUS_PATH = Path(os.getenv('CORPUS_PATH', str(DATA_DIR / 'corpus.jsonl')))
SQLITE_PATH = Path(os.getenv('SQLITE_PATH', str(DATA_DIR / 'index.sqlite3')))
FAISS_PATH = Path(os.getenv('FAISS_PATH', str(DATA_DIR / 'index.faiss')))
EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'intfloat/multilingual-e5-base')
QDRANT_URL = os.getenv('QDRANT_URL', '')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY', '')
QDRANT_COLLECTION = os.getenv('QDRANT_COLLECTION', 'Islamic_Researcher')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')
LOCAL_LLM_MODEL = os.getenv('LOCAL_LLM_MODEL', '')
RETRIEVAL_CANDIDATES = int(os.getenv('RETRIEVAL_CANDIDATES', '40'))
RERANK_CANDIDATES = int(os.getenv('RERANK_CANDIDATES', '30'))
ALLOW_REMOTE_LLM = os.getenv('ALLOW_REMOTE_LLM', 'true').lower() == 'true'
