"""
llm_feedback.py — Groq SDK integration for LLM-powered ATS feedback
Uses Llama-3-8B-8192 with Pydantic for rigid JSON parsing.
Implements the 3-Tier "Antigravity Logic":
1. Skill Gap Analysis
2. "Impact" Auditor (Quantification)
3. Semantic Keyword Injector
"""
import json
import os
from typing import Any, List

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama3-8b-8192"

# ---------------------------------------------------------------------------
# Pydantic Schemas for Structured JSON Output
# ---------------------------------------------------------------------------

class BulletPointRewrite(BaseModel):
    original: str
    suggested: str

class ATSFeedback(BaseModel):
    top_improvement: str
    missing_critical_skills: List[str]
    bullet_point_rewrite: BulletPointRewrite
    formatting_tip: str

# ---------------------------------------------------------------------------
# Fallback Feedback
# ---------------------------------------------------------------------------

def _rule_based_feedback(scoring_data: dict, resume_text: str) -> dict[str, Any]:
    """Fallback if Groq fails or no key is set."""
    missing = scoring_data.get("missing_keywords", [])
    
    missing_skills = []
    if missing:
        missing_skills = missing[:3]
        
    return {
        "top_improvement": "Quantify your achievements: Add measurable metrics (e.g., %, $, #) to your experience bullets to pass the 'Impact Auditor' check.",
        "missing_critical_skills": missing_skills,
        "bullet_point_rewrite": {
            "original": "Managed a team of developers",
            "suggested": "Managed a team of 8 developers, increasing sprint velocity by 25% and reducing bugs by 15%."
        },
        "formatting_tip": "Ensure your contact info is easy to find and you have a solid 3-4 line professional summary at the very top.",
        "star_analysis": f"Rule-based Assessment: Resume scored {scoring_data['overall_score']}/100.",
        "ai_powered": False,
        "model": "rule-based"
    }

# ---------------------------------------------------------------------------
# Groq-powered 3-Tier Feedback
# ---------------------------------------------------------------------------

def _groq_feedback(scoring_data: dict, resume_text: str, job_description: str) -> dict[str, Any]:
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)

        resume_excerpt = resume_text[:2500]
        jd_excerpt = job_description[:1500] if job_description else "Not provided (Use general tech engineering standards)"
        missing_kw = ", ".join(scoring_data.get("missing_keywords", [])[:10]) or "None"
        matched_kw = ", ".join(scoring_data.get("matched_keywords", [])[:10]) or "None"

        system_prompt = (
            "You are an Elite Technical Recruiter and Career Coach. "
            "Your feedback must be highly specific, professional, and directly reference "
            "the provided resume text and job description.\n\n"
            "You must respond ONLY with a strict JSON object that perfectly matches exactly "
            "this structure, with no extra text:\n"
            "{\n"
            '  "top_improvement": "Your most critical customized advice for their skill gap.",\n'
            '  "missing_critical_skills": ["skill1", "skill2"],\n'
            '  "bullet_point_rewrite": {\n'
            '    "original": "Direct quote of a weak bullet from their resume lacking metrics",\n'
            '    "suggested": "The improved bullet incorporating STAR method metrics"\n'
            "  },\n"
            '  "formatting_tip": "A specific formatting or structural tip"\n'
            "}"
        )

        user_prompt = f"""Perform the Three-Tier Analysis:
1. Skill Gap Analysis: Explain WHY missing skills matter based on the JD.
2. Impact Auditor: Find a real bullet point in the resume lacking digits (%, $) and rewrite it with placeholder metrics.
3. Semantic Keyword Injector: Suggest aligning their terminology with the JD's phrasing.

RESUME TEXT:
{resume_excerpt}

JOB DESCRIPTION:
{jd_excerpt}

SCORING CONTEXT:
Missing Exact Keywords: {missing_kw}
Matched Exact Keywords: {matched_kw}
"""

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content
        # Enforce Pydantic schema
        result = ATSFeedback.model_validate_json(raw)
        
        return {
            "top_improvement": result.top_improvement,
            "missing_critical_skills": result.missing_critical_skills,
            "bullet_point_rewrite": result.bullet_point_rewrite.model_dump(),
            "formatting_tip": result.formatting_tip,
            "star_analysis": "AI Analysis Complete: Reviewed via 3-Tier Antigravity Engine",
            "ai_powered": True,
            "model": GROQ_MODEL,
        }

    except Exception as e:
        print(f"[llm_feedback] Groq call or JSON validation failed ({e}). Falling back.")
        return _rule_based_feedback(scoring_data, resume_text)

def generate_feedback(scoring_data: dict, resume_text: str, job_description: str = "") -> dict[str, Any]:
    if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
        return _groq_feedback(scoring_data, resume_text, job_description)
    return _rule_based_feedback(scoring_data, resume_text)
