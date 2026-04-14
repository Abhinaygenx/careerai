"""
engine/retriever.py — Phase 4
Searches ChromaDB for the N most similar benchmark resumes
to whatever resume the user submits.

This is the R in RAG — Retrieval.
"""
import os
from collections import Counter
from typing import List, Optional

import chromadb
from dotenv import load_dotenv

from engine.embedder import embed_text

load_dotenv()

_collection = None  # Cached ChromaDB collection


def get_collection():
    """Lazy-load and cache the ChromaDB collection."""
    global _collection
    if _collection is None:
        chroma_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
        collection_name = os.getenv("COLLECTION_NAME", "benchmark_resumes")
        client = chromadb.PersistentClient(path=chroma_path)
        _collection = client.get_collection(
            name=collection_name,
        )
    return _collection


def find_similar_resumes(
    user_resume: str,
    job_role: Optional[str] = None,
    n: int = 5,
) -> List[dict]:
    """
    Find the N benchmark resumes most similar to the user's resume.
    Optionally filter by job_role for tighter matches.

    Returns a list of dicts with keys:
        text        — full resume text
        metadata    — {role, seniority, keywords}
        similarity  — cosine similarity score 0–1
    """
    collection = get_collection()
    query_emb = embed_text(user_resume)

    # Build optional where-filter for role
    where = {"role": job_role} if job_role else None

    try:
        results = collection.query(
            query_embeddings=[query_emb],
            n_results=n,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
    except Exception:
        # Fall back without role filter if filtered query fails (e.g. no matching role)
        results = collection.query(
            query_embeddings=[query_emb],
            n_results=n,
            include=["documents", "metadatas", "distances"],
        )

    similar = []
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    dists = results["distances"][0]

    for i in range(len(docs)):
        # ChromaDB cosine: distance 0=identical, 2=opposite → convert to similarity 0–1
        sim = round(1 - dists[i] / 2, 3)
        similar.append(
            {
                "text": docs[i],
                "metadata": metas[i],
                "similarity": sim,
            }
        )

    return similar


def extract_benchmark_keywords(similar_resumes: List[dict]) -> List[str]:
    """
    Extract the most common keywords across similar benchmark resumes.
    Returns up to 20 keywords that appear in at least 2 benchmarks.
    Useful for the LLM suggestion prompt context.
    """
    all_kws: List[str] = []
    for r in similar_resumes:
        kws_raw = r["metadata"].get("keywords", "")
        kws = [k.strip() for k in kws_raw.split(",") if k.strip()]
        all_kws.extend(kws)

    counter = Counter(all_kws)
    return [kw for kw, count in counter.most_common(20) if count >= 2]
