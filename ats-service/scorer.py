"""
scorer.py — Hybrid ATS scoring engine
Weights: Semantic Match (60%) + Keyword Presence (25%) + Format/Structure (15%)
Stores resume embeddings in ChromaDB for future percentile ranking.
"""
import os
import re
import uuid
from typing import Any

import chromadb
from chromadb.config import Settings

from embeddings import chunk_and_embed, cosine_sim, get_embedding
from parser import detect_sections

# ---------------------------------------------------------------------------
# ChromaDB setup — persists to disk in ./chroma_db
# ---------------------------------------------------------------------------
from typing import Optional
_CHROMA_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
_chroma_client: Optional[chromadb.PersistentClient] = None
_collection = None


def _get_collection():
    global _chroma_client, _collection
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=_CHROMA_PATH)
        _collection = _chroma_client.get_or_create_collection(
            name="resume_embeddings",
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


# ---------------------------------------------------------------------------
# Keyword extraction (regex + common tech patterns)
# ---------------------------------------------------------------------------

TECH_KEYWORDS = [
    # Languages
    "python", "java", "javascript", "typescript", "c\\+\\+", "c#", "go", "rust",
    "ruby", "swift", "kotlin", "scala", "r", "matlab", "bash", "shell",
    # Web
    "react", "next\\.js", "vue", "angular", "svelte", "node\\.js", "express",
    "fastapi", "django", "flask", "spring boot", "asp\\.net",
    # Data / ML
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "keras",
    "hugging face", "langchain", "llm", "machine learning", "deep learning",
    "nlp", "computer vision", "data science", "sql", "nosql",
    # Cloud / DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "ci/cd", "terraform",
    "github actions", "jenkins", "ansible", "linux",
    # Databases
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite",
    "firebase", "supabase",
    # Soft / General
    "agile", "scrum", "rest api", "graphql", "microservices", "system design",
    "leadership", "communication", "problem.?solving",
]

SOFT_SKILLS = [
    "leadership", "communication", "teamwork", "collaboration", "problem.?solving",
    "critical thinking", "time management", "adaptability", "creativity", "mentoring",
]


def _extract_keywords_from_text(text: str) -> set[str]:
    """Extract tech keywords / skills from a block of text using regex."""
    text_lower = text.lower()
    found = set()
    for kw in TECH_KEYWORDS + SOFT_SKILLS:
        if re.search(r'\b' + kw + r'\b', text_lower):
            # Normalize to clean label
            clean = kw.replace("\\+\\+", "++").replace("\\.", ".").replace(".?", " ")
            found.add(clean.strip())
    return found


def _calculate_keyword_score(
    resume_keywords: set[str], jd_keywords: set[str]
) -> tuple[float, list[str], list[str]]:
    """
    Compute keyword match score and return matched / missing keyword lists.
    Returns (score_0_to_1, matched_list, missing_list)
    """
    if not jd_keywords:
        # No JD provided — score based on keyword density in resume alone
        density = min(len(resume_keywords) / 20.0, 1.0)  # 20+ keywords = 100%
        return density, list(resume_keywords)[:12], []

    matched = resume_keywords & jd_keywords
    missing = jd_keywords - resume_keywords

    if not jd_keywords:
        return 1.0, list(matched), []

    score = len(matched) / len(jd_keywords)
    return min(score, 1.0), sorted(matched), sorted(missing)[:10]


def _calculate_format_score(sections: dict, resume_text: str) -> float:
    """
    Score resume formatting and structure on 0-1 scale.
    Checks: essential sections present, bullet usage, length, contact info.
    """
    score = 0.0

    # Core sections (60 points)
    essential = ["contact", "experience", "education", "skills"]
    nice_to_have = ["summary", "projects", "certifications", "achievements"]

    for s in essential:
        if sections.get(s):
            score += 0.15

    for s in nice_to_have:
        if sections.get(s):
            score += 0.05  # max 0.20

    # Bullet point usage (10 points)
    bullet_count = len(re.findall(r'[•\-\*]\s+\w', resume_text))
    if bullet_count >= 5:
        score += 0.10

    # Length check (10 points) — ideal 400-800 words
    word_count = len(resume_text.split())
    if 300 <= word_count <= 1000:
        score += 0.10

    # Quantified achievements (15 points) — numbers in context
    quant_matches = re.findall(
        r'\b\d+[\+%xX]?\s*(years?|months?|projects?|team|members?|%|users?|customers?|revenue|increase|decrease|improve)',
        resume_text.lower()
    )
    if len(quant_matches) >= 3:
        score += 0.15
    elif len(quant_matches) >= 1:
        score += 0.07

    return min(score, 1.0)


# ---------------------------------------------------------------------------
# Main scoring function
# ---------------------------------------------------------------------------

def score_resume(
    resume_text: str, job_description: str = ""
) -> dict[str, Any]:
    """
    Full hybrid ATS scoring pipeline.
    Returns structured scoring dict with overall score, breakdown, and keywords.
    """

    # --- 1. Semantic Score (60% weight) ---
    resume_emb = chunk_and_embed(resume_text)

    if job_description.strip():
        jd_emb = get_embedding(job_description)
        semantic_score = cosine_sim(resume_emb, jd_emb)
    else:
        # No JD — score resume quality against a generic "strong resume" reference
        STRONG_RESUME_REF = (
            "Experienced professional with proven track record of achievements. "
            "Led cross-functional teams, delivered measurable results. "
            "Skilled in modern technologies, agile methodologies. "
            "Strong communication, leadership, and problem-solving abilities. "
            "Multiple quantified accomplishments in previous roles."
        )
        ref_emb = get_embedding(STRONG_RESUME_REF)
        semantic_score = cosine_sim(resume_emb, ref_emb)
        # Boost slightly since there's no JD mismatch penalty
        semantic_score = min(semantic_score * 1.15, 1.0)

    # --- 2. Keyword Score (25% weight) ---
    resume_keywords = _extract_keywords_from_text(resume_text)
    jd_keywords = _extract_keywords_from_text(job_description) if job_description else set()

    keyword_score, matched_keywords, missing_keywords = _calculate_keyword_score(
        resume_keywords, jd_keywords
    )

    # --- 3. Format/Structure Score (15% weight) ---
    sections = detect_sections(resume_text)
    format_score = _calculate_format_score(sections, resume_text)

    # --- 4. Composite Score ---
    WEIGHTS = {"semantic": 0.60, "keyword": 0.25, "format": 0.15}
    composite = (
        semantic_score * WEIGHTS["semantic"]
        + keyword_score * WEIGHTS["keyword"]
        + format_score * WEIGHTS["format"]
    )

    # Scale to 0-100 integer
    def to_pct(v: float) -> int:
        return round(v * 100)

    overall = to_pct(composite)
    # Apply a floor of 20 and ceiling of 98 for realism
    overall = max(20, min(98, overall))

    # --- 5. Store embedding in ChromaDB ---
    try:
        collection = _get_collection()
        doc_id = str(uuid.uuid4())
        collection.add(
            embeddings=[resume_emb.tolist()],
            documents=[resume_text[:500]],  # Store excerpt
            ids=[doc_id],
            metadatas=[{"score": overall, "semantic": to_pct(semantic_score)}],
        )
    except Exception:
        pass  # ChromaDB failure is non-fatal

    return {
        "overall_score": overall,
        "breakdown": {
            "semantic": to_pct(semantic_score),
            "keyword": to_pct(keyword_score),
            "format": to_pct(format_score),
        },
        "matched_keywords": matched_keywords[:15],
        "missing_keywords": missing_keywords[:10],
        "sections_detected": sections,
        "word_count": len(resume_text.split()),
    }
