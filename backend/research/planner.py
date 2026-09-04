import re

def detect_language(query):
    if any('\u0600'<=c<='\u06ff' for c in query): return 'arabic_or_urdu'
    if any('\u0900'<=c<='\u097f' for c in query): return 'hindi'
    return 'roman_urdu' if sum(w in {'kya','hai','mein','ke','ka','ki','aur','ko','kaise','kab','se'} for w in query.lower().split())>=2 else 'english'

def plan(query):
    parts=[p.strip() for p in re.split(r'\?|\band\b|\bvs\b|\bversus\b|،|;',query,flags=re.I) if p.strip()]
    subqueries=[]
    for p in parts[:4]:
        if p not in subqueries: subqueries.append(p)
    if not subqueries: subqueries=[query]
    return {'language':detect_language(query),'subqueries':subqueries,'source_tracks':['quran','hadith','tafsir','scholar']}
