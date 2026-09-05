"""Benchmark fixed rule-based weights vs learned/neural router weights."""
from __future__ import annotations

import json
import time
from pathlib import Path
from backend.core.routing.neural import extract_router_features, neural_route
from backend.core.routing.rules import route_sources

SAMPLE_QUERIES = [
    'What does the Quran say about patience in hardship?',
    'Sahih Hadith regarding intention in actions from Bukhari',
    'Tafsir of Surah Al-Baqarah verse 153 by Ibn Kathir',
    'Difference of opinion between Abu Hanifa and Shafi\'i on wudu nullification',
    'Contemporary discussion and lecture on Islamic finance and riba',
    'ما هو الصبر في القرآن والسنة؟',
    'نماز میں خشوع کیسے پیدا کریں؟',
    'namaz ke arkan aur sharait kya hain?',
]


def run_benchmark() -> dict:
    results = []
    t_rules_total = 0.0
    t_neural_total = 0.0

    for q in SAMPLE_QUERIES:
        # Rule timing
        t0 = time.perf_counter()
        rule_res = route_sources(q)
        t_rules = (time.perf_counter() - t0) * 1000.0
        t_rules_total += t_rules

        # Neural timing
        t1 = time.perf_counter()
        neural_res = neural_route(q)
        t_neural = (time.perf_counter() - t1) * 1000.0
        t_neural_total += t_neural

        results.append({
            'query': q,
            'rules': {k: rule_res[k] for k in ('quran_weight', 'hadith_weight', 'tafsir_weight', 'external_research_probability')},
            'neural': {k: neural_res[k] for k in ('quran_weight', 'hadith_weight', 'tafsir_weight', 'external_research_probability')},
            'rule_latency_ms': round(t_rules, 3),
            'neural_latency_ms': round(t_neural, 3),
        })

    summary = {
        'benchmark_queries_count': len(SAMPLE_QUERIES),
        'avg_rule_latency_ms': round(t_rules_total / len(SAMPLE_QUERIES), 3),
        'avg_neural_latency_ms': round(t_neural_total / len(SAMPLE_QUERIES), 3),
        'comparisons': results,
    }

    out_file = Path(__file__).resolve().parent / 'benchmark_results.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    return summary


if __name__ == '__main__':
    res = run_benchmark()
    print(f"Router Benchmark Complete: {res['benchmark_queries_count']} queries evaluated.")
    print(f"Avg Rules Latency: {res['avg_rule_latency_ms']} ms | Avg Neural Latency: {res['avg_neural_latency_ms']} ms")
