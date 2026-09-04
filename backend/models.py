from typing import Optional, Literal
from pydantic import BaseModel, Field

Grade = Literal['sahih', 'hasan', 'unclassified', 'weak']

class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    top_k: int = Field(default=10, ge=1, le=50)
    types: Optional[list[str]] = None
    collections: Optional[list[str]] = None
    min_grade: Optional[Grade] = None
    research: bool = False

class SearchResult(BaseModel):
    id: str
    type: str
    text: str
    citation: str
    score: float
    arabic: Optional[str] = None
    metadata: dict = Field(default_factory=dict)

class SearchResponse(BaseModel):
    results: list[SearchResult]
    metadata: dict = Field(default_factory=dict)

class AskRequest(SearchRequest):
    response_style: str = Field(default='scholarly')
    detail_level: str = Field(default='standard')
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)

class SynthesisMetadata(BaseModel):
    confidence: str = 'low'
    confidence_score: float = 0.0
    model_used: str = 'retrieval-only'
    tokens_used: int = 0
    latency_ms: int = 0
    response_style: str = 'scholarly'
    temperature: float = 0.2
    verification: dict = Field(default_factory=dict)
    research_plan: Optional[dict] = None

class AskResponse(BaseModel):
    answer: str
    sources: list[SearchResult]
    metadata: Optional[SynthesisMetadata] = None
    query_id: Optional[str] = None

class FeedbackRequest(BaseModel):
    query_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    success: bool
    message: str = 'Feedback recorded'
