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

# We are using the HuggingFace API, so no local model downloads are needed!
# This drastically reduces the Docker image size and RAM footprint.

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
