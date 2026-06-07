from pydantic import BaseModel
from typing import List, Optional, Dict, Any
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


# ── User Profile ─────────────────────────────────────────────────────────────
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    institution: Optional[str] = None
    research_interests: Optional[str] = None
    avatar_url: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    bio: str
    institution: str
    research_interests: str
    avatar_url: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileResponse(BaseModel):
    """Merged User + UserProfile + computed stats."""
    id: int
    username: str
    full_name: str
    bio: str
    institution: str
    research_interests: str
    avatar_url: str
    joined_at: Optional[datetime]
    saved_papers_count: int
    total_chats: int
    profile_updated_at: Optional[datetime]


# ── Analytics ────────────────────────────────────────────────────────────────
class MonthlyCount(BaseModel):
    month: str   # e.g. "2024-01"
    count: int


class AnalyticsResponse(BaseModel):
    papers_by_month: List[MonthlyCount]
    top_keywords: List[Dict[str, Any]]
    chats_by_month: List[MonthlyCount]
    total_saved: int
    total_chats: int


class ActivityResponse(BaseModel):
    id: int
    activity_type: str
    activity_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
