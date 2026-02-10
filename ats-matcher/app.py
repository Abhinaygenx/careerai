import streamlit as st
import os
import tempfile
from src.parser import parse_resume, parse_jd
from src.scorer import calculate_score

st.set_page_config(page_title="ATS Resume Matcher", page_icon="📄")

st.title("ATS Resume Matcher 📄")
st.markdown("Upload your resume and the job description to get a match score and feedback.")

# 1. Upload Resume
st.header("1. Upload Resume")
uploaded_resume = st.file_uploader("Upload Resume (PDF)", type=["pdf"])

# 2. Upload/Paste JD
st.header("2. Job Description")
jd_input_option = st.radio("How would you like to provide the JD?", ("Paste Text", "Upload File"))

jd_text = ""
if jd_input_option == "Paste Text":
    jd_text = st.text_area("Paste Job Description here", height=200)
else:
    uploaded_jd = st.file_uploader("Upload JD (PDF/Txt)", type=["pdf", "txt"])
    if uploaded_jd:
        if uploaded_jd.type == "application/pdf":
            # Reuse pdf parser logic if we exposed it suitably, or just duplicate for now
            # For simplicity, let's assume text for now or simple read
            pass 
            # Ideally we'd save and parse like resume
            # But let's stick to text paste for MVP as it's more common
            st.info("File parsing for JD is not fully wired in this MVP. Please paste text if possible.")

if st.button("Calculate Match Score"):
    if not uploaded_resume:
        st.error("Please upload a resume.")
    elif not jd_text and jd_input_option == "Paste Text":
        st.error("Please enter a job description.")
    else:
        with st.spinner("Analyzing..."):
            # Save uploaded file to temp
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(uploaded_resume.getbuffer())
                resume_path = tmp_file.name

            try:
                # Parse
                resume_data = parse_resume(resume_path)
                jd_data = parse_jd(jd_text)
                
                # Score
                result = calculate_score(resume_data, jd_data)
                
                # Display
                st.balloons()
                col1, col2, col3 = st.columns(3)
                col1.metric("Total Score", f"{result['total_score']}%")
                col2.metric("Keyword Match", f"{result['breakdown']['keyword_match']}%")
                col3.metric("Semantic Match", f"{result['breakdown']['semantic_match']}%")
                
                st.progress(result['total_score'] / 100)
                
                st.subheader("Missing Keywords")
                if result['missing_keywords']:
                    st.warning("Consider adding these keywords:")
                    st.write(", ".join(result['missing_keywords']))
                else:
                    st.success("Great keyword coverage!")
                    
                st.subheader("Detailed Breakdown")
                st.json(result)
                
            except Exception as e:
                st.error(f"An error occurred: {e}")
            finally:
                # Cleanup
                if os.path.exists(resume_path):
                    os.remove(resume_path)
