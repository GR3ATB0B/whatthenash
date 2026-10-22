#!/usr/bin/env python3
"""tools/dev-serve.py — static dev server for the site with caching off,
so edits to CSS/JS/SVG always show on reload.  Usage: python3 tools/dev-serve.py [port]"""
import http.server, os, sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
print(f'Serving whatthenash.com at http://localhost:{port}')
class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 128   # default 5 resets connections when the page fetches modules in a burst
    daemon_threads = True

Server(('127.0.0.1', port), NoCache).serve_forever()
