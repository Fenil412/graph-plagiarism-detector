# 🧠 Graph Plagiarism Detector — Backend

A high-performance Python backend service leveraging graph theoretical algorithms to compare text documents and calculate plagiarism similarity scores based on structural logic.

---

## ✨ Core Features

- **Automated NLP Pipeline**: Tokenizes, cleans, and lemmatizes text using NLTK.
- **Graph Engine**: Builds NetworkX structural representations out of sentences and words (nodes/edges).
- **Asynchronous Execution**: Leverages Python async capabilities for non-blocking I/O.
- **Robust Security**: Fully implemented bearer token JWT authentication and bcrypt hashing.
- **Algorithm Implementations**: Includes multiple metrics such as Node Overlap, Edge Similarity, Subgraph Analysis, and Graph Edit Distance (GED).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Web Framework** | FastAPI + Uvicorn |
| **Language Runtime** | Python 3.11 |
| **Database** | PostgreSQL (Neon Cloud) |
| **ORM** | Prisma (Async Python Client) |
| **Graph Logic** | NetworkX |
| **NLP** | NLTK |
| **Auth** | python-jose + passlib |

---

## 🚀 Quick Setup

### 1. Requirements
- Python 3.11 installed.
- PostgreSQL database (Neon recommended).
- Node.js (strictly for running `npx prisma`).

### 2. Environment Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Database Setup (Prisma)
Create a `.env` in the `backend` root:
```properties
DATABASE_URL="postgresql://user:password@neon-cloud-host/dbname"
JWT_SECRET_KEY="replace-this-with-a-very-secure-random-key"
```

Initialize your database schema:
```bash
# Verify prisma installation locally
prisma generate
prisma db push
```

### 5. Start Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Server live at `http://localhost:8000`
API Documentation at `http://localhost:8000/docs`

---

## 🧪 Algorithms

1. **Node Overlap**: Rapid comparison evaluating shared unique keywords/entities.
2. **Edge Similarity**: Checks for exact syntactic structural matches (who did what).
3. **Subgraph Matching**: Locates structural partial duplications inside much larger texts.
4. **Graph Edit Distance**: Compares the cost of turning one graph into the other via insertions/deletions.