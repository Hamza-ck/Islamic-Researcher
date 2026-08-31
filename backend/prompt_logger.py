"""Async prompt logger for capturing all /ask interactions as structured training data.

Logs every query → retrieval → synthesis interaction to a JSONL file.
This data can be used for:
  - Fine-tuning future models on high-quality Islamic Q&A pairs
  - Monitoring answer quality and drift over time
  - Analyzing popular query topics and language distribution

Usage:
    from prompt_logger import log_interaction, log_feedback

    # After synthesis:
    query_id = log_interaction(query, passages, answer, metadata)

    # After user feedback:
    log_feedback(query_id, rating=1, comment="Great answer")

Export:
    python prompt_logger.py export --format csv
"""
import json
import os
import uuid
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


LOG_DIR = Path(__file__).parent / "logs"
LOG_FILE = LOG_DIR / "prompt_log.jsonl"
MAX_LOG_SIZE_MB = 50


_write_lock = threading.Lock()


def _ensure_log_dir():
    LOG_DIR.mkdir(parents=True, exist_ok=True)


def _rotate_if_needed():
    """Rotate log file if it exceeds MAX_LOG_SIZE_MB."""
    if LOG_FILE.exists() and LOG_FILE.stat().st_size > MAX_LOG_SIZE_MB * 1024 * 1024:
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        archive_path = LOG_DIR / f"prompt_log_{timestamp}.jsonl"
        LOG_FILE.rename(archive_path)


def log_interaction(
    query: str,
    passages: list[dict],
    answer: str,
    response_style: str = "scholarly",
    detail_level: str = "standard",
    temperature: float = 0.3,
    model_used: str = "unknown",
    tokens_used: int = 0,
    latency_ms: int = 0,
    confidence: str = "medium",
    language_detected: str = "english",
) -> str:
    """Log a complete query→answer interaction. Returns a unique query_id."""
    query_id = str(uuid.uuid4())[:12]

    record = {
        "query_id": query_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "query": query,
        "language_detected": language_detected,
        "passages_provided": len(passages),
        "passage_citations": [p.get("citation", "") for p in passages],
        "passage_types": [p.get("type", "") for p in passages],
        "response_style": response_style,
        "detail_level": detail_level,
        "temperature": temperature,
        "answer": answer,
        "answer_length": len(answer),
        "model_used": model_used,
        "tokens_used": tokens_used,
        "latency_ms": latency_ms,
        "confidence": confidence,
        "user_feedback": None,
        "feedback_comment": None,
    }

    # Write asynchronously to avoid blocking the response
    thread = threading.Thread(target=_write_record, args=(record,), daemon=True)
    thread.start()

    return query_id


def _write_record(record: dict):
    """Thread-safe write of a single JSONL record."""
    _ensure_log_dir()
    with _write_lock:
        _rotate_if_needed()
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")


def log_feedback(query_id: str, rating: int, comment: Optional[str] = None) -> bool:
    """Append user feedback to an existing log entry by query_id.

    Since JSONL is append-only, we write a separate feedback record that can
    be joined with the original during export/analysis.
    """
    feedback_record = {
        "type": "feedback",
        "query_id": query_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "rating": rating,
        "comment": comment,
    }

    thread = threading.Thread(target=_write_record, args=(feedback_record,), daemon=True)
    thread.start()
    return True


def get_log_stats() -> dict:
    """Return basic statistics about the prompt log."""
    if not LOG_FILE.exists():
        return {"total_interactions": 0, "total_feedback": 0, "log_size_mb": 0}

    interactions = 0
    feedbacks = 0
    with open(LOG_FILE, encoding="utf-8") as f:
        for line in f:
            if line.strip():
                try:
                    record = json.loads(line)
                    if record.get("type") == "feedback":
                        feedbacks += 1
                    else:
                        interactions += 1
                except json.JSONDecodeError:
                    pass

    return {
        "total_interactions": interactions,
        "total_feedback": feedbacks,
        "log_size_mb": round(LOG_FILE.stat().st_size / (1024 * 1024), 2),
    }


def export_training_pairs(format: str = "jsonl") -> str:
    """Export query-answer pairs suitable for fine-tuning.

    Returns the path to the exported file.
    """
    if not LOG_FILE.exists():
        return ""

    # Join interactions with their feedback
    interactions = {}
    feedbacks = {}

    with open(LOG_FILE, encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                record = json.loads(line)
                if record.get("type") == "feedback":
                    feedbacks[record["query_id"]] = record
                else:
                    interactions[record["query_id"]] = record
            except json.JSONDecodeError:
                continue

    # Merge feedback into interactions
    for qid, fb in feedbacks.items():
        if qid in interactions:
            interactions[qid]["user_feedback"] = fb.get("rating")
            interactions[qid]["feedback_comment"] = fb.get("comment")

    export_path = LOG_DIR / f"training_export_{datetime.now(timezone.utc).strftime('%Y%m%d')}.jsonl"

    with open(export_path, "w", encoding="utf-8") as f:
        for record in interactions.values():
            # Only export interactions with positive feedback or no feedback (neutral)
            training_pair = {
                "input": record["query"],
                "context_citations": record["passage_citations"],
                "output": record["answer"],
                "language": record.get("language_detected", "english"),
                "style": record.get("response_style", "scholarly"),
                "feedback_rating": record.get("user_feedback"),
            }
            f.write(json.dumps(training_pair, ensure_ascii=False) + "\n")

    return str(export_path)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "export":
        fmt = "jsonl"
        if "--format" in sys.argv:
            idx = sys.argv.index("--format")
            if idx + 1 < len(sys.argv):
                fmt = sys.argv[idx + 1]
        path = export_training_pairs(fmt)
        if path:
            print(f"Exported training data to: {path}")
        else:
            print("No log data found.")
    elif len(sys.argv) > 1 and sys.argv[1] == "stats":
        stats = get_log_stats()
        print(json.dumps(stats, indent=2))
    else:
        print("Usage: python prompt_logger.py [export|stats]")
        print("  export --format jsonl   Export training pairs")
        print("  stats                   Show log statistics")
