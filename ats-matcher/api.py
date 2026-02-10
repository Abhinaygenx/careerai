from flask import Flask, request, jsonify
import os
import tempfile
import time
from src.parser import parse_resume, parse_jd
from src.scorer import calculate_score

app = Flask(__name__)

@app.route('/score', methods=['POST'])
def score_endpoint():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400
    
    resume_file = request.files['resume']
    jd_text = request.form.get('jd_text')
    
    # jd_text is now optional

    if resume_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Save resume to temp
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            resume_file.save(tmp_file.name)
            resume_path = tmp_file.name
            
        # Time Parser
        t0 = time.time()
        resume_data = parse_resume(resume_path)
        t1 = time.time()
        print(f"Time - Resume Parse: {t1-t0:.4f}s")
        
        jd_data = None
        if jd_text and len(jd_text.strip()) > 10:
             t2 = time.time()
             jd_data = parse_jd(jd_text)
             t3 = time.time()
             print(f"Time - JD Parse: {t3-t2:.4f}s")
        
        # Time Scorer
        t4 = time.time()
        result = calculate_score(resume_data, jd_data)
        t5 = time.time()
        print(f"Time - Scoring: {t5-t4:.4f}s")
        print(f"Time - Total Process: {t5-t0:.4f}s")
        
        # Cleanup
        os.remove(resume_path)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
