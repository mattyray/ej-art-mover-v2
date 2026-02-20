"""Bare-bones HTTP server to test Railway networking (no Django, no gunicorn)."""
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"OK - bare python server")

    def do_POST(self):
        self.do_GET()

port = int(os.environ.get("PORT", 8080))
print(f"Bare server listening on 0.0.0.0:{port} and [::]:{port}", flush=True)
server = HTTPServer(("", port), Handler)  # "" binds to all interfaces (IPv4+IPv6)
server.serve_forever()
