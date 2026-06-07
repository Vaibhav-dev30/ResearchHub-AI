# Product Requirements Document (PRD): ResearchHub AI v2.0

## 1. Executive Summary & Product Overview
**ResearchHub AI** is an AI-powered academic research management platform designed to help students, academics, and researchers search, summarize, analyze, and organize scientific literature. 

The application integrates real-time scientific data from **ArXiv** with high-performance LLMs (via the **Groq API**) to automate the tedious process of reading and synthesizing academic papers. Users can build their own research library, analyze individual papers, converse with an AI agent about specific papers, and export summaries.

---

## 2. Tech Stack & Architecture
* **Frontend**: React (Vite) + TypeScript + TailwindCSS / Vanilla CSS, Lucide icons, Axios.
* **Backend**: FastAPI (Python 3.11+), Uvicorn, Jose (JWT), Bcrypt (Password Hashing).
* **Database**: SQLAlchemy ORM. Supports SQLite (local dev) and PostgreSQL (Neon/production).
* **AI Engine**: Groq API (`llama-3.1-8b-instant` or similar LLaMA models).
* **External Integration**: ArXiv API (XML Atom Feed wrapper).
* **Deployment**: Docker (`Dockerfile` for frontend & backend, `docker-compose.yml`), Vercel (Frontend & Serverless Backend).

---

## 3. Core User Personas
1. **The Graduate Student**: Needs to quickly survey a new topic, extract key findings, and decide if a paper is worth reading fully.
2. **The Active Researcher**: Needs to catalog papers, keep notes/analyses organized in one library, and ask contextual questions about specific papers.
3. **The Academic Writer**: Needs quick access to citation information, summaries, and Markdown exports to integrate into their draft bibliographies.

---

## 4. Functional Requirements (V2.0 Implemented Features)

### 4.1. User Management & Authentication (FR-01)
* **Registration**: Users can sign up with a unique username and password. Passwords must be hashed using `bcrypt` before storage.
* **Login**: Users receive a JWT access token upon successful authentication.
* **Session Management**: JWT token is stored in the frontend's `localStorage` and sent via `Authorization: Bearer <token>` header for protected routes.
* **Route Protection**: Frontend guards all dashboard, search, and AI pages. Unauthenticated users are redirected to `/login`.

### 4.2. Literature Search & Discovery (FR-02)
* **Search Engine**: Real-time integration with the **ArXiv API**.
* **Queries**: Users can search by title, keywords, authors, or subjects.
* **Results Card**: Displays paper title, abstract snippet, authors list, and direct links to the ArXiv source.
* **Actions**: One-click option to open a paper directly in the AI Analyzer or AI Chat.

### 4.3. AI-Powered Paper Analysis (FR-03)
* **Summarization**: Generates a 150-200 word structured academic summary.
* **Findings Extraction**: Identifies the core methodology, discoveries, and limitations.
* **Question Generation**: Auto-generates 5 relevant research questions from the abstract.
* **Keyword Tagging**: Automatically extracts 10 core keywords/tags.
* **Processing**: Powered by Groq's LLaMA 3 model, optimized for fast response times (<2s).

### 4.4. Contextual AI Chat (FR-04)
* **Modes**:
  1. *General Mode*: Standard chatbot assistant for general research queries.
  2. *Paper-Primed Mode*: Toggles a specific paper's context. When toggled, the LLM is primed with the abstract, authors, and title to answer questions specific to that paper.
* **Interface**: Chat bubble interface with clear status indicator showing if "Paper Context" is active.

### 4.5. Personal Library & saved Analyses (FR-05)
* **Saving**: Save any analyzed paper (including its auto-generated summary, keywords, title, and authors) to the database.
* **Dashboard Library**: View all saved papers in a structured grid/list.
* **Actions on Library**:
  * Expand card to view full summary/keywords.
  * Start a paper-primed chat instantly from the saved item.
  * Delete the item from the library.

### 4.6. Export Utilities (FR-06)
* **Export format**: Download paper summary, metadata, and keywords as a formatted Markdown (`.md`) file for local notes apps (e.g., Obsidian, Notion).

---

## 5. Database Schema & Data Models

### 5.1. User Table (`users`)
* `id` (Integer, Primary Key)
* `username` (String, Unique, Index)
* `hashed_password` (String)

### 5.2. Paper Cache Table (`papers`)
* `id` (Integer, Primary Key)
* `title` (String, Index)
* `abstract` (Text)
* `authors` (String)

### 5.3. Saved Analysis Table (`saved_analyses`)
* `id` (Integer, Primary Key)
* `user_id` (Integer, Foreign Key ➔ `users.id`)
* `title` (String)
* `authors` (String)
* `abstract` (Text)
* `summary` (Text)
* `keywords` (Text) — Comma-separated values
* `created_at` (DateTime)

---

## 6. Backend API Specifications

| Method | Endpoint | Auth Required | Description |
|:---|:---|:---|:---|
| **POST** | `/register` | No | Creates a new user account |
| **POST** | `/login` | No | Authenticates user and returns JWT token |
| **GET** | `/search?query=...` | Yes | Queries ArXiv database |
| **POST** | `/analyze-paper` | Yes | Summarizes paper & extracts tags |
| **POST** | `/chat` | Yes | Converses with LLaMA (optional paper context) |
| **GET** | `/saved-analyses` | Yes | Retrieves all saved analyses for logged-in user |
| **POST** | `/saved-analyses` | Yes | Saves a new paper analysis to user's library |
| **DELETE** | `/saved-analyses/{id}` | Yes | Deletes a saved analysis by ID |
| **GET** | `/health` | No | System health check and API version |
