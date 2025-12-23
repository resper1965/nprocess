# Multi-stage build for Document Generator Engine

FROM python:3.11-slim as base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/

# Create exports directory
RUN mkdir -p /app/exports && \
    chmod 755 /app/exports

# Create non-root user
RUN useradd -m -u 1000 docgen && \
    chown -R docgen:docgen /app

USER docgen

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8004/health', timeout=5.0)" || exit 1

EXPOSE 8004

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"]
