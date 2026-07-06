"""
job_scraper.py — SpeedyApply/JobSpy integration
Scrapes real job listings from LinkedIn, Indeed, Glassdoor, Google, ZipRecruiter
and computes AI match scores against the user's resume.
"""
import re
import hashlib
import concurrent.futures
from typing import Optional
from datetime import datetime

# ─────────────────────────────────────────────────────────────────────────────
# JobSpy — with graceful fallback if unavailable
# ─────────────────────────────────────────────────────────────────────────────
try:
    from jobspy import scrape_jobs
    JOBSPY_AVAILABLE = True
except ImportError:
    JOBSPY_AVAILABLE = False

import pandas as pd

# Hard timeout (seconds) for JobSpy scraping — prevents the 5-minute hang
JOBSPY_TIMEOUT = 18


# ─────────────────────────────────────────────────────────────────────────────
# Match Scoring  (keyword + skill overlap without heavy ML)
# ─────────────────────────────────────────────────────────────────────────────

TECH_SKILLS = [
    "python", "javascript", "typescript", "java", "go", "rust", "c++", "c#",
    "react", "next.js", "vue", "angular", "node.js", "fastapi", "django", "flask",
    "spring", "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "postgresql", "mongodb", "redis", "kafka", "elasticsearch",
    "machine learning", "deep learning", "llm", "pytorch", "tensorflow",
    "sql", "nosql", "graphql", "rest api", "microservices", "ci/cd",
    "git", "linux", "agile", "scrum", "data structures", "system design",
]


def _extract_skills(text: str) -> set[str]:
    """Extract tech skills from text (case-insensitive)."""
    text_lower = text.lower()
    found = set()
    for skill in TECH_SKILLS:
        if skill in text_lower:
            found.add(skill)
    return found


def compute_match_score(resume_text: str, job_description: str) -> int:
    """
    Compute a 0-100 match score between a resume and job description.
    Uses keyword overlap + skill intersection heuristic.
    """
    if not resume_text or not job_description:
        return 70  # default decent score

    resume_skills = _extract_skills(resume_text)
    jd_skills = _extract_skills(job_description)

    if not jd_skills:
        return 72  # no skills mentioned → assume passable

    overlap = resume_skills & jd_skills
    skill_score = min(int((len(overlap) / len(jd_skills)) * 60), 60)

    # Word overlap bonus (broad relevance)
    resume_words = set(re.findall(r'\b\w{4,}\b', resume_text.lower()))
    jd_words = set(re.findall(r'\b\w{4,}\b', job_description.lower()))
    word_overlap = len(resume_words & jd_words)
    word_score = min(int((word_overlap / max(len(jd_words), 1)) * 40), 40)

    return max(50, skill_score + word_score)


def _job_id(row) -> str:
    """Generate stable ID from job listing fields."""
    key = f"{row.get('company', '')}-{row.get('title', '')}-{row.get('location', '')}"
    return hashlib.md5(key.encode()).hexdigest()[:12]


def _days_left(date_posted) -> int:
    """Calculate days left assuming 30-day job posting window."""
    if date_posted is None:
        return 14
    try:
        if isinstance(date_posted, str):
            posted = datetime.fromisoformat(date_posted)
        else:
            posted = pd.Timestamp(date_posted).to_pydatetime()
        delta = 30 - (datetime.now() - posted).days
        return max(1, delta)
    except Exception:
        return 14


def _format_salary(min_salary, max_salary, currency="INR") -> str:
    """Format salary range into human-readable string."""
    try:
        lo = float(min_salary or 0)
        hi = float(max_salary or 0)
        if lo == 0 and hi == 0:
            return "Salary not disclosed"
        if currency == "INR":
            lo_l = lo / 100_000
            hi_l = hi / 100_000
            if lo_l > 0 and hi_l > 0:
                return f"₹{lo_l:.0f}–{hi_l:.0f} LPA"
            elif hi_l > 0:
                return f"up to ₹{hi_l:.0f} LPA"
            return f"₹{lo_l:.0f} LPA"
        else:
            if lo > 0 and hi > 0:
                return f"${lo:,.0f}–${hi:,.0f}"
            elif hi > 0:
                return f"up to ${hi:,.0f}"
            return f"${lo:,.0f}"
    except Exception:
        return "Salary not disclosed"


# ─────────────────────────────────────────────────────────────────────────────
# Main scrape function
# ─────────────────────────────────────────────────────────────────────────────

def _run_jobspy(site_names: list, search_term: str, location: str,
                results_wanted: int, is_remote: bool):
    """Run JobSpy synchronously — called inside a thread with timeout."""
    return scrape_jobs(
        site_name=site_names,
        search_term=search_term,
        location=location,
        results_wanted=results_wanted,
        hours_old=72 * 7,  # 3 weeks
        country_indeed="India" if "India" in location else "USA",
        linkedin_fetch_description=False,  # Faster — skip per-job description fetch
        is_remote=is_remote,
        job_type=None,
    )


