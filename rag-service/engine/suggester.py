"""
engine/suggester.py — Phase 5
The brain of the RAG engine.

Takes the user's resume + 5 benchmark resumes + job description,
sends them to Claude, and returns structured JSON suggestions.

Prompt engineering is critical here — Claude must return valid JSON only.
"""
import json
import os
from typing import List, Optional

import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ─────────────────────────────────────────────────────────────────────────────
# Claude Prompt
# ─────────────────────────────────────────────────────────────────────────────

PROMPT_TEMPLATE = """You are a senior career coach and ATS expert specialising in the Indian job market.

You have: a candidate resume, {n} benchmark resumes that got interviews, and the job description.

CANDIDATE RESUME:
{user_resume}

BENCHMARK RESUMES (resumes that got interviews for similar roles):
{benchmarks}

JOB DESCRIPTION:
{job_description}

Respond ONLY with valid JSON. No preamble, no markdown, no trailing text.
{{
  "score_current": <int 0-100, honest score of candidate resume>,
  "score_projected": <int 0-100, realistic score after implementing suggestions>,
  "top_insight": "<single most impactful change, max 120 chars>",
  "missing_keywords": [{{
    "keyword": "<exact phrase>",
    "frequency": <how many benchmarks had it, 1-{n}>,
    "where_to_add": "<skills | experience | summary>",
    "example_usage": "<natural sentence using it>"
  }}],
  "weak_bullets": [{{
    "original": "<copy exact weak bullet from candidate resume>",
    "rewrite": "<improved version with [metric] placeholder>",
    "reason": "<one sentence why>",
    "score_impact": <1-10>
  }}],
  "structural_issues": [{{
    "issue": "<short title>",
    "fix": "<exactly what to do>",
    "score_impact": <1-10>
  }}],
  "strengths": ["<genuine strength from this specific resume>"],
  "benchmark_insight": "<what top candidates do that this one doesn't, max 160 chars>"
}}"""


def generate_suggestions(
    user_resume: str,
    similar_resumes: List[dict],
    job_description: str,
) -> dict:
    """
    Call Claude with the candidate resume + benchmarks + JD.
    Returns parsed suggestion JSON or an error dict.
    """
    # Build benchmark text block
    benchmarks_text = ""
    for i, r in enumerate(similar_resumes, 1):
        sim = r.get("similarity", 0)
        text = r.get("text", "")[:1500]  # Trim to stay within token budget
        benchmarks_text += f"--- Benchmark {i} (similarity: {sim}) ---\n{text}\n\n"

    prompt = PROMPT_TEMPLATE.format(
        n=len(similar_resumes),
        user_resume=user_resume[:2000],
        benchmarks=benchmarks_text,
        job_description=job_description[:1000] if job_description else "Not provided — use general best practices for the role.",
    )

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2500,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()

    # Strip markdown code block if Claude wraps in ```json … ```
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) >= 2 else raw
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Try to salvage by finding the outermost { … }
        f, l = raw.find("{"), raw.rfind("}")
        if f != -1 and l != -1:
            try:
                return json.loads(raw[f : l + 1])
            except json.JSONDecodeError:
                pass
        return {"error": "Failed to parse Claude response", "raw": raw[:800]}
