import os
import requests
import xml.etree.ElementTree as ET
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from dotenv import load_dotenv

import models, schemas, auth, database
from ai.summarizer import summarize_text
from ai.keyword_extractor import extract_keywords
from ai.chatbot import chat_with_llm
from services.pdf_processor import process_pdf
from services.embedding_service import get_embeddings
from services.semantic_retriever import retrieve_relevant_chunks

load_dotenv()

app = FastAPI(
    title="ResearchHub AI",
    description="AI-powered research paper management system using Groq & LLaMA 3",
    version="2.0.0"
)

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

# ─────────────────────── CORS ───────────────────────────────────────────────
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # Also allow all Vercel preview/production deployment URLs automatically
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────── Helpers ────────────────────────────────────────────
ARXIV_API = "https://export.arxiv.org/api/query"
ARXIV_NS = "http://www.w3.org/2005/Atom"


def _search_arxiv(query: str, max_results: int = 8) -> List[schemas.SearchResponse]:
    """Fetch real papers from the ArXiv public API."""
    try:
        resp = requests.get(
            ARXIV_API,
            params={"search_query": f"all:{query}", "start": 0, "max_results": max_results},
            timeout=10,
        )
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        papers = []
        for i, entry in enumerate(root.findall(f"{{{ARXIV_NS}}}entry")):
            def _text(tag):
                el = entry.find(f"{{{ARXIV_NS}}}{tag}")
                return el.text.strip() if el is not None and el.text else ""

            title = _text("title").replace("\n", " ")
            abstract = _text("summary").replace("\n", " ")
            link_el = entry.find(f"{{{ARXIV_NS}}}id")
            arxiv_url = link_el.text.strip() if link_el is not None else ""
            authors = ", ".join(
                (a.find(f"{{{ARXIV_NS}}}name").text or "").strip()
                for a in entry.findall(f"{{{ARXIV_NS}}}author")
                if a.find(f"{{{ARXIV_NS}}}name") is not None
            )
            papers.append(
                schemas.SearchResponse(
                    id=i + 1,
                    title=title,
                    abstract=abstract,
                    authors=authors,
                    arxiv_url=arxiv_url,
                )
            )
        return papers
    except Exception as e:
        return []


# ─────────────────────── Auth Routes ────────────────────────────────────────
def _log_activity(db: Session, user_id: int, activity_type: str, data: dict = None):
    """Fire-and-forget activity log entry."""
    try:
        entry = models.UserActivity(user_id=user_id, activity_type=activity_type, activity_data=data or {})
        db.add(entry)
        db.commit()
    except Exception:
        db.rollback()


