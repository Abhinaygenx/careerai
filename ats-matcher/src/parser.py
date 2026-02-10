import fitz  # PyMuPDF
import spacy
import re
from typing import Dict, List, Any, Set, Optional

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm", disable=["ner", "textcat"])
except OSError:
    print("Downloading spaCy model...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm", disable=["ner", "textcat"])

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts text from a PDF file using PyMuPDF."""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def clean_text(text: str) -> str:
    """Cleans text primarily for NLP, but preserves structure slightly better for section analysis."""
    # Split by newlines to process line by line
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        if line:
            # Replace multiple spaces with single space
            line = re.sub(r'\s+', ' ', line)
            cleaned_lines.append(line)
    return "\n".join(cleaned_lines)

def extract_keywords(doc) -> Set[str]:
    """Extracts potential skills/keywords (Proper Nouns, Noun Chunks) from a SpaCy Doc."""
    keywords = set()
    
    # 1. Noun Chunks (e.g., "Machine Learning", "Project Manager")
    for chunk in doc.noun_chunks:
        clean_chunk = chunk.text.lower().strip()
        # Remove leading stop words
        if clean_chunk.startswith(('a ', 'an ', 'the ')):
            clean_chunk = clean_chunk.split(' ', 1)[1]
            
        if len(clean_chunk) > 2 and not any(char.isdigit() for char in clean_chunk): 
             keywords.add(clean_chunk)
             
    # 2. Proper Nouns (e.g., "Python", "Google", "AWS")
    for token in doc:
        if token.pos_ == "PROPN" and not token.is_stop and len(token.text) > 2:
             keywords.add(token.text.lower())
             
    return keywords

def extract_sections(text: str) -> Dict[str, str]:
    """
    Heuristic-based section extraction. 
    Finds section headers and extracts content until the next header.
    """
    text_lower = text.lower()
    lines = text_lower.split('\n')
    
    # Common Headers Mapping
    HEADERS = {
        "experience": [
            "experience", "work experience", "professional experience", "employment history", "work history", "career history"
        ],
        "education": [
            "education", "academic background", "qualifications", "academic history", "degrees"
        ],
        "skills": [
            "skills", "technical skills", "core competencies", "technologies", "skill set", "expertise"
        ],
        "projects": [
            "projects", "key projects", "personal projects"
        ],
        "summary": [
            "summary", "professional summary", "profile", "about me", "objective"
        ]
    }
    
    sections: Dict[str, str] = {
        "experience": "",
        "education": "",
        "skills": "",
        "projects": "",
        "summary": "",
        "other": "" # Everything else
    }
    
    current_section = "other"
    
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
            
        # Check if line is a header
        is_header = False
        for section_name, keywords in HEADERS.items():
            if line_clean in keywords or any(line_clean.startswith(kw + ":") for kw in keywords) or any(line_clean == kw for kw in keywords):
                current_section = section_name
                is_header = True
                break
        
        if not is_header:
            sections[current_section] += line + "\n"
            
    return sections

def parse_resume(file_path: str) -> Dict[str, Any]:
    """Parses a resume PDF to extracted text, keywords, and sections."""
    raw_text = extract_text_from_pdf(file_path)
    clean_ocr_text = clean_text(raw_text)
    
    # Extract sections first
    sections = extract_sections(clean_ocr_text)
    
    # NLP on full text
    doc = nlp(clean_ocr_text)
    keywords = extract_keywords(doc)
    
    return {
        "text": clean_ocr_text,
        "keywords": list(keywords), # Global keywords
        "sections": sections,        # Content split by section
        "metadata": {
            "has_experience": bool(sections["experience"].strip()),
            "has_education": bool(sections["education"].strip()),
            "has_skills": bool(sections["skills"].strip()),
            "has_projects": bool(sections["projects"].strip()),
            "has_summary": bool(sections["summary"].strip())
        }
    }

def parse_jd(jd_text: str) -> Dict[str, Any]:
    """Parses a Job Description text."""
    text = clean_text(jd_text)
    doc = nlp(text)
    keywords = extract_keywords(doc)
    
    return {
        "text": text,
        "keywords": list(keywords)
    }
