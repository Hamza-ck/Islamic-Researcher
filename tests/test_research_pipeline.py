import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; sys.path.insert(0,str(ROOT))
from backend.research.planner import plan
from backend.retrieval.hybrid import reciprocal_rank_fusion
from backend.generation.verifier import verify_answer

def test_plan(): assert plan('What is patience and prayer?')['subqueries']
def test_rrf():
    x=reciprocal_rank_fusion([[{'id':'a','text':'x','type':'quran'}],[{'id':'a','text':'x','type':'quran'},{'id':'b','text':'y','type':'hadith'}]])
    assert x[0]['id']=='a'
def test_verifier():
    s=[{'citation':'Quran 2:153','text':'Indeed Allah is with the patient'}]
    v=verify_answer('Patience is mentioned here (Quran 2:153).',s)
    assert v['score']>0
