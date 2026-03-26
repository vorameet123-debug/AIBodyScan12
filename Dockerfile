# Multi-stage Dockerfile for BodyScan AI API
# Hardened for production security

# Stage 1: Build stage with all dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies for building
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt


# Stage 2: Runtime stage (smaller, hardened image)
FROM python:3.11-slim

# Security: Don't run as root
# Create non-root user for running the application
RUN groupadd --gid 1000 appgroup \
    && useradd --uid 1000 --gid appgroup --shell /bin/bash --create-home appuser

WORKDIR /app

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy Python packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code with proper ownership
COPY --chown=appuser:appgroup api/ ./api/
COPY --chown=appuser:appgroup integrations/ ./integrations/
COPY --chown=appuser:appgroup requirements.txt .

# Security: Set proper file permissions
RUN chmod -R 755 /app \
    && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Make sure scripts are in PATH
ENV PATH=/home/appuser/.local/bin:$PATH

# Set Python to run in unbuffered mode
ENV PYTHONUNBUFFERED=1

# Security: Disable Python bytecode generation in container
ENV PYTHONDONTWRITEBYTECODE=1

# Security: Set secure environment defaults
ENV ENVIRONMENT=production

# Expose port (non-privileged port)
EXPOSE 8000

# Security: Read-only filesystem hint (enable via docker run --read-only)
# Application should write only to /tmp and mounted volumes
VOLUME ["/tmp"]

# Health check with curl (more reliable than Python in minimal images)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Security labels
LABEL org.opencontainers.image.title="BodyScan AI API" \
      org.opencontainers.image.description="AI-powered body measurement API" \
      org.opencontainers.image.vendor="BodyScan AI" \
      security.hardened="true"

# Run the application
CMD ["python", "api/app.py"]
