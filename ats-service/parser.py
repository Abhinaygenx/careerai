"""
parser.py — PDF text extraction using IBM Docling
Leverages Docling for advanced structural, multi-column understanding without expensive APIs.
"""
import os
import re
import tempfile

from docling.document_converter import DocumentConverter

# Singleton converter to avoid reloading models on every request
_converter = None

def get_converter() -> DocumentConverter:
    global _converter
    if _converter is None:
        print("[parser] Loading IBM Docling DocumentConverter...")
        _converter = DocumentConverter()
    return _converter

def extract_text(pdf_bytes: bytes) -> str:
    """
    Extract clean text from a PDF byte stream using Docling.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name

    try:
        converter = get_converter()
        doc = converter.convert(tmp_path)
        # export_to_markdown preserves lists and structure perfectly
        text = doc.document.export_to_markdown()
        return _clean_text(text)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def _clean_text(text: str) -> str:
    """Clean extracted markdown text: normalize whitespace."""
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.replace('\x0c', '\n')
    text = re.sub(r'[–—]', '-', text)
    lines = [line.strip() for line in text.split('\n')]
    return '\n'.join(lines).strip()


def detect_sections(text: str) -> dict:
    """
    Detect common resume sections for structure scoring.
    """
    text_lower = text.lower()
    section_patterns = {
        "contact": r"(email|phone|linkedin|github|portfolio|@)",
        "summary": r"(summary|objective|profile|about me|professional summary)",
        "experience": r"(experience|work history|employment|positions held)",
        "education": r"(education|degree|university|college|bachelor|master|phd|bs|ms)",
        "skills": r"(skills|technologies|tech stack|proficiencies|competencies)",
        "projects": r"(projects|portfolio|open.?source)",
        "certifications": r"(certif|credential|license|aws|gcp|azure)",
        "achievements": r"(achievement|award|honor|recognition|publication)",
    }
    detected = {}
    for section, pattern in section_patterns.items():
        detected[section] = bool(re.search(pattern, text_lower))
    return detected
