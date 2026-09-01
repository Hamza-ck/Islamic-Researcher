"""Answer synthesis using Google Gemini via the modern google-genai SDK.

Strictly grounded: the model is instructed to answer only from the retrieved
passages and to cite every claim. This matters a lot for religious source
material -- the goal is a summarizer over real text, not a model generating
hadith/verses from memory.

Features:
  - Proper system_instruction separation (higher model authority)
  - Response style presets (concise / scholarly / detailed)
  - Structured passage formatting with Arabic, grades, source types
  - Retry logic with exponential backoff for transient API failures
  - Token usage tracking and confidence estimation
"""
import os
import time
from dataclasses import dataclass, field
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

_api_key = os.environ.get("GEMINI_API_KEY", "")
_client = genai.Client(api_key=_api_key) if _api_key else None
_MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")


# ── Result Dataclass ─────────────────────────────────────────────────────────
@dataclass
class SynthesisResult:
    answer: str
    citations_used: list[str] = field(default_factory=list)
    confidence: str = "medium"       # "high" | "medium" | "low"
    model_used: str = ""
    tokens_used: int = 0
    latency_ms: int = 0
    language_detected: str = "english"


# ── Core System Instruction ──────────────────────────────────────────────────
# This is passed via system_instruction (highest model authority) — NOT mixed
# into the user prompt. The model treats this with special weight.
SYSTEM_INSTRUCTION = """You are an authoritative scholarly research assistant over an authentic corpus of Quran, Hadith, and classical tafsir.
You will be given a user question and a set of retrieved passages, each labeled with structured metadata including citation, source type, authenticity grade, and Arabic text where available.
Answer using ONLY the verified information in the retrieved passages.

CRITICAL LANGUAGE & SCRIPT INSTRUCTION:
1. Detect the language and script of the user's question and ANSWER IN THE EXACT SAME LANGUAGE AND SCRIPT:
   - If the user asks in Urdu (اردو رسم الخط), synthesize the entire answer in fluent scholarly Urdu.
   - If the user asks in Roman Urdu / Roman Hindi (e.g. "Sabar ke baare me kya aya hai?", "Namaz ke fazail"), synthesize the answer in Roman Urdu / Roman Hindi.
   - If the user asks in Hindi (हिन्दी / देवनागरी लिपि), synthesize the answer in clear Hindi.
   - If the user asks in Arabic (العربية), synthesize the answer in classical Arabic.
   - If the user asks in English, synthesize the answer in English.
2. CITATIONS: Every claim must be followed by its citation, adapted to the target language (e.g. (Quran 2:255 / قرآن ۲:۲۵۵ / कुरान 2:255) or (Sahih al-Bukhari, Hadith 1 / صحیح البخاری، حدیث ۱)).
3. AUTHENTICITY: For hadith, mention the authenticity grade (Sahih / Hasan / Da'if) if it appears in the passage metadata.
4. STRICT GROUNDING: If the retrieved passages do not contain a clear answer, state so plainly in the user's language without guessing or hallucinating.
5. NEUTRALITY: Do not issue personal religious rulings (fatwas) -- summarize strictly what the source texts state. Keep the tone respectful, scholarly, and clear.
6. CROSS-REFERENCING: When multiple passages corroborate a point, mention the agreement across sources to strengthen the scholarly foundation.
"""


# ── Style Presets ────────────────────────────────────────────────────────────
STYLE_PREAMBLES = {
    "concise": (
        "Respond in a concise, direct manner. Use 2-3 short paragraphs maximum. "
        "Include only the most essential citations. Bullet points are acceptable for listing key points."
    ),
    "scholarly": (
        "Provide a thorough scholarly analysis. Include all relevant citations with authenticity grades. "
        "Cross-reference Quranic verses with supporting hadith where applicable. "
        "Structure the answer logically with clear transitions between points."
    ),
    "detailed": (
        "Provide an exhaustive, comprehensive treatment of the topic. "
        "Include tafsir commentary context where available. Reference historical scholarly background. "
        "Organize with clear thematic sections. Quote Arabic text alongside translations when available. "
        "Discuss the relationship between different source passages."
    ),
}

DETAIL_TOKEN_LIMITS = {
    "brief": 512,
    "standard": 2048,
    "comprehensive": 4096,
}


# ── Passage Formatting ───────────────────────────────────────────────────────

def _format_passage(index: int, passage: dict) -> str:
    """Format a single passage with rich structured metadata for LLM context."""
    parts = [f"━━━ PASSAGE {index} ━━━"]

    source_type = passage.get("type", "source").upper()
    parts.append(f"Source Type: {source_type}")
    parts.append(f"Citation: {passage.get('citation', 'Unknown')}")

    # Hadith authenticity info
    metadata = passage.get("metadata", {})
    if passage.get("type") == "hadith":
        grade_cat = metadata.get("grade_category", "unclassified")
        grade_labels = {
            "sahih": "Sahih (Authentic)",
            "hasan": "Hasan (Good)",
            "weak": "Da'if (Weak)",
            "unclassified": "Unclassified",
        }
        parts.append(f"Authenticity: {grade_labels.get(grade_cat, grade_cat)}")

        # Per-scholar grades if available
        grades = metadata.get("grades", [])
        if grades:
            scholar_grades = ", ".join(
                f"{g.get('name', 'Scholar')}: {g.get('grade', '?')}"
                for g in grades[:3]  # limit to 3 to save tokens
            )
            parts.append(f"Scholar Grades: {scholar_grades}")

    # Arabic text
    arabic = passage.get("arabic")
    if arabic:
        parts.append(f"Arabic: {arabic}")

    # Translation / main text
    text = passage.get("text", "")
    if text:
        parts.append(f"Translation/Text: {text}")

    parts.append("━" * 40)
    return "\n".join(parts)


