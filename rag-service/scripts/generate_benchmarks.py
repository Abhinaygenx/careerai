"""
scripts/generate_benchmarks.py — Phase 2
Calls GPT-4o-mini to generate 480+ high-quality synthetic resumes
across 10 job categories and 4 seniority levels.

Run ONCE. Total cost: ~₹150 (GPT-4o-mini is very cheap).
Output: data/benchmark_resumes.json

Usage:
    cd rag-service
    python scripts/generate_benchmarks.py
"""
import json
import os
import time
import sys

from dotenv import load_dotenv

load_dotenv()

# Ensure we can import from project root when running as a script
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from openai import OpenAI
except ImportError:
    print("❌ OpenAI not installed. Run: pip install -r requirements.txt")
    sys.exit(1)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

JOB_CATEGORIES = [
    "Software Engineer",
    "Data Analyst",
    "Product Manager",
    "Digital Marketing",
    "Sales Executive",
    "HR Manager",
    "Financial Analyst",
    "Graphic Designer",
    "Business Analyst",
    "DevOps Engineer",
]

SENIORITY = [
    "fresher (0-1 yr)",
    "junior (1-3 yr)",
    "mid-level (3-6 yr)",
    "senior (6+ yr)",
]

NUM_VARIATIONS = 3  # 10 × 4 × 3 = 120 prompts → ~480 resumes total


def generate_benchmark_resume(role: str, seniority: str) -> dict | None:
    """Call GPT-4o-mini to generate one high-quality synthetic resume."""
    prompt = f"""Generate a realistic, high-quality resume for a {seniority} {role} applying to a product company in India.

Requirements:
- 3-4 experience bullets per role, each QUANTIFIED with real metrics (%, ₹, x, users, etc.)
- 8-12 ATS-friendly industry keywords naturally embedded
- Skills section relevant to India job market
- Realistic Indian name and contact details (email, phone, LinkedIn URL, city)

Output ONLY valid JSON in exactly this structure:
{{
  "role": "{role}",
  "seniority": "{seniority}",
  "name": "Full Name",
  "summary": "2-3 line professional summary",
  "skills": ["skill1", "skill2", "..."],
  "experience": [{{
    "company": "Company Name",
    "title": "Job Title",
    "duration": "Jan 2021 – Mar 2024",
    "bullets": ["quantified bullet 1", "quantified bullet 2", "quantified bullet 3"]
  }}],
  "education": {{
    "degree": "B.Tech Computer Science",
    "institution": "IIT Bombay",
    "year": "2020"
  }},
  "ats_keywords": ["kw1", "kw2", "..."],
  "full_text": "entire resume as plain text — all sections concatenated with newlines"
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.8,
        )
        data = json.loads(response.choices[0].message.content)
        # Ensure full_text is populated
        if not data.get("full_text") or len(data["full_text"]) < 100:
            parts = [
                data.get("name", ""),
                data.get("summary", ""),
                "Skills: " + ", ".join(data.get("skills", [])),
            ]
            for exp in data.get("experience", []):
                parts.append(f"{exp.get('title')} at {exp.get('company')} ({exp.get('duration')})")
                parts.extend(exp.get("bullets", []))
            edu = data.get("education", {})
            parts.append(f"{edu.get('degree')} — {edu.get('institution')} ({edu.get('year')})")
            parts.append("Keywords: " + ", ".join(data.get("ats_keywords", [])))
            data["full_text"] = "\n".join(parts)
        return data
    except Exception as e:
        print(f"  ⚠️  GPT error for {role} | {seniority}: {e}")
        return None


def main():
    output_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data",
        "benchmark_resumes.json",
    )
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Load existing if re-running (safe to resume)
    all_resumes = []
    if os.path.exists(output_path):
        with open(output_path) as f:
            try:
                all_resumes = json.load(f)
                print(f"📂 Resuming from {len(all_resumes)} existing resumes…")
            except json.JSONDecodeError:
                all_resumes = []

    total = len(JOB_CATEGORIES) * len(SENIORITY) * NUM_VARIATIONS
    done = len(all_resumes)

    print(f"\n🚀 Generating benchmark resumes ({total} total, {done} already done)")
    print(f"   Categories: {len(JOB_CATEGORIES)}  ×  Seniority: {len(SENIORITY)}  ×  Variations: {NUM_VARIATIONS}")
    print(f"   Model: gpt-4o-mini  |  Estimated cost: ~₹150\n")

    for role in JOB_CATEGORIES:
        for seniority in SENIORITY:
            for i in range(NUM_VARIATIONS):
                # Skip already generated to allow safe re-runs
                if done > 0:
                    done -= 1
                    continue

                resume = generate_benchmark_resume(role, seniority)
                if resume:
                    all_resumes.append(resume)
                    print(f"  ✅ Generated: {role} | {seniority} | #{i + 1}  (total: {len(all_resumes)})")
                else:
                    print(f"  ❌ Failed:    {role} | {seniority} | #{i + 1}")

                # Save after every resume (safe checkpoint)
                with open(output_path, "w", encoding="utf-8") as f:
                    json.dump(all_resumes, f, indent=2, ensure_ascii=False)

                time.sleep(0.3)  # Be gentle to the API

    print(f"\n✅ Done! {len(all_resumes)} resumes saved to {output_path}")
    print("   Next step: python scripts/ingest.py")


if __name__ == "__main__":
    main()
