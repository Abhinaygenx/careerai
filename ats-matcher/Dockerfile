FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 8501 5000

CMD ["sh", "-c", "streamlit run app.py --server.port 8501 & python api.py"]
