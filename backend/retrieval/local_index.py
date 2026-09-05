import json, re, sqlite3
from pathlib import Path
from typing import Iterable
from backend.core.config import CORPUS_PATH, SQLITE_PATH

TOKEN_RE = re.compile(r"[\w\u0600-\u06ff]+", re.UNICODE)

def tokenize(text):
    return [x.lower() for x in TOKEN_RE.findall(text or '') if len(x) > 1]

def get_document(doc_id: str, db_path=SQLITE_PATH):
    if not Path(db_path).exists():
        ensure_db(db_path=db_path)
    if not Path(db_path).exists() or not doc_id:
        return None
    con = sqlite3.connect(db_path)
    try:
        row = con.execute(
            'SELECT id,type,citation,text,arabic,metadata FROM documents WHERE id=?',
            (doc_id,),
        ).fetchone()
    except sqlite3.Error:
        row = None
    con.close()
    if not row:
        return None
    rid, typ, cit, text, arabic, meta_json = row
    meta = json.loads(meta_json or '{}')
    return {
        'id': rid,
        'type': typ,
        'citation': cit,
        'text': text,
        'arabic': arabic,
        'metadata': meta,
        'score': 1.0,
        'origin': 'offline_demo' if meta.get('offline_demo') else 'internal',
        'source_priority': meta.get('source_priority', 'primary'),
    }


def ensure_db(corpus_path=CORPUS_PATH, db_path=SQLITE_PATH):
    if not Path(corpus_path).exists():
        return False
    db_path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(db_path)
    con.execute('CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, type TEXT, citation TEXT, text TEXT, arabic TEXT, metadata TEXT)')
    con.execute('CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(id UNINDEXED, text, citation, metadata)')
    count = con.execute('SELECT COUNT(*) FROM documents').fetchone()[0]
    if count == 0:
        with open(corpus_path, encoding='utf-8') as f:
            rows=[]
            for line in f:
                if not line.strip(): continue
                r=json.loads(line); rid=str(r.get('id',''))
                if not rid or not str(r.get('text','')).strip(): continue
                rows.append((rid,r.get('type','source'),r.get('citation','Unknown'),r['text'],r.get('arabic'),json.dumps(r.get('metadata',{}),ensure_ascii=False)))
            con.executemany('INSERT OR REPLACE INTO documents VALUES (?,?,?,?,?,?)', rows)
            con.executemany('INSERT INTO documents_fts(id,text,citation,metadata) VALUES (?,?,?,?)', [(r[0],r[3],r[2],r[5]) for r in rows])
            con.commit()
    con.close(); return True

def lexical_search(query, top_k=40, types=None, collections=None, min_grade=None, db_path=SQLITE_PATH):
    if not Path(db_path).exists(): ensure_db(db_path=db_path)
    if not Path(db_path).exists(): return []
    terms=tokenize(query)
    if not terms: return []
    match=' OR '.join('"'+t.replace('"','')+'"' for t in terms[:24])
    con=sqlite3.connect(db_path)
    try:
        rows=con.execute('SELECT d.id,d.type,d.citation,d.text,d.arabic,d.metadata,bm25(documents_fts) FROM documents_fts f JOIN documents d ON d.id=f.id WHERE documents_fts MATCH ? ORDER BY bm25(documents_fts) LIMIT ?', (match, max(top_k*4,80))).fetchall()
    except sqlite3.Error:
        rows=[]
    out=[]
    for rid,typ,cit,text,arabic,meta_json,bm in rows:
        meta=json.loads(meta_json or '{}')
        if types and typ not in types: continue
        if collections and meta.get('collection') not in collections: continue
        if min_grade and typ=='hadith' and __import__('backend.retrieval.quality',fromlist=['grade_rank']).grade_rank(meta.get('grade_category')) < __import__('backend.retrieval.quality',fromlist=['grade_rank']).grade_rank(min_grade): continue
        out.append({'id':rid,'type':typ,'citation':cit,'text':text,'arabic':arabic,'metadata':meta,'lexical_score':1/(1+max(float(bm),0.0))})
        if len(out)>=top_k: break
    con.close(); return out
