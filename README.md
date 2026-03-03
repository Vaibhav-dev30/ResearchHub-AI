# ResearchHub AI

Intelligent Research Paper Management System using Agentic AI.

## Project Structure
- `/backend`: FastAPI Python server with Groq AI integration.
- `/frontend`: React + TypeScript frontend.

## Requirements
- Python 3.10+
- Node.js & npm
- Groq API Key

## Setup & Run Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Create .env file with your GROQ_API_KEY
copy .env.example .env

# Run server
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Usage
- The backend API runs on `http://localhost:8000`.
- The frontend UI runs on `http://localhost:5173`.
- Register an account, log in, search for mock research papers, use the AI Chat, and Analyze papers!
