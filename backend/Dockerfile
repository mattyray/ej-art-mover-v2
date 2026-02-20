FROM python:3.12-slim

# WeasyPrint system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD sh -c "echo PORT=$PORT && python -c \"from http.server import HTTPServer, BaseHTTPRequestHandler; \
class H(BaseHTTPRequestHandler): \
    def do_GET(self): self.send_response(200); self.end_headers(); self.wfile.write(b'OK') \
    def do_POST(self): self.send_response(200); self.end_headers(); self.wfile.write(b'OK') \
HTTPServer(('0.0.0.0', ${PORT:-8000}), H).serve_forever()\""
