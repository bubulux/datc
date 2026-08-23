#!/usr/bin/env python3
"""Local admin server for editing storage/ (CRUD).

Zero third-party dependencies beyond pyyaml (already used by the other scripts).
Serves the admin UI from admin/ and a small JSON API over the two YAML tables.
Every write validates the payload, persists it, then regenerates web/data.js so
the browser app never drifts from storage.

Runs on 127.0.0.1 only (never exposed to the network) and has no auth — it is a
local editing tool. Start it with:

    python3 scripts/admin.py            # -> http://127.0.0.1:8765

API:
    GET    /api/data                    -> {concepts:[{slug,id}], terms:[{...}]}
    POST   /api/term                    -> create   {slug,type,synonyms,variants,antagonists,concepts}
    PUT    /api/term/<slug>             -> update   (+ optional newSlug to rename)
    DELETE /api/term/<slug>             -> delete   (cascade-unlinks referrers)
    POST   /api/concept                 -> create   {slug}
    PUT    /api/concept/<slug>          -> rename   {newSlug}
    DELETE /api/concept/<slug>          -> delete   (cascade-unlinks from terms)
"""
import json
import re
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

import yaml

ROOT = Path(__file__).resolve().parent.parent
TERMS = ROOT / "storage" / "terms"
CONCEPTS = ROOT / "storage" / "concepts"
UI_DIR = ROOT / "admin"
BUILD = ROOT / "scripts" / "build.py"
VALIDATE = ROOT / "scripts" / "validate.py"

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
ALLOWED_TYPES = {"", "noun", "verb", "adjective", "adverb", "phrase"}
LINK_FIELDS = ("synonyms", "variants", "antagonists")
HOST, PORT = "127.0.0.1", 8765


class ApiError(Exception):
    def __init__(self, status, message):
        self.status = status
        self.message = message


# ---- storage helpers -------------------------------------------------------

def load(directory):
    rows = {}
    for f in sorted(directory.glob("*.yml")):
        rows[f.stem] = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
    return rows


def yaml_ids(ids):
    if not ids:
        return " []"
    return "\n" + "\n".join(f"  - {i}" for i in ids)


def write_term(slug, data):
    out = [
        f"id: {data['id']}",
        f"type: {data.get('type') or ''}".rstrip(),
        f"synonyms:{yaml_ids(data.get('synonyms') or [])}",
        f"variants:{yaml_ids(data.get('variants') or [])}",
        f"antagonists:{yaml_ids(data.get('antagonists') or [])}",
        f"concepts:{yaml_ids(data.get('concepts') or [])}",
        "",
    ]
    (TERMS / f"{slug}.yml").write_text("\n".join(out), encoding="utf-8")


def write_concept(slug, data):
    (CONCEPTS / f"{slug}.yml").write_text(f"id: {data['id']}\n", encoding="utf-8")


def next_id(rows):
    return max((d.get("id", 0) for d in rows.values()), default=0) + 1


def regenerate():
    """Backstop-validate then rebuild web/data.js. Returns (ok, message)."""
    v = subprocess.run([sys.executable, str(VALIDATE)], capture_output=True, text=True)
    if v.returncode != 0:
        return False, "validate failed:\n" + v.stdout + v.stderr
    b = subprocess.run([sys.executable, str(BUILD)], capture_output=True, text=True)
    if b.returncode != 0:
        return False, "build failed:\n" + b.stdout + b.stderr
    return True, b.stdout.strip()


# ---- payload validation ----------------------------------------------------

def validate_term_payload(body, terms, concepts, self_id):
    if body.get("type", "") not in ALLOWED_TYPES:
        raise ApiError(400, f"invalid type {body.get('type')!r}")
    term_ids = {d["id"] for d in terms.values()}
    concept_ids = {d["id"] for d in concepts.values()}
    for field in LINK_FIELDS:
        vals = body.get(field) or []
        if not isinstance(vals, list) or not all(isinstance(x, int) for x in vals):
            raise ApiError(400, f"{field} must be a list of integer ids")
        for i in vals:
            if i == self_id:
                raise ApiError(400, f"{field} cannot reference this term itself")
            if i not in term_ids:
                raise ApiError(400, f"{field} id {i} is not an existing term")
    concs = body.get("concepts") or []
    if not isinstance(concs, list) or not all(isinstance(x, int) for x in concs):
        raise ApiError(400, "concepts must be a list of integer ids")
    for i in concs:
        if i not in concept_ids:
            raise ApiError(400, f"concept id {i} does not exist")


def check_slug(slug):
    if not SLUG_RE.match(slug or ""):
        raise ApiError(400, f"invalid slug {slug!r} (use lowercase-hyphenated)")


# ---- request routing -------------------------------------------------------

def api_get_data():
    terms = load(TERMS)
    concepts = load(CONCEPTS)
    return {
        "concepts": [
            {"slug": s, "id": d["id"]}
            for s, d in sorted(concepts.items(), key=lambda kv: kv[1]["id"])
        ],
        "terms": [
            {
                "slug": s,
                "id": d["id"],
                "type": d.get("type") or "",
                "synonyms": d.get("synonyms") or [],
                "variants": d.get("variants") or [],
                "antagonists": d.get("antagonists") or [],
                "concepts": d.get("concepts") or [],
            }
            for s, d in sorted(terms.items())
        ],
    }


def api_create_term(body):
    terms = load(TERMS)
    concepts = load(CONCEPTS)
    slug = body.get("slug")
    check_slug(slug)
    if slug in terms:
        raise ApiError(409, f"term '{slug}' already exists")
    new_id = next_id(terms)
    validate_term_payload(body, terms, concepts, new_id)
    body["id"] = new_id
    write_term(slug, body)
    return {"slug": slug, "id": new_id}


