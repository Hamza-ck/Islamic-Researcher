"""Optional utility script to purge the 415 empty-text records from Qdrant Cloud.

Run this script if you wish to permanently remove points with empty text payloads
from the Qdrant Cloud collection.
"""
import os
import json
from pathlib import Path
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()

QDRANT_URL = os.environ["QDRANT_URL"]
QDRANT_API_KEY = os.environ["QDRANT_API_KEY"]
COLLECTION_NAME = os.environ.get("QDRANT_COLLECTION", "Islamic_Researcher")

EMPTY_JSON_PATH = Path(__file__).parent.parent / "backend" / "empty_points.json"


def main():
    if not EMPTY_JSON_PATH.exists():
        print(f"Error: Could not find {EMPTY_JSON_PATH}")
        return

    with open(EMPTY_JSON_PATH, "r", encoding="utf-8") as f:
        empty_ids = json.load(f)

    print(f"Loaded {len(empty_ids)} point IDs to remove from {COLLECTION_NAME} on Qdrant Cloud.")
    confirm = input("Are you sure you want to delete these 415 empty points? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("Aborted.")
        return

    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    res = client.delete(collection_name=COLLECTION_NAME, points_selector=empty_ids)
    print(f"Deletion complete. Result: {res}")


if __name__ == "__main__":
    main()
