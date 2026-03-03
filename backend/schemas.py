from pydantic import BaseModel

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

class ChatRequest(BaseModel):
    message: str

class AnalyzePaperRequest(BaseModel):
    text: str
