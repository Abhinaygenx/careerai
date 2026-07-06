"""
start_auto_apply.py — Startup script for the Auto-Apply Service
Run this from the career.AI root directory:
    python start_auto_apply.py
"""
import os
import sys

# Ensure we're in the right directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load env from rag-service if .env exists there
env_path = os.path.join(os.path.dirname(__file__), "rag-service", ".env")
if os.path.exists(env_path):
    from dotenv import load_dotenv
    load_dotenv(env_path)

import uvicorn

if __name__ == "__main__":
    print("🚀 Starting career.ai Auto-Apply Engine on port 5000...")
    print("📖 API Docs: http://localhost:5000/docs")
    uvicorn.run(
        "rag-service.auto_apply_service.main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level="info",
    )
