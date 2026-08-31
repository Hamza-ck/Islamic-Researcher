"""Shared configuration for the data pipeline.

All source URLs point to free, open, no-API-key-required datasets, verified
working at time of writing:
  - Quran text:  https://github.com/fawazahmed0/quran-api
  - Hadith text: https://github.com/fawazahmed0/hadith-api
  - Tafsir text: https://github.com/spa5k/tafsir_api
"""
from pathlib import Path

# --- Source base URLs ---
QURAN_BASE_URL = "https://raw.githubusercontent.com/fawazahmed0/quran-api/1/editions"
HADITH_BASE_URL = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions"
TAFSIR_BASE_URL = "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir"

# --- Editions to pull (see each project's editions.json for more options) ---
QURAN_ARABIC_EDITION = "ara-quranuthmanihaf"    # Uthmani Hafs script
QURAN_ENGLISH_EDITION = "eng-abdullahyusufal"   # Yusuf Ali (public domain)

# Hadith collections to fetch: local_name -> API slug (English editions)
HADITH_COLLECTIONS = {
    "bukhari": "eng-bukhari",
    "muslim": "eng-muslim",
    "abudawud": "eng-abudawud",
    "tirmidhi": "eng-tirmidhi",
    "nasai": "eng-nasai",
    "ibnmajah": "eng-ibnmajah",
    "malik": "eng-malik",
}

TAFSIR_EDITION = "en-tafisr-ibn-kathir"   # classical tafsir, English translation
TAFSIR_EDITION_LABEL = "Tafsir Ibn Kathir"
TAFSIR_SURAH_COUNT = 114

# --- Chunking (only matters for long entries like tafsir) ---
MAX_CHUNK_CHARS = 1000
CHUNK_OVERLAP_CHARS = 150

# --- Paths ---
ROOT_DIR = Path(__file__).parent
RAW_DIR = ROOT_DIR / "raw"
CORPUS_PATH = ROOT_DIR / "corpus.jsonl"
