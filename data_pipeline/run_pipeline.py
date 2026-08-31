"""Run the full data pipeline: fetch sources -> build corpus -> embed & upload.

Usage:
    python run_pipeline.py              # fetch + build + embed/upload
    python run_pipeline.py --fetch-only # only fetch + build corpus (no Qdrant needed)
"""
import argparse
import subprocess
import sys

STEPS = ["fetch_quran.py", "fetch_hadith.py", "fetch_tafsir.py", "build_corpus.py"]


def run(script):
    print(f"\n=== Running {script} ===")
    result = subprocess.run([sys.executable, script])
    if result.returncode != 0:
        print(f"'{script}' failed, stopping.")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fetch-only", action="store_true",
                         help="Only fetch and build the corpus, skip embedding/upload")
    args = parser.parse_args()

    for step in STEPS:
        run(step)

    if not args.fetch_only:
        run("embed_and_upload.py")

    print("\nPipeline complete.")


if __name__ == "__main__":
    main()
