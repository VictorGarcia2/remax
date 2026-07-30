FROM python:3.11-slim

# Instalar dependencias del sistema operativo para Playwright y GTK/Cairo
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    gnupg \
    libgobject-2.0-0 \
    pango1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libffi-dev \
    shared-mime-info \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar requerimientos e instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instalar navegadores para Playwright (Inmuebles24 scraper)
RUN pip install playwright && playwright install chromium --with-deps

# Copiar el código de la API y el modelo
COPY . .

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PYTHONUTF8=1
ENV HEADLESS=true

CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
