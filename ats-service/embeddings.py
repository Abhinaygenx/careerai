"""
embeddings.py — Local sentence-transformers embeddings using BAAI/bge-small-en-v1.5
Runs entirely on CPU. Model is auto-downloaded (~130MB) on first run and cached.
"""
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine_similarity

# ---------------------------------------------------------------------------
# Singleton model loader — loaded once at module import, reused across requests
# ---------------------------------------------------------------------------
from typing import Optional
_MODEL_NAME = "BAAI/bge-small-en-v1.5"
_model: Optional[SentenceTransformer] = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print(f"[embeddings] Loading {_MODEL_NAME} (first-time download ~130MB)...")
        _model = SentenceTransformer(_MODEL_NAME)
        print(f"[embeddings] Model ready.")
    return _model


def get_embedding(text: str) -> np.ndarray:
    """
    Returns a normalized L2 embedding vector for the given text.
    BGE models work best with a query prefix for asymmetric retrieval.
    """
    model = get_model()
    # BGE recommendation: prefix with "Represent this sentence:"
    prefixed = f"Represent this sentence: {text}" if len(text) < 512 else text
    embedding = model.encode(prefixed, normalize_embeddings=True)
    return embedding


def cosine_sim(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Compute cosine similarity between two embedding vectors.
    Formula: score = (A · B) / (||A|| * ||B||)
    Since BGE embeddings are L2-normalized, this is just the dot product.
    """
    a = vec_a.reshape(1, -1)
    b = vec_b.reshape(1, -1)
    score = float(sk_cosine_similarity(a, b)[0][0])
    # Clamp to [0, 1] — negative similarity is treated as 0 match
    return max(0.0, min(1.0, score))


def chunk_and_embed(text: str, chunk_size: int = 512) -> np.ndarray:
    """
    For long documents: split into overlapping chunks, embed each,
    then return the mean-pooled embedding.
    """
    words = text.split()
    if len(words) <= chunk_size:
        return get_embedding(text)

    chunks = []
    step = chunk_size // 2  # 50% overlap
    for i in range(0, len(words), step):
        chunk = " ".join(words[i : i + chunk_size])
        chunks.append(chunk)

    model = get_model()
    embeddings = model.encode(chunks, normalize_embeddings=True)
    # Mean pool
    mean_emb = np.mean(embeddings, axis=0)
    # Re-normalize
    norm = np.linalg.norm(mean_emb)
    if norm > 0:
        mean_emb = mean_emb / norm
    return mean_emb
