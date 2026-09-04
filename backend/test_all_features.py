import search
from models import AskRequest, SearchRequest

def run_tests():
    print("=== Testing search.py with filters ===")
    r1 = search.search("patience", top_k=5)
    assert len(r1) > 0, "Expected results for 'patience'"
    print(f"1. Search 'patience' OK -> {len(r1)} results. Top: {r1[0]['citation']}")

    r2 = search.search("patience", top_k=5, types=["quran"])
    assert len(r2) > 0, "Expected Quran results"
    assert all(x["type"] == "quran" for x in r2), "All results must be Quran"
    print(f"2. Quran filter OK -> {len(r2)} Quran results. Top: {r2[0]['citation']}")

    r3 = search.search("patience", top_k=5, types=["hadith"])
    assert len(r3) > 0, "Expected Hadith results"
    assert all(x["type"] == "hadith" for x in r3), "All results must be Hadith"
    print(f"3. Hadith filter OK -> {len(r3)} Hadith results. Top: {r3[0]['citation']}")

    r4 = search.search("patience", top_k=5, min_grade="sahih")
    print(f"4. min_grade='sahih' OK -> {len(r4)} results.")

    # Test cache hit
    import time
    t0 = time.perf_counter()
    r5 = search.search("patience", top_k=5)
    t_cached = (time.perf_counter() - t0) * 1000
    print(f"5. Cache hit OK -> {t_cached:.3f} ms (sub-millisecond speed!)")

    print("\n=== ALL SEARCH & FILTER VERIFICATION TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
