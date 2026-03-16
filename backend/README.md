# Graph Plagiarism Detector Backend

A FastAPI-based backend service for detecting plagiarism in documents using graph-based similarity algorithms. The system processes uploaded documents, builds word/sentence co-occurrence graphs, and compares them to identify potential plagiarism.

## Features

- **Document Upload**: Support for PDF, TXT, and DOCX files
- **Graph Construction**: Automatic building of word or sentence co-occurrence graphs
- **Plagiarism Detection**: Multiple similarity algorithms (node overlap, edge similarity, subgraph, graph edit distance)
- **User Authentication**: JWT-based authentication system
- **Background Processing**: Asynchronous graph building and comparison tasks
- **Database Integration**: Prisma ORM with PostgreSQL

## Setup

### Prerequisites

- Python 3.8+
- PostgreSQL database (Neon recommended)
- Node.js (for Prisma)

### Installation

1. Clone the repository and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Configure environment variables:
   Create a `.env` file with:
   ```
   DATABASE_URL="postgresql://user:password@host:port/database"
   JWT_SECRET_KEY="your-secret-key"
   JWT_ALGORITHM="HS256"
   JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
   MAX_FILE_SIZE_MB=10
   UPLOAD_DIR="uploads"
   LOG_LEVEL="INFO"
   ```

6. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

## API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

#### POST /api/v1/auth/login
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

#### GET /api/v1/auth/me
Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "created_at": "2023-..."
}
```

### Document Endpoints

#### POST /api/v1/documents/upload
Upload a document for processing.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: PDF/TXT/DOCX file
- `title`: Document title (optional)

**Response:**
```json
{
  "id": "uuid",
  "title": "document.pdf",
  "status": "PROCESSING",
  "uploaded_at": "2023-..."
}
```

#### GET /api/v1/documents/
List all user documents (paginated).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "doc1.pdf",
      "status": "READY",
      "uploaded_at": "2023-..."
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### GET /api/v1/documents/{id}
Retrieve specific document details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "title": "doc1.pdf",
  "content": "extracted text...",
  "status": "READY",
  "uploaded_at": "2023-..."
}
```

#### DELETE /api/v1/documents/{id}
Delete a document.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

### Graph Endpoints

#### POST /api/v1/graphs/generate
Generate a graph for a document.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "document_id": "uuid",
  "graph_type": "word_cooccurrence"
}
```

**Response:**
```json
{
  "graph_id": "uuid",
  "nodes": [...],
  "edges": [...],
  "generated_at": "2023-..."
}
```

#### GET /api/v1/graphs/{document_id}
Retrieve pre-built graph data.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "nodes": [...],
  "edges": [...],
  "graph_type": "word_cooccurrence"
}
```

### Plagiarism Detection Endpoints

#### POST /api/v1/plagiarism/compare
Compare two documents for plagiarism.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "document1_id": "uuid",
  "document2_id": "uuid",
  "algorithm": "node_overlap"
}
```

**Response:**
```json
{
  "comparison_id": "uuid",
  "similarity_score": 0.85,
  "algorithm": "node_overlap",
  "status": "COMPLETED"
}
```

#### GET /api/v1/plagiarism/report/{comparison_id}
Fetch detailed plagiarism report.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "comparison_id": "uuid",
  "document1_id": "uuid",
  "document2_id": "uuid",
  "similarity_score": 0.85,
  "algorithm": "node_overlap",
  "matched_sections": [...],
  "report_generated_at": "2023-..."
}
```

#### GET /api/v1/plagiarism/algorithms
List supported similarity algorithms.

**Response:**
```json
{
  "algorithms": [
    "node_overlap",
    "edge_similarity",
    "subgraph",
    "graph_edit_distance"
  ]
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure DATABASE_URL is correctly set
   - Run `npx prisma db push` to sync schema

2. **File Upload Fails**
   - Check MAX_FILE_SIZE_MB setting
   - Ensure uploads directory exists and is writable

3. **Graph Generation Timeout**
   - Large documents may take time; check background tasks
   - Monitor logs for processing status

4. **Authentication Errors**
   - Verify JWT_SECRET_KEY is set
   - Check token expiration (24 hours default)

### Logs

Logs are stored in the `logs/` directory. Set LOG_LEVEL in environment variables for verbosity.

## Development

- Run tests: `python -m pytest`
- Format code: `black .`
- Lint: `flake8 .`

## License

See LICENSE file in root directory.