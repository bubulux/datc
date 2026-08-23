# Concepts table

Source of truth for concepts that terms map to. One YAML file per concept (one
"row"). Terms reference these rows by `id` via their `concepts` field.

## Row format — `<slug>.yml`

The filename slug is the concept's **name**; `id` is the **surrogate key** terms
link to.

```yaml
id: 3                   # int, unique within this table
```

## Constraints (enforced by `scripts/validate.py`)

- `id` is an integer, unique within the concepts table.
- `id` is currently the only allowed field. (Extend the schema here and in the
  validator's `CONCEPT_FIELDS` if concepts gain more attributes later.)

No concepts are seeded yet — add them as terms get classified.
