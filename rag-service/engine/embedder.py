"""
engine/embedder.py — Text embedding utility
Uses all-MiniLM-L6-v2 (384-dim vectors) from sentence-transformers.
Downloads ~90MB once, then cached locally in ~/.cache/huggingface/

Every other file in this service imports from here.
"""
from sentence_transformers import SentenceTransformer
from typing import List

_model = None  # Singleton — loaded once, reused across all requests


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        # Downloads once (~90MB), then cached locally
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def embed_text(text: str) -> List[float]:
    """
    Embed a single text string into a 384-dim normalised vector.
    Truncates to 3000 chars to stay within model token limit.
    """
    model = get_model()
    text = text[:3000]  # Truncate to model limit
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_batch(texts: List[str]) -> List[List[float]]:
    """
    Embed a list of texts in one efficient batch.
    Truncates each text to 3000 chars.
    Returns a list of 384-dim normalised vectors.
    """
    model = get_model()
    texts = [t[:3000] for t in texts]
    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        batch_size=32,
        show_progress_bar=True,
    )
    return embeddings.tolist()
