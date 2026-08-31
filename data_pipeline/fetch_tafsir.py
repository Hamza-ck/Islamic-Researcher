"""Fetch a classical tafsir (Quranic commentary), surah by surah (bulk endpoint,
so this is 114 requests total rather than one per ayah).
"""
import json
import requests

from config import TAFSIR_BASE_URL, TAFSIR_EDITION, TAFSIR_EDITION_LABEL, \
    TAFSIR_SURAH_COUNT, RAW_DIR


def fetch_surah(surah_no: int) -> list[dict]:
    url = f"{TAFSIR_BASE_URL}/{TAFSIR_EDITION}/{surah_no}.json"
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return r.json()


def main():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    out_path = RAW_DIR / "tafsir.jsonl"
    total = 0
    with open(out_path, "w", encoding="utf-8") as f:
        for surah_no in range(1, TAFSIR_SURAH_COUNT + 1):
            print(f"Fetching tafsir for surah {surah_no}/{TAFSIR_SURAH_COUNT}...")
            try:
                entries = fetch_surah(surah_no)
            except Exception as e:
                print(f"  WARNING: failed surah {surah_no}: {e}")
                continue
            for entry in entries:
                ayah = entry.get("ayah")
                text = (entry.get("text") or "").strip()
                if not text:
                    continue
                rec = {
                    "id": f"tafsir:{TAFSIR_EDITION}:{surah_no}:{ayah}",
                    "type": "tafsir",
                    "text": text,
                    "citation": f"{TAFSIR_EDITION_LABEL} on Quran {surah_no}:{ayah}",
                    "metadata": {
                        "edition": TAFSIR_EDITION,
                        "edition_label": TAFSIR_EDITION_LABEL,
                        "surah": surah_no,
                        "ayah": ayah,
                    },
                }
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
                total += 1
    print(f"\nSaved {total} tafsir entries -> {out_path}")


if __name__ == "__main__":
    main()
