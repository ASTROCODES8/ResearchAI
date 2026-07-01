# ResearchAI — Hybrid Graph + Vector RAG Research Assistant

An intelligent, AI-powered research paper analysis platform that combines semantic vector search with a Neo4j knowledge graph to extract, visualize, and query knowledge from academic documents.

> **Live Demo:** [Coming Soon](#) &nbsp;|&nbsp; **Author:** [ASTROCODES8](https://github.com/ASTROCODES8)

---

## Overview

ResearchAI helps researchers, students, and professionals instantly understand and extract insights from academic PDFs. By combining traditional vector search with a Neo4j knowledge graph, the platform answers complex, multi-hop questions with precise citations and interactive relationship maps.

**Users can:**
- Upload research papers (PDF)
- Automatically extract metadata — title, authors, publish date, overview
- Generate AI summaries of complex papers
- Ask natural language questions across uploaded documents
- Retrieve answers using Hybrid Graph + Vector RAG
- View citations and exact sources used by the AI
- Explore an interactive knowledge graph of extracted concepts and relationships
- View query history with persistent context

---

## Features

### Authentication
Secure JWT-based authentication with access and refresh tokens stored in HTTP-only cookies. Includes signup, login, and session rehydration.

### Paper Processing
Direct PDF uploads handled via Cloudinary. Asynchronous AI processing extracts core metadata directly from the document.

### AI Summarization
Automatic, high-level summary generation for every uploaded paper using Google Gemini 2.5 Flash.

### Chunking & Embeddings
Intelligent section-aware document chunking with semantic embeddings generated via Gemini and stored in Qdrant for fast similarity search.

### Knowledge Graph
Entity and relationship extraction from raw text using Gemini. Graph data stored in Neo4j with an interactive, full-screen React Flow visualization (auto-layout with Dagre) showing interconnected concepts.

### Semantic Search & Hybrid Retrieval
- **Vector Retrieval:** Finds relevant text chunks using semantic similarity via Qdrant
- **Graph Retrieval:** Navigates the Neo4j knowledge graph to find structured relationships and multi-hop facts
- **Combined Context:** Both contexts are merged and fed to Gemini to generate accurate, hallucination-reduced answers

### Frontend & UX
Modern SaaS aesthetic with glassmorphism, animated gradients, and micro-interactions. Professional blue/purple color palette with full dark mode support.

---

## Screenshots

> Coming soon — deploy link and screenshots will be added here.

---

## Architecture

```
React Frontend (Vite + TypeScript)
        ↓
FastAPI Backend (Python)
        ↓
┌─────────────────────────────────────────┐
│              Data Layer                 │
│  MongoDB   · Qdrant   · Neo4j           │
│  metadata    vectors    knowledge graph │
│                                         │
│  Cloudinary — PDF blob storage          │
└─────────────────────────────────────────┘
        ↓
Google Gemini 2.5 Flash
summarization · extraction · embeddings · answers
```

**Pipeline responsibilities:**
- **Ingestion:** Reads the PDF, extracts text, generates an overview, uploads to Cloudinary, chunks the text, computes embeddings for Qdrant, extracts graph nodes and edges for Neo4j, saves metadata to MongoDB
- **Retrieval:** Embeds the user question, queries Qdrant for semantic chunks, queries Neo4j for structural facts, combines both into a unified prompt, returns the answer alongside graph facts and source citations

---

## Hybrid Graph RAG — Why It Matters

Pure vector search struggles with multi-hop reasoning (connecting facts across different pages) and structural relationships (e.g., "Drug A *inhibits* Protein B"). By combining vectors for semantic meaning with a knowledge graph for structured facts, ResearchAI reduces hallucinations and improves accuracy on complex questions.

**Implemented pipeline:**

```
1. PDF Upload
        ↓
2. Text Extraction (PyPDF)
        ↓
3. Section-aware Chunking
        ↓
4. Gemini Entity Extraction — nodes + edges
        ↓
5. Chunk Embeddings → Qdrant
        ↓
6. Entity + Relationship Graph → Neo4j
        ↓
7. User Question
        ↓
8. Hybrid Retrieval
   ├── Qdrant similarity search (semantic chunks)
   └── Neo4j graph traversal (structured facts)
        ↓
9. Gemini Answer Generation
   grounded in both text chunks and explicit graph facts
```

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), TypeScript |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | MongoDB |
| **Vector Database** | Qdrant Cloud |
| **Graph Database** | Neo4j AuraDB |
| **Authentication** | JWT, Passlib (bcrypt), python-jose |
| **Cloud Storage** | Cloudinary |
| **LLM / AI** | Google Gemini 2.5 Flash, LangChain |
| **Embeddings** | Google Generative AI (gemini-embedding-001) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Graph Visualization** | React Flow (@xyflow/react), Dagre |

