#!/usr/bin/env python3
"""Simple Python HTTP server for serving the todo app."""

import os
import socket
from http.server import SimpleHTTPRequestHandler, HTTPServer

# Load environment variables
ENV_FILE = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(ENV_FILE):
    for line in open(ENV_FILE):
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            os.environ[key] = value.strip()

# Get port from environment or use default
PORT = int(os.environ.get('PORT', 8000))
HOST = os.environ.get('HOST', '0.0.0.0')

# Determine the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

class TodoAppHandler(SimpleHTTPRequestHandler):
    """Custom handler for serving the todo app with proper MIME types."""

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        """Log messages with custom format."""
        print(f"[{self.log_date_time_string()}] {args[0]}")

def find_free_port():
    """Find an available port on localhost."""
    with socket.socket() as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def main():
    """Start the HTTP server."""
    print(f"Starting TODO App Server...")
    print(f"Host: {HOST}")
    print(f"Port: {PORT}")
    print(f"Listening on http://{HOST}:{PORT}")
    print(f"Press Ctrl+C to stop")

    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, TodoAppHandler)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()

if __name__ == '__main__':
    main()
