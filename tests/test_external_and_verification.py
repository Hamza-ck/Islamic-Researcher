from backend.core.provenance import hit_to_evidence
from backend.core.research.external.source_filter import classify_external, filter_external
from backend.core.research.session import continue_research, run_research
from backend.core.verification import verify_research


def test_classify_and_filter_external():
    item1 = {
        'id': 'ext:1',
        'text': 'This is a long text about the Quran and Islamic ethics and patience in hardship.',
        'metadata': {'url': 'https://en.wikipedia.org/wiki/Patience_in_Islam'},
    }
    classification = classify_external(item1)
    assert classification['external_quality'] == 'encyclopedia'
    assert classification['topical'] is True
    assert classification['must_not_outrank_primary'] is True

    filtered = filter_external([item1])
    assert len(filtered) == 1
    assert filtered[0]['origin'] == 'external'
    assert filtered[0]['source_priority'] == 'external'


def test_filter_rejects_too_short():
    short_item = {'id': 'ext:2', 'text': 'Too short', 'metadata': {}}
    assert filter_external([short_item]) == []


def test_provenance_hit_to_evidence():
    raw_hit = {
        'id': 'q:2:153',
        'type': 'quran',
        'text': 'O you who have believed, seek help through patience and prayer.',
        'citation': 'Surah Al-Baqarah 2:153',
        'score': 0.95,
        'metadata': {'surah_number': 2, 'ayah_number': 153},
    }
    unit = hit_to_evidence(raw_hit)
    assert unit['id'] == 'q:2:153'
    assert unit['source_type'] == 'quran'
    assert unit['origin'] == 'internal'
    assert unit['reference'] == 'Surah Al-Baqarah 2:153'


def test_verify_research():
    sources = [
        {'id': 's1', 'citation': 'Quran 2:153', 'text': 'Indeed Allah is with the patient.'},
        {'id': 's2', 'citation': 'Bukhari 1', 'text': 'Actions are by intentions.'},
    ]
    answer = 'According to Quran 2:153, patience is commanded with prayer.'
    v = verify_research(answer, sources, 'patience')
    assert 'claims' in v
    assert 'score' in v
    assert 'status' in v


def test_continue_research_session():
    initial = run_research('What is sabr?', mode='quick')
    res_id = initial['research_id']

    continued = continue_research(res_id, 'Tell me more about its reward')
    assert continued is not None
    assert continued['research_id'] == res_id
    timeline_stages = [s['stage'] for s in continued['timeline']]
    assert 'continue' in timeline_stages
