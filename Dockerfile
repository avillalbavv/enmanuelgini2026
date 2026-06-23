FROM python:3.12-slim

WORKDIR /app
COPY api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY api /app/api
# DB se monta como volumen en /app/data/padron.sqlite
ENV PADRON_DB_PATH=data/padron.sqlite

EXPOSE 8000
CMD ["uvicorn","api.app:app","--host","0.0.0.0","--port","8000"]
