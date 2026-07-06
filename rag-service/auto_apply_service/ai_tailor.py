"""
ai_tailor.py — AI-powered resume tailoring and cover letter generation
Uses Groq (free tier) with fallback to rule-based generation.
"""
import os
import re
from typing import Optional

# ─────────────────────────────────────────────────────────────────────────────
# Groq client
# ─────────────────────────────────────────────────────────────────────────────
try:
    from groq import Groq
    _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
    GROQ_AVAILABLE = bool(os.getenv("GROQ_API_KEY"))
except Exception:
    _groq_client = None
    GROQ_AVAILABLE = False

GROQ_MODEL = "llama3-8b-8192"


def _call_groq(prompt: str, max_tokens: int = 1024) -> str:
    """Call Groq API with error handling."""
    if not GROQ_AVAILABLE or _groq_client is None:
        return ""
    try:
        response = _groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[Groq] Error: {e}")
        return ""


# ─────────────────────────────────────────────────────────────────────────────
# Resume Tailoring
# ─────────────────────────────────────────────────────────────────────────────

def tailor_resume(resume_text: str, job_description: str, job_title: str = "", company: str = "") -> dict:
    """
    Generate tailoring suggestions and an optimized summary for a specific job.
    Returns: { tailored_summary, keywords_to_add, bullets_to_strengthen, ats_score_boost }
    """
    prompt = f"""You are an expert ATS resume optimizer. Analyze this resume against the job description and provide specific tailoring advice.

RESUME:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

JOB TITLE: {job_title}
COMPANY: {company}

Provide a JSON response with these exact keys:
{{
  "tailored_summary": "A 3-sentence professional summary tailored specifically for this role",
  "keywords_to_add": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "bullets_to_strengthen": [
    {{"original": "original bullet", "improved": "stronger quantified version"}},
    {{"original": "original bullet2", "improved": "stronger quantified version2"}}
  ],
  "ats_score_boost": "+8 to +15",
  "key_match_reason": "One sentence on why this candidate is a great fit"
}}

Return only valid JSON, no markdown fences."""

    raw = _call_groq(prompt, max_tokens=800)

    # Parse JSON response
    try:
        # Strip markdown fences if present
        clean = re.sub(r'```(?:json)?|```', '', raw).strip()
        import json
        data = json.loads(clean)
        return data
    except Exception:
        pass

    # Rule-based fallback
    return _rule_based_tailor(resume_text, job_description, job_title)


def _rule_based_tailor(resume_text: str, jd: str, job_title: str) -> dict:
    """Fallback rule-based tailoring when AI is unavailable."""
    from job_scraper import _extract_skills
    resume_skills = _extract_skills(resume_text)
    jd_skills = _extract_skills(jd)
    missing = list(jd_skills - resume_skills)[:5]

    return {
        "tailored_summary": f"Experienced software engineer with proven expertise in {', '.join(list(resume_skills)[:3])}. "
                           f"Passionate about building scalable systems and delivering high-quality solutions. "
                           f"Excited to bring my skills to the {job_title} role.",
        "keywords_to_add": missing[:5] or ["system design", "agile", "ci/cd", "code review", "testing"],
        "bullets_to_strengthen": [
            {
                "original": "Developed software features",
                "improved": "Engineered 3 high-impact features that reduced latency by 40% and increased user retention by 25%"
            }
        ],
        "ats_score_boost": "+8 to +12",
        "key_match_reason": f"Strong overlap in technical skills with the {job_title} requirements."
    }


# ─────────────────────────────────────────────────────────────────────────────
# Cover Letter Generation
# ─────────────────────────────────────────────────────────────────────────────

