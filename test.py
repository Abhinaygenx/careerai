import requests
import fitz

# Create dummy pdf
doc = fitz.open()
page = doc.new_page()
page.insert_text((50, 50), "Python Developer. Django, Flask, FastAPI. 5 years experience.")
doc.save("dummy.pdf")
doc.close()

with open("dummy.pdf", "rb") as f:
    r = requests.post(
        "http://localhost:3000/api/analyze-resume",
        files={"resume": f},
        data={"job_description": "We need a python developer with fastapi experience."}
    )
print(r.status_code)
print(r.json())
