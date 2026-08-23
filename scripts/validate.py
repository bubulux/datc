#!/usr/bin/env python3
"""Validate the storage/ flat-file dictionary (relational-normalized).

Two entity tables, each one YAML file per row:
  storage/terms/<slug>.yml     - the term rows
  storage/concepts/<slug>.yml  - the concept rows

The filename slug is the entity's name; `id` is the surrogate key used for links.

Term row schema:
  id          : int, unique within terms
  type        : one of ALLOWED_TYPES, or blank
  synonyms    : list[int]  recursive FK -> terms.id
  variants    : list[int]  recursive FK -> terms.id
  antagonists : list[int]  recursive FK -> terms.id
  concepts    : list[int]  FK -> concepts.id

Concept row schema:
  id          : int, unique within concepts

Constraints enforced:
  - filenames are valid slugs
  - files are YAML mappings with only allowed fields
  - every row has an integer id; ids are unique within their own table
  - type, if set, is an allowed part of speech
  - synonyms/variants/antagonists reference EXISTING TERM ids only (recursive)
  - concepts reference EXISTING CONCEPT ids only
  - no row lists its own id in a link field

Exit 0 = clean, 1 = problems. Suitable for CI.
"""
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
TERMS = ROOT / "storage" / "terms"
CONCEPTS = ROOT / "storage" / "concepts"
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

TERM_FIELDS = {"id", "type", "synonyms", "variants", "antagonists", "concepts"}
CONCEPT_FIELDS = {"id"}
TERM_LINK_FIELDS = ("synonyms", "variants", "antagonists")  # -> terms.id
ALLOWED_TYPES = {"noun", "verb", "adjective", "adverb", "phrase"}


def load_table(directory, errors):
    """Return {path: (slug, data)} and {id: slug}, appending id/parse errors."""
    rows = {}
    id_to_slug = {}
    if not directory.is_dir():
        errors.append(f"{directory} not found")
        return rows, id_to_slug

    for f in sorted(directory.glob("*.yml")):
        rel = f.relative_to(ROOT)
        if not SLUG_RE.match(f.stem):
            errors.append(f"{rel}: filename '{f.stem}' is not a valid slug")
        try:
            data = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
        except yaml.YAMLError as e:
            errors.append(f"{rel}: invalid YAML ({e})")
            continue
        if not isinstance(data, dict):
            errors.append(f"{rel}: top level must be a mapping")
            continue
        rows[f] = (f.stem, data)

        rid = data.get("id")
        if not isinstance(rid, int) or isinstance(rid, bool):
            errors.append(f"{rel}: 'id' must be an integer")
        elif rid in id_to_slug:
            errors.append(
                f"{rel}: duplicate id {rid} (also in {id_to_slug[rid]}.yml)"
            )
        else:
            id_to_slug[rid] = f.stem
    return rows, id_to_slug


def check_link_list(rel, field, val, own_id, valid_ids, errors):
    if val is None:
        return
    if not isinstance(val, list) or not all(
        isinstance(x, int) and not isinstance(x, bool) for x in val
    ):
        errors.append(f"{rel}: '{field}' must be a list of integer ids")
        return
    for target in val:
        if target == own_id:
            errors.append(f"{rel}: '{field}' references its own id {target}")
        elif target not in valid_ids:
            errors.append(f"{rel}: {field} id {target} has no matching row")


def main():
    errors = []
    term_rows, term_ids = load_table(TERMS, errors)
    concept_rows, concept_ids = load_table(CONCEPTS, errors)
    valid_term_ids = set(term_ids)
    valid_concept_ids = set(concept_ids)

    for f, (slug, data) in term_rows.items():
        rel = f.relative_to(ROOT)
        unknown = set(data) - TERM_FIELDS
        if unknown:
            errors.append(f"{rel}: unknown field(s): {sorted(unknown)}")

        t = data.get("type")
        if t is not None and t not in ALLOWED_TYPES:
            errors.append(f"{rel}: type '{t}' not in {sorted(ALLOWED_TYPES)}")

        own_id = data.get("id")
        for field in TERM_LINK_FIELDS:
            check_link_list(
                rel, field, data.get(field), own_id, valid_term_ids, errors
            )
        check_link_list(
            rel, "concepts", data.get("concepts"), own_id, valid_concept_ids, errors
        )

    for f, (slug, data) in concept_rows.items():
        rel = f.relative_to(ROOT)
        unknown = set(data) - CONCEPT_FIELDS
        if unknown:
            errors.append(f"{rel}: unknown field(s): {sorted(unknown)}")

    total = len(term_rows) + len(concept_rows)
    if errors:
        print(f"FAIL: {len(errors)} problem(s) across {total} file(s)\n")
        for e in errors:
            print(f"  - {e}")
        return 1

    print(
        f"OK: {len(term_rows)} term(s), {len(concept_rows)} concept(s) valid"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
