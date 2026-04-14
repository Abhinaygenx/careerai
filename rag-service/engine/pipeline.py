"""
engine/pipeline.py — Phase 5 (Master function)
Ties the full RAG pipeline together:
  1. Find similar benchmark resumes (Retrieval)
  2. Extract common benchmark keywords (Context)
  3. Generate Claude suggestions (Generation)

Your FastAPI server only calls run_rag_pipeline() — nothing else.
"""
from typing import Optional

from engine.retriever import extract_benchmark_keywords, find_similar_resumes
from engine.suggester import generate_suggestions


def run_rag_pipeline(
    user_resume: str,
    job_description: str,
    job_role: Optional[str] = None,
) -> dict:
    """
    Full RAG pipeline:
      1. Embed user resume → find 5 most similar benchmark resumes
      2. Extract common keywords from those benchmarks
      3. Call Claude with resume + benchmarks + JD → structured suggestions
      4. Attach pipeline metadata and return

    Returns the suggestion dict from Claude plus:
        benchmark_keywords   — keywords common across top benchmark resumes
        benchmarks_used      — number of retrieved benchmarks
        avg_similarity       — average cosine similarity of retrieved benchmarks
    """
    print("[1/3] Finding similar benchmarks…")
    similar = find_similar_resumes(
        user_resume=user_resume,
        job_role=job_role,
        n=5,
    )

    benchmark_kws = extract_benchmark_keywords(similar)
    avg_sim = round(
        sum(r["similarity"] for r in similar) / len(similar), 3
    ) if similar else 0.0

    print(f"      Retrieved {len(similar)} benchmarks (avg similarity: {avg_sim})")

    print("[2/3] Generating Claude suggestions…")
    suggestions = generate_suggestions(
        user_resume=user_resume,
        similar_resumes=similar,
        job_description=job_description,
    )

    # Attach pipeline metadata to the response
    suggestions["benchmark_keywords"] = benchmark_kws
    suggestions["benchmarks_used"] = len(similar)
    suggestions["avg_similarity"] = avg_sim

    sc = suggestions.get("score_current", "?")
    sp = suggestions.get("score_projected", "?")
    print(f"[3/3] Done.  Score: {sc} → {sp}")

    return suggestions
