# Graph-Based Plagiarism Detection System — Backend

A **production-ready** FastAPI backend that converts documents into graph structures and detects plagiarism using graph similarity algorithms.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Python 3.11 |
| Web Framework | FastAPI + Uvicorn |
| Database | PostgreSQL (Neon Cloud) |
| ORM | Prisma (async Python client) |
| Graph Algorithms | NetworkX |
| NLP / Preprocessing | NLTK |
| Authentication | JWT (python-jose + passlib) |
| Config | python-dotenv + Pydantic Settings |

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                     ← FastAPI app, middleware, routers
│   ├── config/
│   │   ├── settings.py             ← Pydantic BaseSettings (.env loader)
│   │   └── logger.py               ← Loguru logger (console + rotating file)
│   ├── routers/
│   │   ├── auth_router.py          ← /api/v1/auth/*
│   │   ├── document_router.py      ← /api/v1/documents/*
│   │   ├── graph_router.py         ← /api/v1/graphs/*
│   │   └── plagiarism_router.py    ← /api/v1/plagiarism/*
│   ├── services/
│   │   ├── auth_service.py         ← register, login, get user
│   │   ├── document_service.py     ← upload, CRUD, text extraction
│   │   ├── graph_service.py        ← graph generation + storage
│   │   └── plagiarism_service.py   ← compare + report generation
│   ├── schemas/
│   │   ├── user_schemas.py         ← Pydantic request/response models
│   │   ├── document_schemas.py
│   │   ├── graph_schemas.py
│   │   └── plagiarism_schemas.py
│   ├── prisma/
│   │   └── client.py               ← Async Prisma singleton + DI
│   ├── middleware/
│   │   ├── logging_middleware.py   ← Request timing + tracing
│   │   └── error_middleware.py     ← Global 500 JSON handler
│   ├── graph_engine/
│   │   └── graph_builder.py        ← NetworkX word/sentence graph builders
│   ├── plagiarism_engine/
│   │   ├── similarity.py           ← 4 graph similarity algorithms
│   │   └── detector.py             ← End-to-end detection orchestrator
│   ├── preprocessing/
│   │   └── text_preprocessor.py   ← NLTK pipeline (clean→token→lemma)
│   ├── background_tasks/
│   │   └── graph_tasks.py          ← Async graph build after upload
│   └── utils/
│       ├── auth.py                 ← bcrypt + JWT helpers
│       ├── dependencies.py         ← FastAPI JWT dependency
│       └── file_utils.py           ← Upload validation + text extraction
├── prisma/
│   └── schema.prisma               ← Database schema (5 models)
├── requirements.txt
├── .env.example                    ← Copy to .env and fill in values
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.11 installed
- A [Neon](https://neon.tech) PostgreSQL database created
- (Optional) `pdfplumber` and `python-docx` for PDF/DOCX support

### 2. Clone and set up

```bash
git clone https://github.com/your-repo/graph-plagiarism-detector
cd graph-plagiarism-detector/backend

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1
# Activate (macOS / Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure environment

```bash
# Copy the template
copy .env.example .env    # Windows
cp .env.example .env      # macOS / Linux

# Open .env and fill in:
#   DATABASE_URL  ← your Neon connection string
#   JWT_SECRET    ← any strong random string
```

### 4. Set up the database

```bash
# Generate the Prisma Python client
prisma generate

# Push the schema to Neon (creates/migrates tables)
prisma db push
```

### 5. Run the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is now live at **http://localhost:8000**
Interactive docs at **http://localhost:8000/docs**

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login → JWT token |
| GET | `/api/v1/auth/me` | Current user profile |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/upload` | Upload a document (pdf/txt/docx) |
| GET | `/api/v1/documents/` | List user's documents |
| GET | `/api/v1/documents/{id}` | Get document details |
| DELETE | `/api/v1/documents/{id}` | Delete document |

### Graphs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/graphs/generate` | Build graph for a document |
| GET | `/api/v1/graphs/{document_id}` | Retrieve stored graph |

### Plagiarism

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/plagiarism/compare` | Compare two documents |
| GET | `/api/v1/plagiarism/report/{id}` | Detailed report |
| GET | `/api/v1/plagiarism/algorithms` | List supported algorithms |

---

## 🧮 Similarity Algorithms

| Algorithm | Speed | Best Use Case |
|-----------|-------|---------------|
| `node_overlap` | ⚡ Fast | General-purpose comparison |
| `edge_similarity` | ⚡ Fast | Structure-aware comparison |
| `subgraph` | 🔁 Medium | Partial plagiarism detection |
| `graph_edit_distance` | 🐢 Slow | Exact comparison (small docs) |

---

## 🔒 Security

- Passwords are hashed with **bcrypt** (cost factor 12)
- JWT tokens expire after 24 hours (configurable)
- All document endpoints require a valid Bearer token
- Users can only access their own documents

---

## 🌐 Frontend Integration

The React + Vite frontend communicates with this backend via:

```javascript
// Example: login
const response = await fetch("http://localhost:8000/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { access_token } = await response.json();

// Example: upload document
const form = new FormData();
form.append("file", fileObject);
await fetch("http://localhost:8000/api/v1/documents/upload", {
  method: "POST",
  headers: { Authorization: `Bearer ${access_token}` },
  body: form,
});
```

Ensure `FRONTEND_URL` and `CORS_ORIGINS` in `.env` include your Vite dev server URL.

---

## ⚡ Scalability Notes

| Challenge | Solution |
|-----------|----------|
| Large documents | Graph building runs in background task |
| Many concurrent users | Async Prisma + async FastAPI throughout |
| Slow GED on big graphs | Auto-fallback to node_overlap above 50 nodes |
| Caching | Add Redis in front of graph retrieval endpoints |
| Horizontal scaling | Stateless JWT — deploy behind load balancer |