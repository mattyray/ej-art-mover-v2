"""Minimal HTTP server to test Railway networking."""
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK from test server")

    def do_POST(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK from test server")

port = int(os.environ.get("PORT", 8000))
print(f"Test server listening on 0.0.0.0:{port}")
HTTPServer(("0.0.0.0", port), Handler).serve_forever()

