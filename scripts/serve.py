#!/usr/bin/env python3
"""Zero-dependency live-reload dev server for web/.

Serves the browser app and reloads it automatically on change. It also watches
storage/ and re-runs build.py when a term/concept file changes, so editing
storage regenerates web/data.js and the open browser reloads on its own — the
full edit -> rebuild -> reload loop with no external tooling (no npm/live-server).

Reload is delivered over Server-Sent Events; a tiny script is injected into
index.html at serve time. Read-only: this server never writes to storage
(use scripts/admin.py for that).

    python3 scripts/serve.py            # -> http://127.0.0.1:8090
    PORT=9000 python3 scripts/serve.py
"""
import os
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
STORAGE = ROOT / "storage"
BUILD = ROOT / "scripts" / "build.py"
HOST = "127.0.0.1"
PORT = int(os.environ.get("PORT", "8090"))

CTYPES = {".html": "text/html", ".js": "application/javascript",
          ".css": "text/css", ".json": "application/json"}

_gen = 0                       # bumped whenever the browser should reload
_lock = threading.Lock()

RELOAD_SNIPPET = (
    "<script>(function(){var s=new EventSource('/__reload');"
    "s.onmessage=function(){location.reload()};})();</script>"
)


def signature(paths):
    out = []
    for p in paths:
        try:
            out.append((str(p), p.stat().st_mtime_ns))
        except FileNotFoundError:
            pass
    return tuple(sorted(out))


def web_files():
    return list(WEB.glob("*.html")) + list(WEB.glob("*.js")) + list(WEB.glob("*.css"))


def run_build():
    r = subprocess.run([sys.executable, str(BUILD)], capture_output=True, text=True)
    print("  rebuild:", r.stdout.strip() or r.stderr.strip())


def watcher():
    global _gen
    storage_sig = signature(STORAGE.rglob("*.yml"))
    web_sig = signature(web_files())
    while True:
        time.sleep(0.4)
        new_storage = signature(STORAGE.rglob("*.yml"))
        if new_storage != storage_sig:
            storage_sig = new_storage
            run_build()                       # may update web/data.js
        new_web = signature(web_files())
        if new_web != web_sig:
            web_sig = new_web
            with _lock:
                _gen += 1
            print("  reload ->", _gen)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/__reload":
            return self._sse()
        if path in ("/", "/index.html"):
            return self._serve_index()
        return self._serve_static(path)

    def _serve_index(self):
        html = (WEB / "index.html").read_text(encoding="utf-8")
        html = html.replace("</body>", RELOAD_SNIPPET + "</body>", 1)
        data = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _serve_static(self, path):
        target = (WEB / path.lstrip("/")).resolve()
        if not str(target).startswith(str(WEB)) or not target.is_file():
            return self.send_error(404)
        data = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", CTYPES.get(target.suffix, "application/octet-stream"))
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _sse(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        seen = _gen
        try:
            while True:
                with _lock:
                    cur = _gen
                if cur != seen:
                    seen = cur
                    self.wfile.write(b"data: reload\n\n")
                    self.wfile.flush()
                else:
                    self.wfile.write(b": ping\n\n")   # keep-alive comment
                    self.wfile.flush()
                time.sleep(0.5)
        except (BrokenPipeError, ConnectionResetError):
            pass


def main():
    run_build()  # start fresh
    threading.Thread(target=watcher, daemon=True).start()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"DATC dev server: http://{HOST}:{PORT}  (live-reload on web/ + storage/ changes)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    main()
