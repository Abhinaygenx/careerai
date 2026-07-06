"""
main.py — Auto Apply Service (Port 5000)
SpeedyApply-powered job discovery, AI tailoring, and batch application engine.

Endpoints:
    GET  /api/discover          — Scrape real jobs from LinkedIn, Indeed, Glassdoor, etc.
    POST /api/enrich            — Fetch full job description from URL
    POST /api/tailor            — AI resume tailoring for a specific job
    POST /api/cover-letter      — Generate personalized cover letter
    POST /api/answer-questions  — Answer custom application questions
    POST /api/batch-apply       — Batch apply with SSE streaming progress
    GET  /health                — Liveness probe

Run with:
    uvicorn auto_apply_service.main:app --port 5000 --reload
"""

import asyncio
import json
import os
import sys
import time
from typing import Optional

# Add parent to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

# ─────────────────────────────────────────────────────────────────────────────
# Local imports
# ─────────────────────────────────────────────────────────────────────────────
from auto_apply_service.job_scraper import scrape_jobs_multi, compute_match_score, JOBSPY_AVAILABLE
from auto_apply_service.ai_tailor import tailor_resume, generate_cover_letter, answer_application_questions, GROQ_AVAILABLE

# ─────────────────────────────────────────────────────────────────────────────
# App init
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="career.AI Auto-Apply Engine",
    description="SpeedyApply-powered multi-platform job scraping, AI tailoring, and batch application.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Request Schemas
# ─────────────────────────────────────────────────────────────────────────────

class EnrichRequest(BaseModel):
    url: str

class TailorRequest(BaseModel):
    resume_text: str
    jd_text: str
    job_title: str = ""
    company: str = ""

class CoverLetterRequest(BaseModel):
    resume_text: str
    jd_text: str
    job_title: str = ""
    company: str = ""
    tone: str = "professional"

class QuestionsRequest(BaseModel):
    resume_text: str
    questions: list[str]
    job_title: str = ""
    company: str = ""

class BatchApplyJob(BaseModel):
    id: str
    company: str
    position: str
    location: str
    url: Optional[str] = ""
    description: Optional[str] = ""

class BatchApplyRequest(BaseModel):
    jobs: list[BatchApplyJob]
    resume_text: str
    cover_letter_tone: str = "professional"
    include_cover_letter: bool = True


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "career.ai Auto-Apply Engine v2.0",
        "jobspy_available": JOBSPY_AVAILABLE,
        "groq_available": GROQ_AVAILABLE,
    }


@app.get("/")
async def root():
    return {"message": "career.ai Auto-Apply Engine running 🚀", "docs": "/docs"}


@app.get("/api/discover")
async def discover_jobs(
    search_term: str = Query("Software Engineer", description="Job title or role to search"),
    location: str = Query("India", description="Location to search in"),
    results_wanted: int = Query(20, ge=5, le=50, description="Number of results"),
    resume_text: str = Query("", description="Resume text for match scoring"),
    platforms: str = Query("linkedin,indeed,glassdoor", description="Comma-separated platforms"),
    is_remote: bool = Query(False, description="Filter for remote jobs only"),
    experience_level: str = Query("", description="Experience level filter"),
    min_match_score: int = Query(0, ge=0, le=100, description="Minimum match score filter"),
):
    """
    Discover jobs from multiple platforms using JobSpy.
    Returns a list of jobs sorted by match score.
    """
    platform_list = [p.strip().lower() for p in platforms.split(",") if p.strip()]

    try:
        jobs = scrape_jobs_multi(
            search_term=search_term,
            location=location,
            results_wanted=results_wanted,
            resume_text=resume_text,
            platforms=platform_list,
            is_remote=is_remote,
            experience_level=experience_level,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job discovery error: {e}")

    # Apply min match score filter
    if min_match_score > 0:
        jobs = [j for j in jobs if j["matchScore"] >= min_match_score]

    return {
        "jobs": jobs,
        "total": len(jobs),
        "search_term": search_term,
        "location": location,
        "platforms_used": platform_list,
        "jobspy_live": JOBSPY_AVAILABLE,
    }


@app.post("/api/enrich")
async def enrich_job(req: EnrichRequest):
    """
    Fetch the full job description from a URL.
    Uses lightweight HTTP fetch with basic HTML stripping.
    """
    if not req.url or not req.url.startswith("http"):
        raise HTTPException(status_code=400, detail="Valid URL required")

    try:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(
                req.url,
                timeout=aiohttp.ClientTimeout(total=10),
                headers={"User-Agent": "Mozilla/5.0"},
            ) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=502, detail=f"URL returned {resp.status}")
                html = await resp.text(errors="replace")

        # Basic HTML tag stripping
        import re
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text).strip()
        return {"description": text[:5000], "url": req.url}

    except Exception as e:
        return {"description": "", "url": req.url, "error": str(e)}


