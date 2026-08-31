"""Fetch hadith collections and save as structured records, preserving
per-scholar authenticity grading where the source provides it (e.g. Tirmidhi).
"""
import json
import requests

from config import HADITH_BASE_URL, HADITH_COLLECTIONS, RAW_DIR


def grade_category(grades: list[dict]) -> str:
    """Collapse per-scholar grade text into one coarse bucket for filtering.

    This is a simplified heuristic, NOT a scholarly determination -- the raw
    `grades` list is always kept alongside this in the record's metadata.
    """
    if not grades:
        return "unclassified"  # e.g. Bukhari/Muslim entries with no separate grade field
    text = " ".join(g.get("grade", "") for g in grades).lower()
    if "da" in text and ("if" in text or "eef" in text):  # da'if / daif / da'eef
        return "weak"
    if "hasan" in text and "sahih" not in text:
        return "hasan"
    if "sahih" in text:
        return "sahih"
    return "unclassified"


def fetch_collection(local_name: str, slug: str) -> list[dict]:
    url = f"{HADITH_BASE_URL}/{slug}.min.json"
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    data = r.json()
    sections = data["metadata"].get("sections", {})
    collection_title = data["metadata"].get("name", local_name)

    records = []
    for h in data["hadiths"]:
        book_no = h["reference"].get("book")
        section_name = sections.get(str(book_no), "")
        citation = f"{collection_title}, Book {book_no}"
        if section_name:
            citation += f" ({section_name})"
        citation += f", Hadith {h['reference'].get('hadith')}"

        records.append({
            "id": f"hadith:{local_name}:{h['hadithnumber']}",
            "type": "hadith",
            "text": h["text"],
            "citation": citation,
            "metadata": {
                "collection": local_name,
                "collection_title": collection_title,
                "book": book_no,
                "section": section_name,
                "hadithnumber": h["hadithnumber"],
                "grades": h.get("grades", []),
                "grade_category": grade_category(h.get("grades", [])),
            },
        })
    return records


def main():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    out_path = RAW_DIR / "hadith.jsonl"
    total = 0
    with open(out_path, "w", encoding="utf-8") as f:
        for local_name, slug in HADITH_COLLECTIONS.items():
            print(f"Fetching {local_name} ({slug})...")
            try:
                records = fetch_collection(local_name, slug)
            except Exception as e:
                print(f"  WARNING: failed to fetch {local_name}: {e}")
                continue
            for rec in records:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            total += len(records)
            print(f"  -> {len(records)} hadith")
    print(f"\nSaved {total} hadith total -> {out_path}")


if __name__ == "__main__":
    main()
