from backend.core.research.sufficiency import classify_sufficiency
from backend.core.routing.rules import route_sources
from backend.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_sufficiency_empty():
    s = classify_sufficiency('what is iman?', [])
    assert s['status'] == 'insufficient'


def test_sufficiency_conflicted():
    hits = [
        {'id': '1', 'type': 'quran', 'score': 0.8, 'metadata': {}},
        {'id': '2', 'type': 'tafsir', 'score': 0.7, 'metadata': {}},
        {'id': '3', 'type': 'hadith', 'score': 0.7, 'metadata': {}},
    ]
    s = classify_sufficiency('scholar A vs scholar B on this ruling', hits)
    assert s['status'] == 'conflicted'


def test_router_keyword_boost():
    r = route_sources('hadith in sahih bukhari about intention')
    assert r['hadith_weight'] > r['tafsir_weight']
    assert r['router'] == 'rules_v1'


def test_research_endpoint_without_corpus():
    r = client.post('/research', json={'query': 'What is sabr in the Quran?', 'mode': 'quick'})
    assert r.status_code == 200
    body = r.json()
    assert body['research_id']
    assert body['sufficiency']['status'] in {'insufficient', 'low_quality', 'sufficient', 'conflicted'}
    assert 'not a probability' in body['confidence']['note'].lower()
    got = client.get(f"/research/{body['research_id']}")
    assert got.status_code == 200
    assert got.json()['research_id'] == body['research_id']


def test_research_missing_404():
    assert client.get('/research/not-a-real-session').status_code == 404
