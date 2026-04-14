# Career.ai RAG Suggestion Engine

A RAG (Retrieval-Augmented Generation) microservice that compares a candidate's resume against **480+ winning benchmark resumes** stored in ChromaDB, then uses Claude to generate structured improvement suggestions.

Runs on **port 8001** alongside the existing `ats-service` (port 8000).

---

## 🚀 Quick Start (run in order)

### Step 1 — Install dependencies
```bash
cd rag-service
pip install -r requirements.txt
```

### Step 2 — Set up environment variables
```bash
# Copy the template
cp .env.example .env

# Edit .env and fill in your API keys:
# ANTHROPIC_API_KEY=sk-ant-your-key-here
# OPENAI_API_KEY=sk-your-openai-key-here
```

### Step 3 — Generate benchmark resumes *(one-time, ~₹150)*
```bash
python scripts/generate_benchmarks.py
# Takes 5-10 minutes. Generates 480 synthetic resumes via GPT-4o-mini.
# Output: data/benchmark_resumes.json
```

### Step 4 — Ingest into ChromaDB *(one-time)*
```bash
python scripts/ingest.py
# Embeds all resumes and stores in chroma_db/
# Takes 5-10 minutes (downloads ~90MB model on first run).
# Output: chroma_db/ folder (~2-5MB)
```

### Step 5 — Start the API server
```bash
uvicorn api.main:app --reload --port 8001

# Verify:
# http://localhost:8001/health  → {"status": "ok"}
# http://localhost:8001/docs    → Interactive Swagger UI
```

---

## 📡 API Reference

### `POST /api/suggestions`

**Body:**
```json
{
  "resume_text": "Your resume as plain text (min 100 chars)",
  "job_description": "Target job description (min 50 chars)",
  "job_role": "Software Engineer"
}
```

**Response:**
```json
{
  "score_current": 54,
  "score_projected": 78,
  "top_insight": "Add quantified metrics to every bullet point",
  "missing_keywords": [
    {
      "keyword": "CI/CD",
      "frequency": 4,
      "where_to_add": "skills",
      "example_usage": "Implemented CI/CD pipelines using GitHub Actions"
    }
  ],
  "weak_bullets": [
    {
      "original": "Worked on the backend API",
      "rewrite": "Built REST API handling [X] requests/day, reducing latency by [Y]%",
      "reason": "No metrics or ownership signal",
      "score_impact": 8
    }
  ],
  "structural_issues": [...],
  "strengths": [...],
  "benchmark_insight": "Top candidates lead with quantified wins and use 12+ ATS keywords",
  "benchmark_keywords": ["python", "docker", "rest api", ...],
  "benchmarks_used": 5,
  "avg_similarity": 0.812
}
```

### `GET /health`
```json
{"status": "ok", "service": "career.ai RAG Suggestion Engine", ...}
```

---

## 🏗️ Architecture

```
rag-service/
├── data/
│   └── benchmark_resumes.json    ← 480+ GPT-4o-mini generated resumes
├── scripts/
│   ├── generate_benchmarks.py    ← Phase 2: one-time data generation
│   └── ingest.py                 ← Phase 3: load into ChromaDB
├── engine/
│   ├── embedder.py               ← all-MiniLM-L6-v2 (384-dim vectors)
│   ├── retriever.py              ← ChromaDB vector search
│   ├── suggester.py              ← Claude prompt + JSON parsing
│   └── pipeline.py               ← orchestrates 1→2→3
├── api/
│   └── main.py                   ← FastAPI server (port 8001)
├── chroma_db/                    ← auto-created vector database
└── feedback_schema.sql           ← Phase 8: PostgreSQL feedback loop
```

## 🔑 API Keys Required

| Key | Where | Used for |
|-----|-------|----------|
| `ANTHROPIC_API_KEY` | console.anthropic.com | Claude suggestions (ongoing) |
| `OPENAI_API_KEY` | platform.openai.com | GPT-4o-mini benchmark gen (**one-time only**) |

## 💡 Tips

- **Re-running generate_benchmarks.py** is safe — it checkpoints after every resume
- **chroma_db/** is ~2-5MB — commit it to Git so all team members share the same database
- **Port conflict?** This service uses port 8001. The existing `ats-service` uses port 8000.
- **Frontend**: Add `NEXT_PUBLIC_RAG_API_URL=http://localhost:8001` to `career-app/.env.local`
