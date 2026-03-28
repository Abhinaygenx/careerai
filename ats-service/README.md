# Antigravity ATS Service

High-precision ATS resume scorer using 100% free, open-source, locally-hostable libraries.

**Stack:** FastAPI · PyMuPDF · BGE-small-en-v1.5 embeddings · Llama-3-8B (Groq free tier) · ChromaDB

---

## Quick Start

### 1. Create & activate a virtual environment

```powershell
cd c:\Users\Abhin\Desktop\career.AI
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```powershell
cd ats-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

> **First run only:** `sentence-transformers` will auto-download `BAAI/bge-small-en-v1.5` (~130MB). Requires internet once, then runs fully offline.

### 3. Configure environment (optional — for AI feedback)

```powershell
copy .env.example .env
# Edit .env and set GROQ_API_KEY=your_key_here
# Get a FREE key at: https://console.groq.com
```

> Without a Groq key, the service falls back to deterministic rule-based feedback. Scoring still works perfectly.

### 4. Start the service

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Service runs at: **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

---

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `POST` | `/analyze` | Analyze resume PDF |

### `POST /analyze`

**Form data:**
- `resume` (file, required) — PDF resume
- `job_description` (string, optional) — For targeted keyword + semantic analysis

**Response:**
```json
{
  "overall_score": 78,
  "breakdown": { "semantic": 82, "keyword": 71, "format": 80 },
  "matched_keywords": ["Python", "FastAPI", "Docker"],
  "missing_keywords": ["Kubernetes", "CI/CD"],
  "sections_detected": { "contact": true, "experience": true, ... },
  "word_count": 512,
  "critical_improvements": ["Add quantified achievements...", "..."],
  "star_analysis": "Your resume demonstrates...",
  "ai_powered": true,
  "model_used": "llama-3-8b-8192"
}
```

---

## Running Both Servers (Full Stack)

Open **two terminals**:

**Terminal 1 — Python ATS Service:**
```powershell
cd c:\Users\Abhin\Desktop\career.AI
.\.venv\Scripts\Activate.ps1
cd ats-service
uvicorn main:app --port 8000 --reload
```

**Terminal 2 — Next.js App:**
```powershell
cd c:\Users\Abhin\Desktop\career.AI\career-app
npm run dev
```

Then open **http://localhost:3000/ats-checker** in your browser.

---

## Scoring Algorithm

| Component | Weight | Method |
|---|---|---|
| Semantic Match | 60% | BGE-small cosine similarity vs JD or quality reference |
| Keyword Coverage | 25% | Regex pattern matching against 60+ tech terms |
| Format & Structure | 15% | Section detection + bullet usage + quantification heuristics |

---

## Deployment

### Hugging Face Spaces (Free)
The FastAPI app is HF Spaces compatible. Set `GROQ_API_KEY` as a Space secret.

### Render Free Tier
Deploy `ats-service/` as a Python web service. Set env vars in the Render dashboard.
