import argparse,subprocess,sys
from pathlib import Path

def run(script):
    r=subprocess.run([sys.executable,script], cwd=Path(__file__).resolve().parent);
    if r.returncode: raise SystemExit(r.returncode)

p=argparse.ArgumentParser(); p.add_argument('--fetch-only',action='store_true'); p.add_argument('--local-index',action='store_true'); a=p.parse_args()
for s in ['fetch_quran.py','fetch_hadith.py','fetch_tafsir.py','fetch_scholars.py']: run(s)
run('build_corpus.py')
if a.local_index: run('indexing/build_faiss.py')
