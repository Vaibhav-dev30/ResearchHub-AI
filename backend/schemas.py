from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class SearchResponse(BaseModel):
    id: int
    title: str
    abstract: str
    authors: str
    arxiv_url: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    paper_context: Optional[str] = None  # Optional paper context for primed chat


class AnalyzePaperRequest(BaseModel):
    text: str
    title: Optional[str] = None
    authors: Optional[str] = None


class SavedAnalysisCreate(BaseModel):
    title: str
    authors: Optional[str] = ""
    abstract: Optional[str] = ""
    summary: str
    keywords: str  # Comma-separated string


class SavedAnalysisResponse(BaseModel):
    id: int
    title: str
    authors: str
    abstract: str
    summary: str
    keywords: str
    created_at: datetime

    class Config:
        from_attributes = True
