FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for PyMuPDF and sentence-transformers
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Pre-download the fastembed model during build so it doesn't happen at runtime
# This bakes the 90MB model directly into the Docker image
RUN python -c "from fastembed import TextEmbedding; TextEmbedding(model_name='sentence-transformers/all-MiniLM-L6-v2')"

# Expose port (fallback for local)
EXPOSE 8000

# Optimize PyTorch/ONNX memory footprint for 512MB Render free tier
ENV MALLOC_ARENA_MAX=2
ENV OMP_NUM_THREADS=1
ENV MKL_NUM_THREADS=1
ENV OPENBLAS_NUM_THREADS=1
ENV PYTHONMALLOC=malloc

# Run the FastAPI server (explicitly restrict workers to 1 to avoid process forking overhead)
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