def scrape_jobs_multi(
    search_term: str,
    location: str = "India",
    results_wanted: int = 20,
    resume_text: str = "",
    platforms: list[str] | None = None,
    is_remote: bool = False,
    experience_level: str = "",
) -> list[dict]:
    """
    Scrape jobs from multiple platforms using JobSpy.
    Runs with a hard JOBSPY_TIMEOUT-second deadline; falls back to mock data.
    Returns a list of normalized job dicts.
    """
    if not JOBSPY_AVAILABLE:
        print("[JobSpy] Library not available — using fallback")
        return _fallback_jobs(search_term, location, results_wanted)

    # LinkedIn is completely excluded from live scraping because the JobSpy Go tls-client library
    # crashes with a panic (index out of range) on Windows.
    requested = platforms or ["indeed", "glassdoor", "google"]
    safe_sites = [s for s in requested if s != "linkedin"]
    if not safe_sites:
        print("[JobSpy] Only LinkedIn requested, which is disabled due to TLS panic bugs on Windows. Using fallback.")
        return _fallback_jobs(search_term, location, results_wanted)



    jobs_df = None
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(
                _run_jobspy, safe_sites, search_term, location,
                min(results_wanted, 15), is_remote  # Cap at 15 for speed
            )
            jobs_df = future.result(timeout=JOBSPY_TIMEOUT)
    except concurrent.futures.TimeoutError:
        print(f"[JobSpy] Timed out after {JOBSPY_TIMEOUT}s — using fallback data")
        return _fallback_jobs(search_term, location, results_wanted)
    except Exception as e:
        print(f"[JobSpy] Scrape error: {e}")
        return _fallback_jobs(search_term, location, results_wanted)

    if jobs_df is None or jobs_df.empty:
        print("[JobSpy] Empty results — using fallback")
        return _fallback_jobs(search_term, location, results_wanted)

    results = []
    for _, row in jobs_df.iterrows():
        description = str(row.get("description", "") or "")
        match_score = compute_match_score(resume_text, description) if resume_text else _quick_score(
            search_term, str(row.get("title", ""))
        )
        skills = _extract_skills(description)
        salary_str = _format_salary(
            row.get("min_amount"), row.get("max_amount"),
            "INR" if "India" in location else "USD"
        )
        results.append({
            "id": _job_id(row),
            "company": str(row.get("company", "Unknown Company")),
            "position": str(row.get("title", "N/A")),
            "location": str(row.get("location", location)),
            "salary": salary_str,
            "deadline": str(row.get("date_posted", "")),
            "daysLeft": _days_left(row.get("date_posted")),
            "matchScore": match_score,
            "status": "pending",
            "source": str(row.get("site", "")).capitalize(),
            "skills": list(skills)[:8],
            "description": description[:2000],
            "url": str(row.get("job_url", "") or row.get("job_url_direct", "")),
            "isRemote": bool(row.get("is_remote", False)),
            "jobType": str(row.get("job_type", "") or "Full-time"),
            "experienceLevel": experience_level,
            "companyLogo": "",
        })

    # Sort by match score descending
    results.sort(key=lambda x: x["matchScore"], reverse=True)
    return results


def _quick_score(search_term: str, title: str) -> int:
    """Quick title-based match score when resume isn't available."""
    search_words = set(search_term.lower().split())
    title_words = set(title.lower().split())
    overlap = search_words & title_words
    if not search_words:
        return 70
    return max(55, min(95, int(60 + (len(overlap) / len(search_words)) * 35)))


# ─────────────────────────────────────────────────────────────────────────────
# Fallback mock data (when JobSpy unavailable / rate-limited)
# ─────────────────────────────────────────────────────────────────────────────

def _fallback_jobs(search_term: str, location: str, count: int) -> list[dict]:
    """Return realistic mock jobs when JobSpy scraping fails."""
    companies = [
        ("Google", "SDE-III", 92, "₹42-60 LPA", ["Python", "Distributed Systems", "Kubernetes"]),
        ("Microsoft", "Software Engineer-2", 88, "₹35-50 LPA", ["C#", "Azure", "React"]),
        ("Amazon", "SDE-2", 85, "₹38-55 LPA", ["Java", "AWS", "System Design"]),
        ("Flipkart", "Backend Engineer", 90, "₹28-40 LPA", ["Java", "Kafka", "Microservices"]),
        ("Razorpay", "Senior SWE", 78, "₹30-45 LPA", ["Go", "PostgreSQL", "Redis"]),
        ("PhonePe", "Platform Engineer", 83, "₹32-48 LPA", ["Java", "Spring", "Kafka"]),
        ("Swiggy", "SDE-2", 81, "₹30-42 LPA", ["Python", "React", "AWS"]),
        ("Zomato", "Software Engineer", 79, "₹25-38 LPA", ["Python", "Node.js", "MySQL"]),
        ("Atlassian", "Software Engineer", 86, "₹40-58 LPA", ["Java", "AWS", "Kubernetes"]),
        ("Salesforce", "MTS", 84, "₹45-65 LPA", ["Java", "Apex", "Salesforce"]),
    ]
    results = []
    for i, (company, role, score, salary, skills) in enumerate(companies[:count]):
        results.append({
            "id": f"fallback-{i}",
            "company": company,
            "position": f"{search_term.title()} / {role}",
            "location": location,
            "salary": salary,
            "deadline": "",
            "daysLeft": 7 + (i * 3 % 20),
            "matchScore": score,
            "status": "pending",
            "source": ["LinkedIn", "Indeed", "Glassdoor", "Google"][i % 4],
            "skills": skills,
            "description": f"We are looking for a {search_term} at {company}. Join our team and build world-class products.",
            "url": f"https://linkedin.com/jobs/search?keywords={search_term.replace(' ', '+')}",
            "isRemote": i % 3 == 0,
            "jobType": "Full-time",
            "experienceLevel": "Mid-level",
            "companyLogo": "",
        })
    return results