def generate_cover_letter(
    resume_text: str,
    job_description: str,
    job_title: str = "",
    company: str = "",
    tone: str = "professional",
) -> dict:
    """
    Generate a personalized cover letter for a specific job.
    tone: "professional" | "enthusiastic" | "concise"
    Returns: { cover_letter, word_count, highlights }
    """
    tone_instructions = {
        "professional": "formal, confident, and results-driven",
        "enthusiastic": "energetic, passionate, and compelling",
        "concise": "brief, punchy, and impactful — max 200 words",
    }.get(tone, "professional, confident, and results-driven")

    prompt = f"""Write a {tone_instructions} cover letter for this job application.

CANDIDATE RESUME SUMMARY:
{resume_text[:2000]}

JOB DESCRIPTION:
{job_description[:1500]}

JOB TITLE: {job_title}
COMPANY: {company}

Instructions:
- Open with a powerful hook (no "I am applying for...")  
- Highlight 2-3 specific achievements from the resume that match the JD
- Show genuine enthusiasm for {company if company else "the company"}
- End with a confident call to action
- Do NOT include [Name], [Date], or placeholder brackets
- Use specific numbers and metrics where possible

Return JSON:
{{
  "cover_letter": "Full cover letter text here...",
  "word_count": 180,
  "highlights": ["Achievement 1 mentioned", "Achievement 2 mentioned"]
}}

Return only valid JSON, no markdown fences."""

    raw = _call_groq(prompt, max_tokens=700)

    try:
        clean = re.sub(r'```(?:json)?|```', '', raw).strip()
        import json
        data = json.loads(clean)
        if "cover_letter" in data:
            return data
    except Exception:
        # If not valid JSON, treat raw as the cover letter text
        if len(raw) > 100:
            return {
                "cover_letter": raw,
                "word_count": len(raw.split()),
                "highlights": []
            }

    # Fallback template
    return _template_cover_letter(resume_text, job_title, company)


def _template_cover_letter(resume_text: str, job_title: str, company: str) -> dict:
    """Template-based cover letter as final fallback."""
    letter = f"""The opportunity to join {company or 'your team'} as {job_title or 'a software engineer'} is one I've been anticipating — your mission to build world-class technology aligns perfectly with my career trajectory.

Over the past several years, I've built and shipped production-grade systems that directly improved user experience and business outcomes. My experience spans full-stack development, system design, and cross-functional collaboration — exactly the skill set this role demands.

What excites me most about {company or 'this opportunity'} is the scale and impact of the engineering challenges. I thrive in fast-paced environments where technical excellence and pragmatic execution intersect.

I'd welcome the opportunity to discuss how my background can contribute to your team's goals. Thank you for considering my application."""

    return {
        "cover_letter": letter,
        "word_count": len(letter.split()),
        "highlights": ["Production system experience", "Full-stack expertise"]
    }


# ─────────────────────────────────────────────────────────────────────────────
# Custom Question Answering (for application forms)
# ─────────────────────────────────────────────────────────────────────────────

def answer_application_questions(
    resume_text: str,
    questions: list[str],
    job_title: str = "",
    company: str = "",
) -> list[dict]:
    """
    Generate answers to custom application questions.
    Returns: [{ question, answer, word_count }]
    """
    if not questions:
        return []

    q_text = "\n".join([f"{i+1}. {q}" for i, q in enumerate(questions)])

    prompt = f"""You are helping a candidate answer application questions for {job_title} at {company}.

CANDIDATE RESUME:
{resume_text[:2000]}

APPLICATION QUESTIONS:
{q_text}

Answer each question concisely and specifically, referencing the candidate's experience.
Return JSON array:
[
  {{"question": "question text", "answer": "concise answer under 150 words", "word_count": 45}},
  ...
]
Return only valid JSON."""

    raw = _call_groq(prompt, max_tokens=600)

    try:
        clean = re.sub(r'```(?:json)?|```', '', raw).strip()
        import json
        data = json.loads(clean)
        if isinstance(data, list):
            return data
    except Exception:
        pass

    # Fallback
    return [
        {
            "question": q,
            "answer": f"I have strong experience relevant to this question through my work in software engineering, "
                     f"where I consistently delivered results that aligned with team and business objectives.",
            "word_count": 30
        }
        for q in questions
    ]
