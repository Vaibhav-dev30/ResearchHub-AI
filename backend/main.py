from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

import models, schemas, auth, database
from ai.summarizer import summarize_text
from ai.keyword_extractor import extract_keywords
from ai.chatbot import chat_with_llm

app = FastAPI(title="ResearchHub AI")

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=schemas.UserResponse)
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

@app.post("/login", response_model=schemas.Token)
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

@app.get("/search", response_model=List[schemas.SearchResponse])
def search_papers(query: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Basic search implementation
    papers = db.query(models.Paper).filter(models.Paper.title.contains(query)).all()
    if not papers:
        # Mock data for demonstration purposes as requested in instructions
        return [
            schemas.SearchResponse(id=1, title=f"Advances in {query} with Agentic AI", abstract=f"This paper explores the usage of Agentic AI in {query}...", authors="Alan Turing"),
            schemas.SearchResponse(id=2, title=f"Comprehensive Review on {query}", abstract=f"A systematic literature review on {query} methodology.", authors="Ada Lovelace")
        ]
    return papers

@app.post("/chat")
def chat(request: schemas.ChatRequest, current_user: models.User = Depends(auth.get_current_user)):
    response = chat_with_llm(request.message)
    return {"reply": response}

@app.post("/analyze-paper")
def analyze_paper(request: schemas.AnalyzePaperRequest, current_user: models.User = Depends(auth.get_current_user)):
    summary = summarize_text(request.text)
    keywords_raw = extract_keywords(request.text)
    keywords = [k.strip() for k in keywords_raw.split(',') if k.strip()]
    
    return {
        "analysis": summary,
        "keywords": keywords
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
