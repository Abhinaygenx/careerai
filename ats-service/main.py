"""
main.py — FastAPI ATS microservice entrypoint
Endpoints:
    POST /analyze  — analyze a resume PDF (+ optional job description)
    GET  /health   — liveness probe
Run with: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""
import os
os.environ["HF_HUB_DISABLE_SYMLINKS"] = "1"
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Pre-load the embedding model at startup (avoids cold-start on first request)
from embeddings import get_model  # noqa: E402
from llm_feedback import generate_feedback  # noqa: E402
from parser import extract_text  # noqa: E402
from scorer import score_resume  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[startup] Pre-loading embedding model...")
    get_model()  # Downloads & caches on first run
    print("[startup] ATS service ready.")
    yield


# ---------------------------------------------------------------------------
# App init
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Antigravity ATS Engine",
    description="High-precision ATS resume scorer powered by BGE embeddings + Llama-3",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the Next.js frontend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "https://*.huggingface.co",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": "BAAI/bge-small-en-v1.5",
        "llm": "llama-3-8b-8192 (groq)",
        "vectordb": "chromadb",
    }


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(..., description="PDF resume file"),
    job_description: str = Form(default="", description="Job description text (optional)"),
):
    """
    Analyze a resume PDF against an optional job description.

    Returns:
    - overall_score (0-100)
    - breakdown (semantic, keyword, format subscores)
    - matched_keywords / missing_keywords
    - critical_improvements (LLM or rule-based)
    - star_analysis (narrative summary)
    """
    # --- Validate file type ---
    if not resume.filename or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported. Please upload a .pdf resume.",
        )

    # --- Read & parse PDF ---
    try:
        pdf_bytes = await resume.read()
        if len(pdf_bytes) < 100:
            raise ValueError("PDF file appears to be empty.")
        resume_text = extract_text(pdf_bytes)
        if len(resume_text.strip()) < 50:
            raise ValueError("Could not extract readable text from PDF. Try a text-based PDF (not a scanned image).")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF parsing error: {e}")

    # --- Score the resume ---
    try:
        scoring_data = score_resume(resume_text, job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring error: {e}")

    # --- Generate LLM / rule-based feedback ---
    try:
        feedback = generate_feedback(scoring_data, resume_text, job_description)
    except Exception as e:
        feedback = {
            "critical_improvements": ["Feedback generation failed. Please check logs."],
            "star_analysis": "",
            "ai_powered": False,
        }

    # --- Build final response ---
    return {
        "overall_score": scoring_data["overall_score"],
        "breakdown": scoring_data["breakdown"],
        "matched_keywords": scoring_data["matched_keywords"],
        "missing_keywords": scoring_data["missing_keywords"],
        "sections_detected": scoring_data["sections_detected"],
        "word_count": scoring_data["word_count"],
        "top_improvement": feedback.get("top_improvement", ""),
        "missing_critical_skills": feedback.get("missing_critical_skills", []),
        "bullet_point_rewrite": feedback.get("bullet_point_rewrite", {"original": "", "suggested": ""}),
        "formatting_tip": feedback.get("formatting_tip", ""),
        "star_analysis": feedback.get("star_analysis", ""),
        "ai_powered": feedback.get("ai_powered", False),
        "model_used": feedback.get("model", "rule-based"),
    }


# ---------------------------------------------------------------------------
# Dev runner
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
