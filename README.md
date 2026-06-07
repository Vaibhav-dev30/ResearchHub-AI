# ResearchHub AI v2.0
### AI-Powered Academic Research Management Platform

ResearchHub AI is a full-stack, production-ready AI research management system built with **FastAPI**, **React + TypeScript (Vite)**, **SQLite/SQLAlchemy**, and **Groq's LLaMA 3** model via the Groq API. It enables real-time academic paper discovery via **ArXiv**, AI-powered paper analysis, contextual AI conversations, and personal research library management.

---

## ✨ Features

### 🔐 Authentication
- Secure JWT-based registration and login
- bcrypt password hashing
- Token stored in localStorage with 7-day expiry

### 🔍 Literature Search
- **Live ArXiv API integration** — search millions of real papers in real-time
- Results include title, abstract, authors, and direct ArXiv link
- One-click redirect from any result to the AI analysis interface

### 🤖 AI Paper Analysis (Groq + LLaMA 3)
- 150–200 word academic summary
- Key findings extraction
- 5 research questions generation
- 10 keyword extraction
- Powered by `llama-3.1-8b-instant` via the Groq API

### 💬 Contextual AI Chat
- General research chat assistant
- **Paper-primed chat**: toggle paper context so the AI answers specifically about a loaded paper
- Seamless chat initialization from Search or Library

### 📚 Saved Protocols Library
- Save any analysis to your personal library (persisted in database per user)
- Expandable cards with summary and keywords
- Open any saved paper directly in a primed AI chat session
- Delete entries from the dashboard

### 📤 Export
- Export full analysis (summary + keywords) to a Markdown `.md` file

### 🚀 Deployment Ready
- `.env` + `.env.example` templates for both backend and frontend
- `Dockerfile` for backend (Python 3.11 slim + Uvicorn)
- `Dockerfile` for frontend (Node 20 build + Nginx Alpine)
- `docker-compose.yml` to orchestrate both services
- Health check endpoint at `/health`

---

## 🗂 Project Structure

```
ResearchHub-AI/
├── backend/
│   ├── ai/
│   │   ├── chatbot.py          # Groq LLM chat (supports paper context)
│   │   ├── keyword_extractor.py
│   │   └── summarizer.py
│   ├── auth.py
│   ├── database.py
│   ├── main.py                 # All API endpoints
│   ├── models.py               # User, Paper, SavedAnalysis models
│   ├── schemas.py              # Pydantic schemas
│   ├── requirements.txt
│   ├── .env.example            ← copy to .env and fill in values
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Saved Protocols Library
│   │   │   ├── Search.tsx      # ArXiv search
│   │   │   ├── AIChat.tsx      # Analysis + Chat + Save + Export
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── api.ts              # Axios with env-based base URL
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example            ← copy to .env and fill in values
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ⚡ Local Development Setup

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` from template:
```bash
cp .env.example .env
```

Edit `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_random_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

> **Get your free Groq API key at:** https://console.groq.com/keys

Start the backend:
```bash
uvicorn main:app --reload
```

API available at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

---

### 2. Frontend

```bash
cd frontend
npm install
```

Create `.env` from template:
```bash
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

Start the dev server:
```bash
npm run dev
```

Frontend available at: `http://localhost:5173`

---

## 🐳 Docker Deployment

### Quick Start

```bash
# 1. Fill in backend environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your GROQ_API_KEY and SECRET_KEY

# 2. Build and start all services
docker compose up --build -d
```

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs

### Stop all services

```bash
docker compose down
```

SQLite data is persisted in the `./data/` volume directory.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create new user |
| POST | `/login` | Get JWT access token |

### Research
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?query=...` | Search ArXiv papers (auth required) |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Chat with AI, optional paper context |
| POST | `/analyze-paper` | Summarize, extract keywords & findings |

### Library
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/saved-analyses` | Get user's saved analyses |
| POST | `/saved-analyses` | Save a new analysis |
| GET | `/saved-analyses/{id}` | Get a specific analysis |
| DELETE | `/saved-analyses/{id}` | Delete an analysis |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (returns version) |

---

## 🔑 Getting Your Groq API Key

1. Go to [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up or log in
3. Create a new API key
4. Paste it into `backend/.env` as `GROQ_API_KEY=your_key_here`

The free tier is extremely generous — plenty for development and demos.

---

## 🛣 Roadmap / Future Enhancements

- [ ] PDF upload and full-text parsing
- [ ] PostgreSQL migration (production database)
- [ ] Redis caching for ArXiv search results
- [ ] Vector database + semantic similarity search
- [ ] Role-based access control (admin, researcher)
- [ ] Citation graph visualization
- [ ] Email verification
- [ ] CI/CD pipeline (GitHub Actions)

---

Built with ❤️ using FastAPI · React · Groq · ArXiv · SQLAlchemy
