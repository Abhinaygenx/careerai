import math
import re
from typing import Dict, Any, List, Optional
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# Load model once
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# --- CONSTANTS ---
ACTION_VERBS = {
    "achieved", "accomplished", "added", "administered", "advised", "analyzed", "arranged", "assembled", "assessed",
    "audited", "built", "calculated", "centralized", "championed", "collaborated", "collected", "communicated", "completed",
    "composed", "computed", "conducted", "consolidated", "consulted", "controlled", "coordinated", "created", "decreased",
    "defined", "delivered", "deployed", "designed", "determined", "developed", "devised", "directed", "distributed", "documented",
    "drafted", "edited", "eliminated", "enabled", "engineered", "enhanced", "established", "evaluated", "executed", "expanded",
    "expedited", "facilitated", "forecasted", "formulated", "founded", "generated", "guided", "identified", "implemented", "improved",
    "increased", "influenced", "initiated", "innovated", "installed", "instituted", "integrated", "introduced", "investigated", "launched",
    "led", "maintained", "managed", "marketed", "maximized", "mentored", "methodized", "minimized", "modeled", "modified", "monitored",
    "negotiated", "operated", "optimized", "orchestrated", "organized", "originated", "oversaw", "participated", "partnered", "performed",
    "persuaded", "planned", "prepared", "presented", "produced", "programmed", "promoted", "proposed", "provided", "publicized", "published",
    "purchased", "recommended", "recruited", "reduced", "refided", "regulated", "reinforced", "resolved", "restructured", "reviewed",
    "revised", "revitalized", "saved", "scheduled", "screened", "selected", "shaped", "simplified", "sold", "solved", "spearheaded",
    "standardized", "started", "streamlined", "strengthened", "structured", "supervised", "supported", "targeted", "taught", "tested",
    "trained", "transformed", "updated", "upgraded", "utilized", "verified", "won", "wrote"
}

WEAK_WORDS = {
    "assisted", "helped", "worked", "responsible for", "duties included", "trying", "attempted",
    "various", "etc", "approx", "maybe"
}

CLICHES = {
    "hard worker", "team player", "motivated", "detail-oriented", "responsible", "think outside the box",
    "synergy", "go-getter", "dynamic", "proactive", "results-driven", "fast learner"
}

METRIC_PATTERNS = [
    r'\d+%',              # Percentage (e.g., 20%)
    r'\$\d+',             # Currency (e.g., $5000)
    r'\d+(?:,\d{3})',     # Numbers > 1000 (e.g., 10,000)
    r'(?:increased|decreased|improved|reduced) by \d+', # Action + Number
    r'\d+\+ years',       # Years of experience
    r'managed \d+',       # Management scale
]

# --- HELPER FUNCTIONS ---

def calculate_section_score(text: str, section_type: str) -> float:
    """Scores a specific section based on content quality."""
    if not text:
        return 0.0
        
    text_lower = text.lower()
    score = 50.0 # Base score for existence
    
    # 1. Length Check
    words = len(text.split())
    if section_type == "experience":
        if words < 50: score -= 20
        elif words > 150: score += 10 # Good detail
    elif section_type == "summary":
        if words > 100: score -= 10 # Too long
        elif 30 <= words <= 80: score += 10 # Sweet spot
        
    # 2. Key Elements
    if section_type == "experience":
        # Action Verbs
        verb_count = sum(1 for v in ACTION_VERBS if v in text_lower)
        score += min(20, verb_count * 2)
        
        # Weak Words
        weak_count = sum(1 for w in WEAK_WORDS if w in text_lower)
        score -= min(15, weak_count * 3)
        
        # Metrics
        metric_matches = 0
        for pattern in METRIC_PATTERNS:
            metric_matches += len(re.findall(pattern, text_lower))
        score += min(20, metric_matches * 4) # Up to 20 points for metrics
        
    elif section_type == "education":
        if "bachelor" in text_lower or "master" in text_lower or "phd" in text_lower or "degree" in text_lower or "bsc" in text_lower:
            score += 20
            
    elif section_type == "skills":
        # Density check - simply having keywords is good, but context matters less here
        if words > 20: score += 10
        if "," in text or "|" in text or "•" in text: score += 10 # Lists are good
        
    return max(0.0, min(100.0, score))

def calculate_completeness(metadata: Dict[str, bool]) -> float:
    """Scores resume completeness based on standard sections."""
    required = ["has_experience", "has_education", "has_skills"]
    optional = ["has_summary", "has_projects"]
    
    score = 0
    for req in required:
        if metadata.get(req): score += 25
    
    for opt in optional:
        if metadata.get(opt): score += 12.5
        
    return min(100.0, score)

