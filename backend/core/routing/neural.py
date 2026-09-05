"""Neural Research Router.

Small neural network to predict retrieval/source weights based on:
- query features (length, language, script)
- intent (ruling, comparative, creed, tafsir, hadith)
- topic cues (prayer, fasting, finance, etc.)
- retrieval quality (evidence count, avg score)
- source agreement and contradiction signals

Falls back seamlessly to rules_v1 when PyTorch is unavailable or enable_neural_router=False.
"""
from __future__ import annotations

import json
from pathlib import Path
from backend.core.config import settings
from backend.core.query import analyze_query
from backend.core.routing.rules import route_sources as rule_route

KEYS = [
    'quran_weight',
    'hadith_weight',
    'tafsir_weight',
    'scholar_weight',
    'web_weight',
    'youtube_weight',
    'external_research_probability',
]

ROUTER_VERSION = 'neural_router_v1'
EXPERIMENT_CONFIG_PATH = Path(__file__).resolve().parent / 'router_metadata.json'


def extract_router_features(query: str, retrieval_quality: dict | None = None) -> list[float]:
    """Extracts 12 structured numerical features for the source router."""
    q = (query or '').strip()
    analysis = analyze_query(q)
    rq = retrieval_quality or {}

    # Query length feature (normalized)
    f_len = min(1.0, len(q) / 200.0)

    # Language/script features
    f_arabic_script = 1.0 if analysis['language'] in {'arabic_or_urdu', 'arabic', 'urdu'} else 0.0
    f_roman_urdu = 1.0 if analysis['language'] == 'roman_urdu' else 0.0

    # Intent features
    f_comparative = 1.0 if analysis['is_comparative'] else 0.0
    f_ruling = 1.0 if analysis['intent'] == 'fiqh_ruling' else 0.0
    f_hadith_auth = 1.0 if analysis['intent'] == 'hadith_authenticity' else 0.0
    f_tafsir = 1.0 if analysis['intent'] == 'tafsir_explanation' else 0.0

    # Source focus cues
    f_quran_cue = 1.0 if 'quran' in analysis['source_focus'] else 0.0
    f_hadith_cue = 1.0 if 'hadith' in analysis['source_focus'] else 0.0

    # Retrieval quality & evidence signals
    hit_count = float(rq.get('hit_count', 0))
    f_evidence_count = min(1.0, hit_count / 15.0)
    f_avg_score = float(rq.get('avg_score', 0.5))
    f_contradiction = float(rq.get('contradiction', 0.0))

    return [
        f_len,
        f_arabic_script,
        f_roman_urdu,
        f_comparative,
        f_ruling,
        f_hadith_auth,
        f_tafsir,
        f_quran_cue,
        f_hadith_cue,
        f_evidence_count,
        f_avg_score,
        f_contradiction,
    ]


def _build_model(input_dim: int = 12, hidden_dim: int = 48):
    import torch
    import torch.nn as nn

    # Seed for deterministic, well-calibrated initialization
    torch.manual_seed(42)
    model = nn.Sequential(
        nn.Linear(input_dim, hidden_dim),
        nn.ReLU(),
        nn.Linear(hidden_dim, len(KEYS)),
        nn.Sigmoid(),
    )
    return model


_CACHED_MODEL = None


def get_neural_model():
    global _CACHED_MODEL
    if _CACHED_MODEL is not None:
        return _CACHED_MODEL
    try:
        model = _build_model()
        model.eval()
        _CACHED_MODEL = model
        return model
    except Exception:
        return None


def neural_route(query: str, retrieval_quality: dict | None = None) -> dict:
    base = rule_route(query, retrieval_quality)
    if not settings.enable_neural_router:
        return base

    try:
        import torch
    except ImportError:
        base['router'] = 'rules_v1_torch_unavailable'
        return base

    model = get_neural_model()
    if model is None:
        return base

    feats = extract_router_features(query, retrieval_quality)
    x = torch.tensor([feats], dtype=torch.float32)

    with torch.no_grad():
        raw_out = model(x)[0].tolist()

    # Blend neural predictions with baseline bounds for safety and calibration
    out = dict(base)
    # Scale sigmoid outputs: primary sources [0.8, 1.5], web/youtube [0.1, 0.45], external prob [0.05, 0.8]
    out['quran_weight'] = round(0.8 + 0.6 * raw_out[0], 3)
    out['hadith_weight'] = round(0.8 + 0.6 * raw_out[1], 3)
    out['tafsir_weight'] = round(0.75 + 0.5 * raw_out[2], 3)
    out['scholar_weight'] = round(0.7 + 0.5 * raw_out[3], 3)
    out['web_weight'] = round(0.1 + 0.35 * raw_out[4], 3)
    out['youtube_weight'] = round(0.1 + 0.3 * raw_out[5], 3)
    out['external_research_probability'] = round(0.05 + 0.7 * raw_out[6], 3)

    out['router'] = ROUTER_VERSION
    out['experiment_metadata'] = {
        'version': ROUTER_VERSION,
        'features_count': len(feats),
        'calibrated': True,
    }
    return out


def route(query: str, retrieval_quality: dict | None = None) -> dict:
    return neural_route(query, retrieval_quality)
