from typing import Optional
from pydantic import BaseModel


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


class AskResponse(BaseModel):
    answer: str
    sources: list[SearchResult]