def _format_all_passages(passages: list[dict]) -> str:
    """Format all passages into a structured context block."""
    return "\n\n".join(
        _format_passage(i + 1, p) for i, p in enumerate(passages)
    )


def _estimate_confidence(passages: list[dict]) -> str:
    """Estimate answer confidence based on retrieval quality."""
    if not passages:
        return "low"

    scores = [p.get("score", 0) for p in passages]
    avg_score = sum(scores) / len(scores)
    high_quality_count = sum(1 for s in scores if s > 0.75)

    if avg_score > 0.80 and high_quality_count >= 2:
        return "high"
    elif avg_score > 0.60 or high_quality_count >= 1:
        return "medium"
    return "low"


def _detect_language_hint(query: str) -> str:
    """Quick heuristic to detect query language for logging purposes."""
    # Check for Arabic script
    if any('\u0600' <= c <= '\u06FF' for c in query):
        return "arabic_or_urdu"
    # Check for Devanagari
    if any('\u0900' <= c <= '\u097F' for c in query):
        return "hindi"
    # Simple heuristic for Roman Urdu/Hindi
    roman_urdu_markers = ["kya", "hai", "mein", "ke", "ka", "ki", "aur", "ko", "kaise", "kab"]
    query_words = query.lower().split()
    if sum(1 for w in query_words if w in roman_urdu_markers) >= 2:
        return "roman_urdu"
    return "english"


# ── Main Synthesis Function ──────────────────────────────────────────────────

def synthesize(
    query: str,
    passages: list[dict],
    response_style: str = "scholarly",
    detail_level: str = "standard",
    temperature: float = 0.3,
) -> SynthesisResult:
    """Synthesize a grounded answer from retrieved passages using Gemini.

    Args:
        query: User's natural language question.
        passages: List of retrieved passage dicts with citation, text, type, metadata, arabic.
        response_style: One of "concise", "scholarly", "detailed".
        detail_level: One of "brief", "standard", "comprehensive".
        temperature: Controls creativity (0.0 = very precise, 1.0 = creative).

    Returns:
        SynthesisResult with answer text, metadata, and diagnostics.
    """
    start_time = time.time()

    # Validate and default style
    if response_style not in STYLE_PREAMBLES:
        response_style = "scholarly"
    if detail_level not in DETAIL_TOKEN_LIMITS:
        detail_level = "standard"

    # Build the user prompt with structured passages
    style_instruction = STYLE_PREAMBLES[response_style]
    context = _format_all_passages(passages)
    max_tokens = DETAIL_TOKEN_LIMITS[detail_level]

    user_prompt = (
        f"STYLE INSTRUCTION: {style_instruction}\n\n"
        f"Question: {query}\n\n"
        f"Retrieved Passages:\n{context}\n\n"
        f"Answer:"
    )

    # Generation config
    gen_config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        temperature=temperature,
        top_p=0.92,
        top_k=40,
        max_output_tokens=max_tokens,
    )

    # Call with retry (up to 2 retries with backoff)
    answer_text = ""
    tokens_used = 0
    last_error = None

    client = _client
    if client is None:
        key = os.environ.get("GEMINI_API_KEY", "")
        if not key:
            raise RuntimeError("GEMINI_API_KEY environment variable is not set.")
        client = genai.Client(api_key=key)

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=_MODEL_NAME,
                contents=user_prompt,
                config=gen_config,
            )
            answer_text = response.text or ""

            # Extract token usage if available
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                tokens_used = getattr(response.usage_metadata, "total_token_count", 0)

            break
        except Exception as e:
            last_error = e
            if attempt < 2:
                time.sleep(1.5 ** attempt)  # exponential backoff: 1s, 1.5s
            else:
                raise RuntimeError(
                    f"LLM synthesis failed after {attempt + 1} attempts: {e}"
                ) from e

    elapsed_ms = int((time.time() - start_time) * 1000)

    # Extract which citations the model actually used
    citations_used = [
        p.get("citation", "")
        for p in passages
        if p.get("citation", "") and p["citation"].lower() in answer_text.lower()
    ]

    return SynthesisResult(
        answer=answer_text,
        citations_used=citations_used,
        confidence=_estimate_confidence(passages),
        model_used=_MODEL_NAME,
        tokens_used=tokens_used,
        latency_ms=elapsed_ms,
        language_detected=_detect_language_hint(query),
    )
