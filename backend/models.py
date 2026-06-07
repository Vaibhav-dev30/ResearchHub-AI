from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    saved_analyses = relationship("SavedAnalysis", back_populates="owner", cascade="all, delete-orphan")
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    activity = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    abstract = Column(Text)
    authors = Column(String)


class SavedAnalysis(Base):
    __tablename__ = "saved_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    authors = Column(String, default="")
    abstract = Column(Text, default="")
    summary = Column(Text, default="")
    keywords = Column(Text, default="")  # Stored as comma-separated string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="saved_analyses")


class UserProfile(Base):
    """Extended profile info — one-to-one with User."""
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    full_name = Column(String, default="")
    bio = Column(Text, default="")
    institution = Column(String, default="")
    research_interests = Column(String, default="")  # comma-separated
    avatar_url = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")


class UserActivity(Base):
    """Activity log — fires on key user actions for analytics."""
    __tablename__ = "user_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String, nullable=False)  # e.g. "save_analysis", "chat", "search"
    activity_data = Column(JSON, default=dict)       # flexible metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="activity")

class UploadedPaper(Base):
    """Metadata for an uploaded PDF paper."""
    __tablename__ = "uploaded_papers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    title = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    chunks = relationship("PaperChunk", back_populates="paper", cascade="all, delete-orphan")

class PaperChunk(Base):
    """Text chunks and their embeddings for semantic search."""
    __tablename__ = "paper_chunks"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("uploaded_papers.id"), nullable=False)
    content = Column(Text, nullable=False)
    
    # 384 dimensions for all-MiniLM-L6-v2 model
    from pgvector.sqlalchemy import Vector
    embedding = Column(Vector(384))

    paper = relationship("UploadedPaper", back_populates="chunks")
