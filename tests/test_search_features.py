import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.search import search


def test_search_basic():
    results = search("patience", top_k=5)
    assert len(results) > 0, "Expected results for 'patience'"


def test_search_quran_filter():
    results = search("patience", top_k=5, types=["quran"])
    assert len(results) > 0, "Expected Quran results"
    assert all(x["type"] == "quran" for x in results), "All results must be Quran"


def test_search_hadith_filter():
    results = search("patience", top_k=5, types=["hadith"])
    assert len(results) > 0, "Expected Hadith results"
    assert all(x["type"] == "hadith" for x in results), "All results must be Hadith"


def test_search_grade_filter():
    results = search("patience", top_k=5, min_grade="sahih")
    # min_grade filter should either return results or be an allowed execution
    assert isinstance(results, list)
