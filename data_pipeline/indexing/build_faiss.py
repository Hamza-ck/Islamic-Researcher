"""Build a local FAISS index. Optional: requires faiss-cpu + sentence-transformers."""
import os
import sys
import json
from pathlib import Path

PIPELINE_DIR = Path(__file__).resolve().parents[1]
if str(PIPELINE_DIR) not in sys.path:
    sys.path.insert(0, str(PIPELINE_DIR))
WORKSPACE_DIR = Path(__file__).resolve().parents[2]
if str(WORKSPACE_DIR) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_DIR))

try:
    from config import CORPUS_PATH
except ImportError:
    from data_pipeline.config import CORPUS_PATH

def main():
    import argparse
    import faiss
    import torch
    from sentence_transformers import SentenceTransformer

    parser = argparse.ArgumentParser(description="Build FAISS index for Islamic Researcher corpus")
    parser.add_argument("--batch-size", type=int, default=128, help="Batch size for sentence encoding")
    parser.add_argument("--chunk-size", type=int, default=2000, help="Passages per checkpoint commit")
    parser.add_argument("--max-passages", type=int, default=0, help="Limit total passages to index (0 = all)")
    args = parser.parse_args()

    model_name = os.environ.get('EMBEDDING_MODEL', 'intfloat/multilingual-e5-base')
    print(f"Loading embedding model: {model_name}...")
    model = SentenceTransformer(model_name)
    if not Path(CORPUS_PATH).exists():
        raise FileNotFoundError(f"Corpus not found at {CORPUS_PATH}. Run build_corpus.py first.")

    records = [json.loads(x) for x in open(CORPUS_PATH, encoding='utf-8') if x.strip()]
    total_records = len(records)
    if args.max_passages and args.max_passages < total_records:
        total_records = args.max_passages
        records = records[:total_records]

    out = Path(CORPUS_PATH).with_name('index.faiss')
    start_idx = 0
    index = None

    if out.exists():
        try:
            existing = faiss.read_index(str(out))
            if existing.ntotal < total_records:
                index = existing
                start_idx = existing.ntotal
                print(f"Resuming existing index: {start_idx}/{total_records} passages already indexed.")
            elif existing.ntotal >= total_records:
                print(f"Index at {out} is already complete ({existing.ntotal} vectors).")
                return
        except Exception as e:
            print(f"Could not load existing index ({e}), starting fresh.")
            index = None

    print(f"Building FAISS index for {total_records} passages starting at {start_idx}...")
    with torch.inference_mode():
        for i in range(start_idx, total_records, args.chunk_size):
            end_idx = min(i + args.chunk_size, total_records)
            batch = records[i:end_idx]
            texts = ['passage: ' + r['text'] for r in batch]
            vectors = model.encode(texts, batch_size=args.batch_size, normalize_embeddings=True, show_progress_bar=True)
            if index is None:
                index = faiss.IndexFlatIP(vectors.shape[1])
            index.add(vectors)
            faiss.write_index(index, str(out))
            print(f"Committed checkpoint: {index.ntotal}/{total_records} passages indexed ({index.ntotal*100/total_records:.1f}%) -> {out}")

    print(f"FAISS index build complete: {index.ntotal} vectors written to {out}")

if __name__ == '__main__':
    main()


