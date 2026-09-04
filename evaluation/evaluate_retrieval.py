import json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from backend.search import search

def main():
    rows=[json.loads(x) for x in open(Path(__file__).with_name('questions.jsonl'),encoding='utf-8') if x.strip()]
    for r in rows:
        hits=search(r['query'],10); types={h['type'] for h in hits}; expected=set(r['expected_types'])
        print(json.dumps({'query':r['query'],'hit_count':len(hits),'expected_type_recall':round(len(types&expected)/max(1,len(expected)),3)} ,ensure_ascii=False))
if __name__=='__main__':main()
