FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer cached unless requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create persistent data directory for SQLite
RUN mkdir -p /data

# Set SQLite to use the mounted volume directory
ENV DB_DIR=/data

EXPOSE 8000

# Production: 2 workers, no reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
