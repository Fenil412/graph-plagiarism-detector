# 🧠 Graph Plagiarism Detector — Backend

A high-performance Python backend service leveraging graph theoretical algorithms to compare text documents and calculate plagiarism similarity scores based on structural logic.

---

## ✨ Core Features

- **Automated NLP Pipeline**: Tokenizes, cleans, and lemmatizes text using NLTK (WordNet, Punkt).
- **Graph Engine**: Builds NetworkX structural representations out of sentences and words (nodes/edges).
- **Asynchronous Execution**: Leverages Python async capabilities for non-blocking I/O via FastAPI and Prisma.
- **Robust Security**: Fully implemented bearer token JWT authentication and bcrypt hashing for user management.
- **Multiple Algorithms**: Multi-metric comparisons including Node Overlap, Edge Similarity, Subgraph Analysis, and Graph Edit Distance (GED).
- **PDF Report Generation**: Automated PDF report building using ReportLab for detailed similarity analysis results.

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Web Framework** | FastAPI + Uvicorn | 0.111 / 0.29 |
| **Language Runtime** | Python 3.11+ | 3.11 |
| **Database** | PostgreSQL (Neon Cloud) | - |
| **ORM** | Prisma (Async Python Client) | 0.13 |
| **Graph Logic** | NetworkX | 3.3 |
| **NLP** | NLTK | 3.8.1 |
| **ML / Similarity** | Scikit-Learn (TF-IDF) + NumPy | 1.4.2 / 1.26 |
| **Auth** | python-jose + passlib | 3.3 / 1.7 |
| **PDF Generation** | ReportLab | 4.1.0 |

---

## 🚀 Quick Setup

### 1. Requirements
- Python 3.11+ installed.
- PostgreSQL database (Neon recommended).
- Node.js (strictly for running `npx prisma` generation).

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
API_VERSION="v1"
APP_NAME="GraphPlagiarismDetector"
BACKEND_URL="http://localhost:8000"
```

Initialize your database schema:
```bash
prisma generate
prisma db push
```

### 5. Start Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Server live at `http://localhost:8000`
- API Documentation at `http://localhost:8000/docs` or `/redoc`

---

## 🧪 Graph Algorithms Explained

The backend employs several metrics for comparing documents:

1. **🚀 Node Overlap**: Rapid comparison evaluating shared unique keywords and entities (nodes).
2. **🕸️ Edge Similarity**: Checks for exact syntactic structural matches (who did what / relational logic).
3. **🔍 Subgraph Matching**: Locates structural partial duplications inside much larger texts (detecting rephrasing with original structure).
4. **📏 Graph Edit Distance (GED)**: Measures the cost to transform one graph into another via node/edge modifications.

---

## 📂 Backend Project Structure

- `/app/`: Core application logic.
  - `/routers/`: API route definitions.
  - `/services/`: Business logic and database operations.
  - `/graph_engine/`: Graph construction and algorithm implementations.
  - `/preprocessing/`: NLP and text cleaning utilities.
  - `/schemas/`: Pydantic models for request/response validation.
- `/prisma/`: Database schema definition (`schema.prisma`).
- `/uploads/`: Directory for storing temporary uploaded files.