def calculate_formatting_score(text: str) -> float:
    """Heuristic for formatting quality."""
    score = 100
    
    # Caps use (shouting check)
    if text.isupper():
        score -= 50
        
    # Bullet points usage (very rough heuristic: lines starting with special chars)
    bullet_lines = len(re.findall(r'^\s*[-•*]', text, re.MULTILINE))
    if bullet_lines > 5:
        score += 10 # Bonus for structured lists
    elif bullet_lines == 0:
        score -= 10 # Penalty for wall of text
        
    # Contact Info check (Email)
    # This is rough, usually parser extracts it, but checking regex here is a safety net
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if not re.search(email_pattern, text):
        score -= 20
        
    return max(0.0, min(100.0, score))

# --- MAIN LOGIC ---

def calculate_score(resume_data: Dict[str, Any], jd_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Calculates a comprehensive ATS score.
    Dispatch based on whether JD is provided.
    """
    text = resume_data.get("text", "")
    metadata = resume_data.get("metadata", {})
    keywords = resume_data.get("keywords", [])
    sections = resume_data.get("sections", {}) # Expected to be Dict[str, str] now
    
    # --- 1. Base Quality Score (Always calculated) ---
    
    # A. Section Quality
    exp_score = calculate_section_score(sections.get("experience", ""), "experience")
    edu_score = calculate_section_score(sections.get("education", ""), "education")
    skill_score = calculate_section_score(sections.get("skills", ""), "skills")
    summary_score = calculate_section_score(sections.get("summary", ""), "summary")
    
    # B. Completeness
    completeness = calculate_completeness(metadata)
    
    # C. Formatting
    formatting = calculate_formatting_score(text)
    
    # Weighted Base Score
    # Exp: 35%, Edu: 15%, Skills: 20%, Format: 15%, Completeness: 15%
    base_score = (
        (exp_score * 0.35) + 
        (edu_score * 0.15) + 
        (skill_score * 0.20) + 
        (formatting * 0.15) + 
        (completeness * 0.15)
    )

    # --- 2. JD Match (If JD provided) ---
    
    match_score = 0.0
    missing_keywords = []
    
    if jd_data and jd_data.get("text"):
        jd_keywords = set(k.lower() for k in jd_data.get("keywords", []) if len(k) > 2)
        resume_keywords_set = set(k.lower() for k in keywords)
        
        # A. Keyword Match (Hard Skills)
        if jd_keywords:
            common = resume_keywords_set.intersection(jd_keywords)
            keyword_match = (len(common) / len(jd_keywords)) * 100
            missing = list(jd_keywords - resume_keywords_set)
            missing.sort(key=len, reverse=True)
            missing_keywords = missing[:15] # Top 15 missing
        else:
            keyword_match = 0.0
            
        # B. Semantic Match (Soft Skills / Context)
        semantic_match = 0.0
        if model:
            # Compare Experience section specifically if available, else full text
            resume_context = sections.get("experience") or text
            jd_text = jd_data.get("text", "")
            
            embeddings = model.encode([resume_context, jd_text])
            sim = float(cosine_similarity([embeddings[0]], [embeddings[1]])[0][0])
            # Rescale 0.1-0.8 to 0-100 (stricter range)
            semantic_match = max(0, min(100, (sim - 0.1) * (100 / 0.7)))
            
        # Weighted Match Score
        # Keyword: 60%, Semantic: 40%
        match_score = (keyword_match * 0.6) + (semantic_match * 0.4)
        
        # Final Total With JD
        # Match: 60%, Quality: 40% (Quality still matters!)
        final_score = (match_score * 0.6) + (base_score * 0.4)
        mode = "jd_match"
        
    else:
        # Final Total Without JD
        final_score = base_score
        mode = "general_quality"

    return {
        "total_score": round(final_score, 1),
        "breakdown": {
            "base_quality": round(base_score, 1),
            "jd_match": round(match_score, 1) if jd_data else 0,
            "section_scores": {
                "experience": round(exp_score, 1),
                "education": round(edu_score, 1),
                "skills": round(skill_score, 1),
                "formatting": round(formatting, 1)
            }
        },
        "missing_keywords": missing_keywords,
        "mode": mode,
        "feedback": [
            "Action Verbs: Use strong verbs like 'Managed', 'Developed' instead of 'Worked on'.",
            "Quantify Results: Add numbers (e.g., 'Increased revenue by 20%') to your experience.",
            "Formatting: Use bullet points for readability."
        ] if base_score < 70 else ["Resume is well-structured!"]
    }

