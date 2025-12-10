FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install build deps and runtime deps
COPY requirements.txt ./
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc build-essential curl \
    && pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get remove -y gcc build-essential \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy app
COPY . /app

# Default port used by Render is provided via $PORT env var
EXPOSE 8000

# Use shell form so ${PORT} expansion works; default to 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
