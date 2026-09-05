from typing import Optional, Literal
from pydantic import BaseModel, Field

Grade = Literal['sahih', 'hasan', 'unclassified', 'weak']
ResearchMode = Literal['quick', 'research', 'deep']
SufficiencyStatus = Literal['sufficient', 'insufficient', 'conflicted', 'low_quality']
EvidenceOrigin = Literal['internal', 'external', 'offline_demo']


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
    origin: EvidenceOrigin = 'internal'
    source_priority: str = 'primary'


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


class EvidenceUnit(BaseModel):
    """Canonical evidence/source record used by research sessions."""

    id: str
    source_type: str
    collection: Optional[str] = None
    book: Optional[str] = None
    chapter: Optional[str] = None
    author: Optional[str] = None
    title: Optional[str] = None
    language: Optional[str] = None
    text: str
    original_text: Optional[str] = None
    normalized_text: Optional[str] = None
    translation: Optional[str] = None
    arabic: Optional[str] = None
    reference: Optional[str] = None
    url: Optional[str] = None
    source_priority: str = 'primary'
    provenance: Optional[str] = None
    license: Optional[str] = None
    grading: Optional[dict] = None
    origin: EvidenceOrigin = 'internal'
    metadata: dict = Field(default_factory=dict)


class Claim(BaseModel):
    id: str
    text: str
    sources: list[str] = Field(default_factory=list)
    support: Literal['supported', 'weak', 'unsupported'] = 'weak'


class Contradiction(BaseModel):
    summary: str
    source_ids: list[str] = Field(default_factory=list)


class Confidence(BaseModel):
    level: Literal['low', 'medium', 'high'] = 'low'
    score: float = 0.0
    note: str = 'Confidence is an evidence-coverage signal, not a probability of religious truth.'


class Sufficiency(BaseModel):
    status: SufficiencyStatus = 'insufficient'
    score: float = 0.0
    reason: str = ''
    missing_information: list[str] = Field(default_factory=list)


class ResearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    mode: ResearchMode = 'research'
    top_k: int = Field(default=10, ge=1, le=50)
    types: Optional[list[str]] = None
    collections: Optional[list[str]] = None
    min_grade: Optional[Grade] = None
    allow_external: bool = False
    response_style: str = Field(default='scholarly')
    detail_level: str = Field(default='standard')
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)


class ContinueResearchRequest(BaseModel):
    query: Optional[str] = Field(default=None, max_length=2000)
    allow_external: bool = False


class VerifyRequest(BaseModel):
    answer: str = Field(min_length=1)
    source_ids: list[str] = Field(default_factory=list)


class ResearchResponse(BaseModel):
    research_id: str
    query: str
    status: str = 'completed'
    mode: ResearchMode = 'research'
    answer: str = ''
    claims: list[Claim] = Field(default_factory=list)
    sources: list[SearchResult] = Field(default_factory=list)
    contradictions: list[Contradiction] = Field(default_factory=list)
    confidence: Confidence = Field(default_factory=Confidence)
    sufficiency: Sufficiency = Field(default_factory=Sufficiency)
    external_research_used: bool = False
    timeline: list[dict] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)


class HealthResponse(BaseModel):
    status: str
    corpus_available: bool
    local_index_available: bool
    faiss_available: bool
    embedding_model: str
    reranker_enabled: bool
    remote_llm_configured: bool
    local_llm_configured: bool
    index: dict = Field(default_factory=dict)
    retrieval: str = 'hybrid lexical+semantic+reranker'
