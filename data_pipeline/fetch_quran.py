"""Fetch Quran text (Arabic + English translation), verse by verse."""
import json
import requests

from config import QURAN_BASE_URL, QURAN_ARABIC_EDITION, QURAN_ENGLISH_EDITION, RAW_DIR


def fetch_edition(slug: str) -> list[dict]:
    url = f"{QURAN_BASE_URL}/{slug}.min.json"
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return r.json()["quran"]


def main():
    print(f"Fetching Arabic edition: {QURAN_ARABIC_EDITION}")
    arabic = fetch_edition(QURAN_ARABIC_EDITION)
    print(f"Fetching English edition: {QURAN_ENGLISH_EDITION}")
    english = fetch_edition(QURAN_ENGLISH_EDITION)

    if len(arabic) != len(english):
        raise RuntimeError("Edition verse counts don't match -- check edition slugs")

    records = []
    for ar, en in zip(arabic, english):
        if ar["chapter"] != en["chapter"] or ar["verse"] != en["verse"]:
            raise RuntimeError(f"Verse misalignment at {ar} vs {en}")
        surah, ayah = ar["chapter"], ar["verse"]
        records.append({
            "id": f"quran:{surah}:{ayah}",
            "type": "quran",
            "text": en["text"],
            "arabic": ar["text"],
            "citation": f"Quran {surah}:{ayah}",
            "metadata": {
                "surah": surah,
                "ayah": ayah,
                "translation_edition": QURAN_ENGLISH_EDITION,
                "arabic_edition": QURAN_ARABIC_EDITION,
            },
        })

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    out_path = RAW_DIR / "quran.jsonl"
    with open(out_path, "w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(f"Saved {len(records)} ayat -> {out_path}")


if __name__ == "__main__":
    main()