@app.post("/register", response_model=schemas.UserResponse, tags=["Auth"])
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=schemas.Token, tags=["Auth"])
def login(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ─────────────────────── Search Route ───────────────────────────────────────
@app.get("/search", response_model=List[schemas.SearchResponse], tags=["Research"])
def search_papers(
    query: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    # First check local DB
    local_papers = db.query(models.Paper).filter(models.Paper.title.contains(query)).all()
    if local_papers:
        return [
            schemas.SearchResponse(id=p.id, title=p.title, abstract=p.abstract, authors=p.authors)
            for p in local_papers
        ]
    # Fall back to live ArXiv search
    return _search_arxiv(query)


# ─────────────────────── AI Routes ──────────────────────────────────────────
@app.post("/chat", tags=["AI"])
def chat(
    request: schemas.ChatRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    response = chat_with_llm(request.message, paper_context=request.paper_context)
    _log_activity(db, current_user.id, "chat", {"message_snippet": request.message[:80]})
    return {"reply": response}


@app.post("/analyze-paper", tags=["AI"])
def analyze_paper(
    request: schemas.AnalyzePaperRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    summary = summarize_text(request.text)
    keywords_raw = extract_keywords(request.text)
    keywords = [k.strip() for k in keywords_raw.split(",") if k.strip()]
    return {
        "analysis": summary,
        "keywords": keywords,
        "title": request.title or "",
        "authors": request.authors or "",
    }


from services.citation_service import get_citation_graph

# ─────────────────────── Citation Graph Routes ──────────────────────────────
@app.get("/citation-graph/{arxiv_id}", tags=["Research"])
def fetch_citation_graph(
    arxiv_id: str, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Fetch citation and reference nodes/edges from Semantic Scholar."""
    # Semantic Scholar sometimes struggles with ArXiv versions (e.g. 2106.09685v1), strip version:
    base_arxiv_id = arxiv_id.split('v')[0] if 'v' in arxiv_id else arxiv_id
    graph_data = get_citation_graph(base_arxiv_id)
    
    if not graph_data["nodes"]:
        raise HTTPException(status_code=404, detail="Citation data not found for this paper.")
        
    _log_activity(db, current_user.id, "citation_graph", {"arxiv_id": base_arxiv_id})
    return graph_data



# ─────────────────────── PDF Semantic Chat Routes ───────────────────────────
@app.post("/upload-pdf", response_model=schemas.UploadedPaperResponse, tags=["PDF"])
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    # Read file
    content = await file.read()
    
    # Process PDF into chunks
    chunks = process_pdf(content)
    if not chunks:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
    # Generate embeddings
    embeddings = get_embeddings(chunks)
    
    # Save to database
    paper = models.UploadedPaper(
        user_id=current_user.id,
        filename=file.filename,
        title=file.filename.replace('.pdf', '')
    )
    db.add(paper)
    db.flush() # flush to get paper.id
    
    # Save chunks with embeddings
    for chunk, embedding in zip(chunks, embeddings):
        paper_chunk = models.PaperChunk(
            paper_id=paper.id,
            content=chunk,
            embedding=embedding
        )
        db.add(paper_chunk)
        
    db.commit()
    db.refresh(paper)
    _log_activity(db, current_user.id, "upload_pdf", {"filename": file.filename})
    return paper

@app.get("/uploaded-papers", response_model=List[schemas.UploadedPaperResponse], tags=["PDF"])
def get_uploaded_papers(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.UploadedPaper).filter(models.UploadedPaper.user_id == current_user.id).order_by(models.UploadedPaper.created_at.desc()).all()

@app.delete("/uploaded-papers/{paper_id}", tags=["PDF"])
def delete_uploaded_paper(
    paper_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    paper = db.query(models.UploadedPaper).filter(models.UploadedPaper.id == paper_id, models.UploadedPaper.user_id == current_user.id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    db.delete(paper)
    db.commit()
    _log_activity(db, current_user.id, "delete_pdf", {"paper_id": paper_id})
    return {"status": "deleted"}

@app.post("/pdf-chat", response_model=schemas.PDFChatResponse, tags=["PDF"])
def chat_with_pdf(
    request: schemas.PDFChatRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    # Verify paper belongs to user
    paper = db.query(models.UploadedPaper).filter(models.UploadedPaper.id == request.paper_id, models.UploadedPaper.user_id == current_user.id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found or unauthorized")
        
    # Retrieve relevant chunks from pgvector
    relevant_chunks = retrieve_relevant_chunks(db, request.message, paper_id=request.paper_id, limit=4)
    
    if not relevant_chunks:
        return {"response": "I couldn't find any relevant information in the paper to answer your question.", "context_used": []}
        
    # Build prompt context
    context_text = "\n\n---\n\n".join(relevant_chunks)
    system_prompt = f"You are a helpful research assistant. Use the following excerpts from a research paper to answer the user's question. If the answer is not contained in the excerpts, say 'I don't have enough information from the paper to answer that.'\n\nPaper Excerpts:\n{context_text}"
    
    # Call existing LLM logic (we pass the chunks as context)
    response = chat_with_llm(request.message, paper_context=system_prompt)
    
    _log_activity(db, current_user.id, "pdf_chat", {"paper_id": request.paper_id})
    
    return {"response": response, "context_used": relevant_chunks}

# ─────────────────────── Saved Analyses Routes ──────────────────────────────
@app.post("/saved-analyses", response_model=schemas.SavedAnalysisResponse, tags=["Library"])
def save_analysis(
    payload: schemas.SavedAnalysisCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    record = models.SavedAnalysis(
        user_id=current_user.id,
        title=payload.title,
        authors=payload.authors or "",
        abstract=payload.abstract or "",
        summary=payload.summary,
        keywords=payload.keywords,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    _log_activity(db, current_user.id, "save_analysis", {"title": payload.title})
    return record


@app.get("/saved-analyses", response_model=List[schemas.SavedAnalysisResponse], tags=["Library"])
def get_saved_analyses(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.SavedAnalysis)
        .filter(models.SavedAnalysis.user_id == current_user.id)
        .order_by(models.SavedAnalysis.created_at.desc())
        .all()
    )


@app.get("/saved-analyses/{analysis_id}", response_model=schemas.SavedAnalysisResponse, tags=["Library"])
def get_saved_analysis(
    analysis_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    record = (
        db.query(models.SavedAnalysis)
        .filter(
            models.SavedAnalysis.id == analysis_id,
            models.SavedAnalysis.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return record


@app.delete("/saved-analyses/{analysis_id}", tags=["Library"])
def delete_saved_analysis(
    analysis_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    record = (
        db.query(models.SavedAnalysis)
        .filter(
            models.SavedAnalysis.id == analysis_id,
            models.SavedAnalysis.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    db.delete(record)
    db.commit()
    return {"message": "Analysis deleted successfully"}


# ─────────────────────── User Profile ───────────────────────────────────────
@app.get("/profile", response_model=schemas.ProfileResponse, tags=["Profile"])
def get_profile(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        # Auto-create empty profile on first access
        profile = models.UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    saved_count = db.query(models.SavedAnalysis).filter(models.SavedAnalysis.user_id == current_user.id).count()
    chat_count = db.query(models.UserActivity).filter(
        models.UserActivity.user_id == current_user.id,
        models.UserActivity.activity_type == "chat"
    ).count()

    return schemas.ProfileResponse(
        id=current_user.id,
        username=current_user.username,
        full_name=profile.full_name or "",
        bio=profile.bio or "",
        institution=profile.institution or "",
        research_interests=profile.research_interests or "",
        avatar_url=profile.avatar_url or "",
        joined_at=profile.created_at,
        saved_papers_count=saved_count,
        total_chats=chat_count,
        profile_updated_at=profile.updated_at,
    )


@app.put("/profile", response_model=schemas.ProfileResponse, tags=["Profile"])
def update_profile(
    payload: schemas.UserProfileUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.UserProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(profile, field, value)

    from datetime import datetime, timezone
    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)

    saved_count = db.query(models.SavedAnalysis).filter(models.SavedAnalysis.user_id == current_user.id).count()
    chat_count = db.query(models.UserActivity).filter(
        models.UserActivity.user_id == current_user.id,
        models.UserActivity.activity_type == "chat"
    ).count()

    return schemas.ProfileResponse(
        id=current_user.id,
        username=current_user.username,
        full_name=profile.full_name or "",
        bio=profile.bio or "",
        institution=profile.institution or "",
        research_interests=profile.research_interests or "",
        avatar_url=profile.avatar_url or "",
        joined_at=profile.created_at,
        saved_papers_count=saved_count,
        total_chats=chat_count,
        profile_updated_at=profile.updated_at,
    )


@app.get("/analytics", response_model=schemas.AnalyticsResponse, tags=["Profile"])
def get_analytics(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    from sqlalchemy import func
    from collections import Counter

    # Monthly papers saved
    analyses = db.query(models.SavedAnalysis).filter(
        models.SavedAnalysis.user_id == current_user.id
    ).all()

    month_counter: Counter = Counter()
    keyword_counter: Counter = Counter()
    for a in analyses:
        month_key = a.created_at.strftime("%Y-%m") if a.created_at else "unknown"
        month_counter[month_key] += 1
        if a.keywords:
            for kw in a.keywords.split(","):
                kw = kw.strip()
                if kw:
                    keyword_counter[kw] += 1

    papers_by_month = [
        schemas.MonthlyCount(month=k, count=v)
        for k, v in sorted(month_counter.items())
    ]

    top_keywords = [
        {"keyword": kw, "count": cnt}
        for kw, cnt in keyword_counter.most_common(10)
    ]

    # Monthly chats
    chat_activities = db.query(models.UserActivity).filter(
        models.UserActivity.user_id == current_user.id,
        models.UserActivity.activity_type == "chat"
    ).all()
    chat_month_counter: Counter = Counter()
    for a in chat_activities:
        month_key = a.created_at.strftime("%Y-%m") if a.created_at else "unknown"
        chat_month_counter[month_key] += 1

    chats_by_month = [
        schemas.MonthlyCount(month=k, count=v)
        for k, v in sorted(chat_month_counter.items())
    ]

    return schemas.AnalyticsResponse(
        papers_by_month=papers_by_month,
        top_keywords=top_keywords,
        chats_by_month=chats_by_month,
        total_saved=len(analyses),
        total_chats=len(chat_activities),
    )


@app.get("/activity", tags=["Profile"])
def get_activity(
    limit: int = 20,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    activities = (
        db.query(models.UserActivity)
        .filter(models.UserActivity.user_id == current_user.id)
        .order_by(models.UserActivity.created_at.desc())
        .limit(limit)
        .all()
    )
    return activities


# ─────────────────────── Health ─────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "version": "3.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
