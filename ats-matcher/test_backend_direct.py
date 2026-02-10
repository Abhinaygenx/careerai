
import requests
import fitz
import os
import json
import time

def create_resume(text):
    filename = "test_resume.pdf"
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text)
    doc.save(filename)
    doc.close()
    return filename

text = """
Software Engineer
Contact: john.doe@example.com

Summary
Passionate engineer with 5+ years of experience in Python.

Experience
Software Engineer | Google | 2020-Present
- Developed scalable APIs using FastAPI.
- Increased revenue by 20% through optimization.
- Led a team of 5 engineers.

Education
Bachelor of Science in Computer Science | MIT | 2016-2020

Skills
Python, React, Docker, Kubernetes, AWS.
"""

print("Creating dummy resume...")
filename = create_resume(text)

try:
    with open(filename, 'rb') as f:
        files = {'resume': f}
        data = {'jd_text': 'We need a Python developer with AWS experience.'}
        
        print(f"Testing Backend API directly (http://localhost:5000/score)... at {time.time()}")
        try:
            r = requests.post('http://localhost:5000/score', files=files, data=data) # Port 5000 is default for Flask
        except requests.exceptions.ConnectionError:
            print("ERROR: Connection refused. Is api.py running on port 5000?")
            exit(1)
            
        if r.status_code == 200:
            print("SUCCESS: API Responded 200 OK")
            result = r.json()
            # print(json.dumps(result, indent=2))
        else:
            print(f"FAILURE: Status {r.status_code}")
            print(r.text)

finally:
    if os.path.exists(filename):
        os.remove(filename)