def api_update_term(slug, body):
    terms = load(TERMS)
    concepts = load(CONCEPTS)
    if slug not in terms:
        raise ApiError(404, f"term '{slug}' not found")
    self_id = terms[slug]["id"]
    validate_term_payload(body, terms, concepts, self_id)
    body["id"] = self_id
    new_slug = body.get("newSlug", slug)
    check_slug(new_slug)
    if new_slug != slug and new_slug in terms:
        raise ApiError(409, f"cannot rename: '{new_slug}' already exists")
    write_term(new_slug, body)
    if new_slug != slug:
        (TERMS / f"{slug}.yml").unlink()
    return {"slug": new_slug, "id": self_id}


def api_delete_term(slug):
    terms = load(TERMS)
    if slug not in terms:
        raise ApiError(404, f"term '{slug}' not found")
    dead_id = terms[slug]["id"]
    (TERMS / f"{slug}.yml").unlink()
    # Cascade: strip this id from every other term's link fields.
    unlinked = 0
    for other, d in terms.items():
        if other == slug:
            continue
        changed = False
        for field in LINK_FIELDS:
            vals = d.get(field) or []
            if dead_id in vals:
                d[field] = [i for i in vals if i != dead_id]
                changed = True
        if changed:
            write_term(other, d)
            unlinked += 1
    return {"deleted": slug, "unlinked_from": unlinked}


def api_create_concept(body):
    concepts = load(CONCEPTS)
    slug = body.get("slug")
    check_slug(slug)
    if slug in concepts:
        raise ApiError(409, f"concept '{slug}' already exists")
    new_id = next_id(concepts)
    write_concept(slug, {"id": new_id})
    return {"slug": slug, "id": new_id}


def api_update_concept(slug, body):
    concepts = load(CONCEPTS)
    if slug not in concepts:
        raise ApiError(404, f"concept '{slug}' not found")
    new_slug = body.get("newSlug", slug)
    check_slug(new_slug)
    if new_slug != slug and new_slug in concepts:
        raise ApiError(409, f"cannot rename: '{new_slug}' already exists")
    write_concept(new_slug, {"id": concepts[slug]["id"]})
    if new_slug != slug:
        (CONCEPTS / f"{slug}.yml").unlink()
    return {"slug": new_slug, "id": concepts[slug]["id"]}


def api_delete_concept(slug):
    concepts = load(CONCEPTS)
    terms = load(TERMS)
    if slug not in concepts:
        raise ApiError(404, f"concept '{slug}' not found")
    dead_id = concepts[slug]["id"]
    (CONCEPTS / f"{slug}.yml").unlink()
    unlinked = 0
    for tslug, d in terms.items():
        vals = d.get("concepts") or []
        if dead_id in vals:
            d["concepts"] = [i for i in vals if i != dead_id]
            write_term(tslug, d)
            unlinked += 1
    return {"deleted": slug, "unlinked_from": unlinked}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("  " + (fmt % args) + "\n")

    # -- helpers --
    def _send_json(self, obj, status=200):
        payload = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if not n:
            return {}
        return json.loads(self.rfile.read(n).decode("utf-8"))

    def _serve_static(self):
        rel = self.path.split("?", 1)[0].lstrip("/") or "index.html"
        target = (UI_DIR / rel).resolve()
        if UI_DIR not in target.parents and target != UI_DIR / "index.html":
            if not str(target).startswith(str(UI_DIR)):
                return self.send_error(403)
        if not target.is_file():
            return self.send_error(404)
        ctype = "text/html" if target.suffix == ".html" else "text/plain"
        data = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _write_and_regen(self, result):
        ok, msg = regenerate()
        if not ok:
            return self._send_json({"error": msg}, 500)
        result["build"] = msg
        self._send_json(result)

    # -- verbs --
    def do_GET(self):
        try:
            if self.path.split("?")[0] == "/api/data":
                return self._send_json(api_get_data())
            return self._serve_static()
        except Exception as e:  # noqa: BLE001
            self._send_json({"error": str(e)}, 500)

    def _dispatch_write(self, method):
        parts = self.path.split("?")[0].strip("/").split("/")
        # parts like ['api','term'] or ['api','term','<slug>']
        if len(parts) < 2 or parts[0] != "api":
            raise ApiError(404, "unknown endpoint")
        kind = parts[1]
        slug = unquote(parts[2]) if len(parts) > 2 else None
        body = self._body() if method in ("POST", "PUT") else {}
        if kind == "term":
            if method == "POST":
                return api_create_term(body)
            if method == "PUT":
                return api_update_term(slug, body)
            if method == "DELETE":
                return api_delete_term(slug)
        if kind == "concept":
            if method == "POST":
                return api_create_concept(body)
            if method == "PUT":
                return api_update_concept(slug, body)
            if method == "DELETE":
                return api_delete_concept(slug)
        raise ApiError(404, "unknown endpoint")

    def _handle_write(self, method):
        try:
            result = self._dispatch_write(method)
            self._write_and_regen(result)
        except ApiError as e:
            self._send_json({"error": e.message}, e.status)
        except Exception as e:  # noqa: BLE001
            self._send_json({"error": str(e)}, 500)

    def do_POST(self):
        self._handle_write("POST")

    def do_PUT(self):
        self._handle_write("PUT")

    def do_DELETE(self):
        self._handle_write("DELETE")


def main():
    ok, msg = regenerate()
    print("startup build:", "ok" if ok else "FAILED")
    if not ok:
        print(msg)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"DATC admin running at http://{HOST}:{PORT}  (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    main()
