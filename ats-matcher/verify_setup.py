import sys
import os
import fitz
import json

def create_dummy_pdf(filename, text):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text)
    doc.save(filename)
    doc.close()

def main():
    print("Verifying imports...")
    try:
        import spacy
        from sentence_transformers import SentenceTransformer
        from src.parser import parse_resume, parse_jd
        from src.scorer import calculate_score
        print("Imports successful.")
    except ImportError as e:
        print(f"Import failed: {e}")
        sys.exit(1)

    print("Creating dummy files...")
    resume_text = "Experienced software engineer with Python and Flask skills. Knows machine learning."
    jd_text = "Looking for a software engineer. Must know Python, Flask, and AI."
    
    resume_path = "dummy_resume.pdf"
    create_dummy_pdf(resume_path, resume_text)
    
    try:
        print("Testing Parser & Scorer...")
        resume_data = parse_resume(resume_path)
        jd_data = parse_jd(jd_text)
        
        result = calculate_score(resume_data, jd_data)
        
        print(f"Scoring Result: {json.dumps(result, indent=2)}")
        
        if result['total_score'] > 0:
            print("Verification Passed: Score generated successfully.")
        else:
            print("Verification Warning: Score is 0, something might be off but code ran.")
            
    except Exception as e:
        print(f"Verification Failed: {e}")
    finally:
        if os.path.exists(resume_path):
            os.remove(resume_path)

if __name__ == "__main__":
    main()