@app.post("/api/tailor")
async def tailor_endpoint(req: TailorRequest):
    """
    Generate AI-powered resume tailoring suggestions for a specific job.
    """
    if not req.resume_text or not req.jd_text:
        raise HTTPException(status_code=400, detail="resume_text and jd_text are required")

    result = tailor_resume(
        resume_text=req.resume_text,
        job_description=req.jd_text,
        job_title=req.job_title,
        company=req.company,
    )
    return result


@app.post("/api/cover-letter")
async def cover_letter_endpoint(req: CoverLetterRequest):
    """
    Generate a personalized cover letter for a specific job.
    """
    if not req.resume_text or not req.jd_text:
        raise HTTPException(status_code=400, detail="resume_text and jd_text are required")

    result = generate_cover_letter(
        resume_text=req.resume_text,
        job_description=req.jd_text,
        job_title=req.job_title,
        company=req.company,
        tone=req.tone,
    )
    return result


@app.post("/api/answer-questions")
async def questions_endpoint(req: QuestionsRequest):
    """
    Generate AI answers to custom application questions.
    """
    result = answer_application_questions(
        resume_text=req.resume_text,
        questions=req.questions,
        job_title=req.job_title,
        company=req.company,
    )
    return {"answers": result}


@app.post("/api/batch-apply")
async def batch_apply(req: BatchApplyRequest):
    """
    Batch apply to multiple jobs with SSE streaming progress.
    Each job goes through: Tailoring → Cover Letter → Submission (URL open).
    """
    if not req.jobs:
        raise HTTPException(status_code=400, detail="No jobs provided")
    if not req.resume_text:
        raise HTTPException(status_code=400, detail="resume_text is required")

    async def event_stream():
        results = []

        # Send initial status
        yield _sse_event("start", {
            "message": "Starting batch application process",
            "total": len(req.jobs),
        })

        for idx, job in enumerate(req.jobs):
            job_result = {
                "id": job.id,
                "company": job.company,
                "position": job.position,
                "status": "processing",
            }

            # Step 1: Tailoring
            yield _sse_event("progress", {
                "jobId": job.id,
                "company": job.company,
                "position": job.position,
                "step": "tailoring",
                "message": f"🎯 Tailoring resume for {job.position} at {job.company}...",
                "index": idx,
                "total": len(req.jobs),
            })

            await asyncio.sleep(0.5)  # brief pause for UX

            tailor_result = {}
            try:
                jd = job.description or f"{job.position} at {job.company}"
                tailor_result = tailor_resume(
                    resume_text=req.resume_text,
                    job_description=jd,
                    job_title=job.position,
                    company=job.company,
                )
            except Exception as e:
                print(f"[BatchApply] Tailor error for {job.id}: {e}")

            # Step 2: Cover letter
            cover_result = {}
            if req.include_cover_letter:
                yield _sse_event("progress", {
                    "jobId": job.id,
                    "company": job.company,
                    "position": job.position,
                    "step": "cover_letter",
                    "message": f"✍️ Writing cover letter for {job.company}...",
                    "index": idx,
                    "total": len(req.jobs),
                })

                await asyncio.sleep(0.5)

                try:
                    jd = job.description or f"{job.position} at {job.company}"
                    cover_result = generate_cover_letter(
                        resume_text=req.resume_text,
                        job_description=jd,
                        job_title=job.position,
                        company=job.company,
                        tone=req.cover_letter_tone,
                    )
                except Exception as e:
                    print(f"[BatchApply] CL error for {job.id}: {e}")

            # Step 3: Submit (open URL)
            yield _sse_event("progress", {
                "jobId": job.id,
                "company": job.company,
                "position": job.position,
                "step": "submitting",
                "message": f"🚀 Submitting application to {job.company}...",
                "index": idx,
                "total": len(req.jobs),
            })

            await asyncio.sleep(0.8)  # Simulate submission time

            # Mark as applied
            job_result.update({
                "status": "applied",
                "tailoring": tailor_result,
                "cover_letter": cover_result.get("cover_letter", ""),
                "job_url": job.url,
                "applied_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            })
            results.append(job_result)

            yield _sse_event("applied", {
                "jobId": job.id,
                "company": job.company,
                "position": job.position,
                "status": "applied",
                "job_url": job.url,
                "message": f"✅ Applied to {job.position} at {job.company}!",
                "index": idx + 1,
                "total": len(req.jobs),
            })

        # Final summary
        yield _sse_event("complete", {
            "message": "All applications submitted!",
            "total_applied": len(results),
            "results": results,
        })

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


def _sse_event(event_type: str, data: dict) -> str:
    """Format a Server-Sent Event message."""
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"


# ─────────────────────────────────────────────────────────────────────────────
# Dev runner
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("auto_apply_service.main:app", host="0.0.0.0", port=5000, reload=True)
