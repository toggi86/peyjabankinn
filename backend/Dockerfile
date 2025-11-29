# Stage 1: Base image
FROM python:3.12-slim

WORKDIR /app

# Install dependencies first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code (after .dockerignore applied)
COPY . .

# Expose Django port
EXPOSE 8000

# Run Django development server (or use gunicorn in production)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
