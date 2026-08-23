# Terms table

Source of truth for the Dictionary of Abstraction Terms for Code. One YAML file
per term (one "row"). Relational-normalized: rows link to each other by numeric
`id`, not by name.

## Row format — `<slug>.yml`

The filename slug is the term's **name** (lowercase, alphanumeric, hyphenated).
The `id` is the **surrogate key** other rows link to.

```yaml
id: 14                  # int, unique within this table
type: verb              # noun | verb | adjective | adverb | phrase (blank to fill)
synonyms:               # term ids (recursive FK -> terms)
  - 88
variants:               # term ids (recursive FK -> terms)
  - 41
antagonists:            # term ids (recursive FK -> terms)
  - 41
concepts:               # concept ids (FK -> ../concepts)
  - 3
```

## Constraints (enforced by `scripts/validate.py`)

- `id` is an integer, unique within the terms table.
- `synonyms`, `variants`, `antagonists` may only contain ids of **other terms**
  (this table is recursive) — never concept ids, never a row's own id.
- `concepts` may only contain ids from the concepts table.
- Only the six fields above are allowed; `type`, if set, is from the fixed enum.

## Seeded data to clean up

Pairings from the original `Collection.txt` (`A / B`, `A --> B`, parentheticals)
were dumped into `variants` as a holding-pen. Reclassify each into `synonyms` or
`antagonists` as appropriate, and fill in `type`.
