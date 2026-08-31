"""Embed corpus.jsonl with a multilingual sentence-transformers model and
upload to Qdrant Cloud.

Run this once to build the searchable index (best done in Google Colab with a
free GPU for speed -- CPU also works, just slower). Re-run after adding new
sources to corpus.jsonl; existing IDs are upserted, not duplicated.
"""
import json
import os
import uuid
from itertools import islice

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

from config import CORPUS_PATH

load_dotenv()

QDRANT_URL = os.environ["QDRANT_URL"]
QDRANT_API_KEY = os.environ["QDRANT_API_KEY"]
COLLECTION_NAME = os.environ.get("QDRANT_COLLECTION", "islamic_corpus")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "intfloat/multilingual-e5-base")
BATCH_SIZE = 64


def batched(iterable, n):
    it = iter(iterable)
    while chunk := list(islice(it, n)):
        yield chunk


def load_corpus():
    with open(CORPUS_PATH, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def main():
    print(f"Loading embedding model: {EMBEDDING_MODEL}")
    model = SentenceTransformer(EMBEDDING_MODEL)
    dim = model.get_sentence_embedding_dimension()

    records = load_corpus()
    print(f"Loaded {len(records)} chunks from {CORPUS_PATH}")

    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    if not client.collection_exists(COLLECTION_NAME):
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )
        print(f"Created Qdrant collection '{COLLECTION_NAME}' (dim={dim})")

    uploaded = 0
    for batch in batched(records, BATCH_SIZE):
        # e5 models expect a "passage: " prefix on indexed text for best results
        texts = [f"passage: {r['text']}" for r in batch]
        vectors = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)

        points = [
            PointStruct(
                id=str(uuid.uuid5(uuid.NAMESPACE_URL, rec["id"])),
                vector=vec.tolist(),
                payload=rec,
            )
            for rec, vec in zip(batch, vectors)
        ]
        client.upsert(collection_name=COLLECTION_NAME, points=points)
        uploaded += len(points)
        print(f"  uploaded {uploaded}/{len(records)}")

    print(f"\nDone. {uploaded} chunks indexed in Qdrant collection '{COLLECTION_NAME}'.")


if __name__ == "__main__":
    main()
