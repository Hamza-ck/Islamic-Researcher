from typing import Optional
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str
    top_k: int = 10
    types: Optional[list[str]] = None          # e.g. ["quran", "hadith", "tafsir"]
    collections: Optional[list[str]] = None     # e.g. ["bukhari", "muslim"]
    min_grade: Optional[str] = None             # "sahih" | "hasan" | "weak" | None


class SearchResult(BaseModel):
    id: str
    type: str
    text: str
    citation: str
    score: float
    arabic: Optional[str] = None
    metadata: dict


class SearchResponse(BaseModel):
    results: list[SearchResult]


class AskRequest(BaseModel):
    query: str
    top_k: int = 6
    response_style: str = Field(
        default="scholarly",
        description="Controls answer style: 'concise', 'scholarly', or 'detailed'"
    )
    detail_level: str = Field(
        default="standard",
        description="Controls depth: 'brief', 'standard', or 'comprehensive'"
    )
    temperature: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="Controls creativity vs. precision (0.0 = very precise, 1.0 = very creative)"
    )


class SynthesisMetadata(BaseModel):
    """Metadata about the LLM synthesis process."""
    confidence: str = "medium"          # "high" | "medium" | "low"
    model_used: str = "unknown"
    tokens_used: int = 0
    latency_ms: int = 0
    response_style: str = "scholarly"
    temperature: float = 0.3


class AskResponse(BaseModel):
    answer: str
    sources: list[SearchResult]
    metadata: Optional[SynthesisMetadata] = None
    query_id: Optional[str] = None


class FeedbackRequest(BaseModel):
    """User feedback on a synthesized answer."""
    query_id: str
    rating: int = Field(
        description="Rating: 1 (thumbs down) or 5 (thumbs up), or 1-5 scale"
    )
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    success: bool
    message: str = "Feedback recorded"

