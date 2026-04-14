"""
scripts/ingest.py — Phase 3
Reads benchmark_resumes.json, embeds each resume's full_text,
and loads everything into ChromaDB.

Run ONCE after generate_benchmarks.py has completed.

Usage:
    cd rag-service
    python scripts/ingest.py
"""
import json
import os
import sys
import uuid

from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import chromadb
except ImportError:
    print("❌ chromadb not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

from engine.embedder import embed_batch


def ingest_benchmarks():
    data_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data",
        "benchmark_resumes.json",
    )

    if not os.path.exists(data_path):
        print(f"❌ File not found: {data_path}")
        print("   Run scripts/generate_benchmarks.py first.")
        sys.exit(1)

    with open(data_path, encoding="utf-8") as f:
        resumes = json.load(f)

    print(f"📂 Loaded {len(resumes)} benchmark resumes from {data_path}")

    # Connect to ChromaDB
    chroma_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
    collection_name = os.getenv("COLLECTION_NAME", "benchmark_resumes")

    client = chromadb.PersistentClient(path=chroma_path)

    # Wipe and recreate for a clean ingest
    try:
        client.delete_collection(collection_name)
        print(f"🗑️  Dropped existing collection '{collection_name}'")
    except Exception:
        pass

    collection = client.create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )
    print(f"✅ Created collection '{collection_name}' with cosine distance")

    BATCH = 50
    total_ingested = 0

    for i in range(0, len(resumes), BATCH):
        batch = resumes[i : i + BATCH]

        texts = [r.get("full_text", "") for r in batch]
        ids = [str(uuid.uuid4()) for _ in batch]
        metadatas = [
            {
                "role": r.get("role", ""),
                "seniority": r.get("seniority", ""),
                # Store top-15 keywords joined by comma for retrieval filtering
                "keywords": ", ".join(r.get("ats_keywords", [])[:15]),
            }
            for r in batch
        ]

        print(f"  🔄 Embedding batch {i // BATCH + 1} ({len(batch)} resumes)…")
        embeddings = embed_batch(texts)

        collection.add(
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )

        total_ingested += len(batch)
        print(f"  ✅ {total_ingested}/{len(resumes)} ingested")

    count = collection.count()
    print(f"\n🎉 Done! {count} resumes in ChromaDB at '{chroma_path}'")
    print("   Next step: uvicorn api.main:app --reload --port 8001")


if __name__ == "__main__":
    ingest_benchmarks()
