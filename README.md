# ResearchHub AI
### Intelligent Research Paper Management System using Agentic AI

ResearchHub AI is a production-ready full-stack AI-powered research management system built with FastAPI, React (TypeScript), SQLite, and Groq’s Llama3 model. It enables intelligent research paper search, AI-based analysis, and conversational interaction using modular Agentic AI architecture.

---

## Features

- Secure JWT-based Authentication
- Research Paper Search API
- AI-powered Paper Analysis
- 150–200 word Summarization
- Key Findings Extraction
- 5 Research Questions Generation
- 10 Keyword Extraction
- Conversational AI Chat
- Modular AI Agent Design
- SQLite with SQLAlchemy ORM
- Environment-based Configuration
- CORS Enabled Backend
- Production Ready Architecture

---

## Tech Stack

### Backend
- FastAPI
- Groq API (llama3-8b-8192)
- SQLite
- SQLAlchemy
- JWT Authentication (python-jose)
- Passlib (bcrypt hashing)
- Python-dotenv
- Uvicorn

### Frontend
- React
- TypeScript
- Axios
- Protected Routes
- Vite

---

## Project Structure

```
ResearchHub-AI/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── dependencies.py
│   │
│   │   ├── ai/
│   │   │   ├── summarizer.py
│   │   │   ├── keyword_extractor.py
│   │   │   ├── chatbot.py
│   │
│   │   ├── routes/
│   │   │   ├── auth_routes.py
│   │   │   ├── ai_routes.py
│   │   │   ├── search_routes.py
│   │
│   ├── requirements.txt
│   ├── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── Chat.tsx
│   │   │
│   │   ├── services/api.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │
│   ├── package.json
│
└── README.md
```

---

# Backend Setup

## 1. Navigate to Backend

```bash
cd backend
```

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### requirements.txt

```
fastapi
uvicorn
groq
python-dotenv
sqlalchemy
passlib[bcrypt]
python-jose
pydantic
requests
```

---

## 3. Create Environment File

Create a `.env` file inside the `backend/` directory:

```
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## 4. Run Backend Server

```bash
uvicorn app.main:app --reload
```

Backend URL:
```
http://127.0.0.1:8000
```

Swagger API Documentation:
```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

## 1. Navigate to Frontend

```bash
cd frontend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start Development Server

```bash
npm run dev
```

Frontend URL:
```
http://localhost:5173
```

---

# API Endpoints

## Authentication
```
POST /register
POST /login
```

## Research Search
```
GET /search?query=...
```

## AI Services
```
POST /chat
POST /analyze-paper
```

---

# Example: Analyze Paper

## Endpoint
```
POST /analyze-paper
```

## Request Body

```json
{
  "text": "Research paper content here..."
}
```

## Response

```json
{
  "summary": "...",
  "key_findings": [...],
  "research_questions": [...],
  "keywords": [...]
}
```

---

# AI Agent Architecture

```
ai/
├── summarizer.py
├── keyword_extractor.py
├── chatbot.py
```

Each AI module is modular, reusable, and independently scalable.

---

# Authentication Flow

1. User registers with email and password  
2. Password is hashed using bcrypt  
3. JWT token is generated on login  
4. Token is stored in localStorage  
5. Protected routes validate JWT before access  

---

# Production Deployment

## Backend (Production Mode)

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Frontend Build

```bash
npm run build
```

---

# Future Enhancements

- PostgreSQL migration
- Docker containerization
- Redis caching
- Role-based access control
- PDF upload and parsing
- Vector database integration
- Semantic search
- CI/CD pipeline

---

## Final Note

ResearchHub AI is designed to demonstrate how modern AI systems can be integrated into full-stack applications using a modular and scalable architecture. The project showcases secure authentication, structured backend development, AI agent orchestration, and seamless frontend integration.

This system reflects practical implementation of:

- Agentic AI architecture
- LLM integration using Groq (Llama3)
- RESTful API development with FastAPI
- Secure JWT-based authentication
- Scalable React + TypeScript frontend design
- Clean project structuring for production readiness

The architecture is intentionally modular to allow future expansion such as vector databases, semantic search, document upload pipelines, containerization, and cloud deployment.

ResearchHub AI represents a foundation for building intelligent research automation systems in real-world environments.

---

Built with a focus on clean architecture, security, and scalable AI integration.
