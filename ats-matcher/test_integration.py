import requests
import os

import requests
import os
import fitz

def create_dummy_pdf(filename, text):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text)
    doc.save(filename)
    doc.close()

try:
    if not os.path.exists('dummy_resume.pdf'):
        create_dummy_pdf('dummy_resume.pdf', "Software Engineer with Python/Flask skills.")
        
    with open('dummy_resume.pdf', 'rb') as f:
        files = {'resume': f}
        data = {'jd_text': 'Looking for a python developer with Flask experience.'}
        
        # Test Next.js API (Proxy)
        print("Testing Next.js API Proxy...")
        r = requests.post('http://localhost:3000/api/analyze-resume', files=files, data=data)
        
        print(f"Status Code: {r.status_code}")
        try:
            print(f"Response: {r.json()}")
        except:
            print(f"Raw Response: {r.text}")

        if r.status_code == 200 and r.json().get('success'):
            if 'text' in r.json():
                print("SUCCESS: Next.js Proxy working correctly (Response includes 'text').")
            else:
                 print("WARNING: success=True but 'text' field missing.")
        else:
            print("FAILURE: Next.js Proxy not working.")

except FileNotFoundError:
    print("Dummy PDF not found, creating it...")
    # Just skip if no dummy pdf, assumed it exists from previous steps
    pass
except Exception as e:
    print(f"Error: {e}")
