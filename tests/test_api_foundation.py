import sys
from pathlib import Path

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.core.config import settings
from backend.core.index_meta import validate_index_metadata
from backend.main import app
from backend.models import EvidenceUnit, ResearchRequest, ResearchResponse

client = TestClient(app)


def test_health_shape():
    r = client.get('/health')
    assert r.status_code == 200
    body = r.json()
    assert 'embedding_model' in body
    assert body['embedding_model'] == settings.embedding_model
    assert 'reranker_enabled' in body
    assert 'index' in body
    assert 'remote_llm_configured' in body


def test_stats_and_root():
    assert client.get('/').status_code == 200
    r = client.get('/stats')
    assert r.status_code == 200
    assert r.json()['embedding_model'] == settings.embedding_model


def test_missing_source_404():
    r = client.get('/sources/does-not-exist-xyz')
    assert r.status_code == 404


def test_search_validation():
    r = client.post('/search', json={'query': ''})
    assert r.status_code == 422


def test_index_metadata_validator():
    report = validate_index_metadata()
    assert 'faiss_available' in report
    assert 'embedding_model_expected' in report
    assert report['embedding_model_expected'] == settings.embedding_model


def test_research_models_defaults():
    req = ResearchRequest(query='What is sabr?')
    assert req.mode == 'research'
    unit = EvidenceUnit(id='q:2:153', source_type='quran', text='...')
    assert unit.origin == 'internal'
    resp = ResearchResponse(research_id='r1', query='What is sabr?')
    assert resp.external_research_used is False
    assert 'not a probability' in resp.confidence.note.lower()