---

## API Endpoints

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/signup` | Register a new user |
| **Auth** | `POST` | `/auth/login` | Authenticate and receive cookies |
| **Auth** | `POST` | `/auth/refresh` | Refresh access tokens |
| **Auth** | `POST` | `/auth/logout` | Clear authentication cookies |
| **Auth** | `GET` | `/auth/me` | Rehydrate user session |
| **Papers** | `POST` | `/papers/upload` | Upload a PDF and run the full RAG pipeline |
| **Papers** | `GET` | `/papers/history` | List all uploaded papers for the user |
| **Papers** | `GET` | `/papers/{paper_id}` | Get specific paper metadata |
| **Papers** | `DELETE` | `/papers/{paper_id}` | Cascading delete across Qdrant, Neo4j, and MongoDB |
| **Graph** | `GET` | `/papers/{paper_id}/graph` | Retrieve nodes, edges, and graph stats for a paper |
| **Query** | `POST` | `/query/` | Ask a question using Hybrid RAG |
| **Query** | `GET` | `/query/history` | Retrieve past questions and answers |

---

## Project Structure

```
research-summarizer/
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   └── schemas.py
│   ├── prompts/
│   │   ├── extraction_prompt.py
│   │   ├── graph_extraction_prompt.py
│   │   ├── qa_prompt.py
│   │   └── query_entity_prompt.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── graph.py
│   │   ├── papers.py
│   │   └── query.py
│   ├── services/
│   │   ├── auth_dependency.py
│   │   ├── chunking_service.py
│   │   ├── cloudinary_service.py
│   │   ├── embedding_service.py
│   │   ├── entity_extraction_service.py
│   │   ├── graph_client.py
│   │   ├── graph_service.py
│   │   ├── history_service.py
│   │   ├── paper_service.py
│   │   ├── query_service.py
│   │   ├── token_service.py
│   │   └── user_service.py
│   └── vectorstore/
│       └── qdrant_client.py
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── DashboardLayout.tsx
        │   ├── KnowledgeGraphModal.tsx
        │   └── PaperCard.tsx
        ├── context/
        │   ├── AuthContext.tsx
        │   └── ThemeContext.tsx
        ├── lib/
        │   └── api.ts
        └── pages/
            ├── HistoryPage.tsx
            ├── KnowledgeGraphPage.tsx
            ├── LandingPage.tsx
            ├── LoginPage.tsx
            ├── QueryHistoryPage.tsx
            ├── QueryPage.tsx
            ├── SignupPage.tsx
            └── UploadPage.tsx
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB Atlas cluster
- Qdrant Cloud cluster
- Neo4j AuraDB free instance
- Cloudinary account
- Google Gemini API key

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # fill in your credentials
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env           # set VITE_API_URL=http://localhost:8000
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
| :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `QDRANT_URL` | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | Qdrant Cloud API key |
| `NEO4J_URI` | Neo4j AuraDB connection URI |
| `NEO4J_USERNAME` | Neo4j username (default: `neo4j`) |
| `NEO4J_PASSWORD` | Neo4j instance password |

### Frontend (`frontend/.env`)

| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | FastAPI backend URL (e.g. `http://localhost:8000`) |

---

## Future Improvements

- **Cross-paper reasoning:** Enable queries to explicitly compare methodologies across multiple documents
- **Graph analytics:** Community detection and centrality scoring on the Neo4j graph to surface core themes automatically
- **Citation highlighting:** Link directly to the exact page and paragraph in a PDF viewer
- **Streaming responses:** Server-Sent Events (SSE) for real-time Gemini response streaming

---

## License

MIT
