# Contract Scope Guide (OpenAPI Half of Step 2)

This guide governs the slim Internal API OpenAPI surface produced as the contract half of Step 2.
It applies whenever the current repo owns the Internal API contract for the feature.

## Core Rule

The OpenAPI YAML for an owned path defines **only contract-visible behavior**: what callers send, what callers receive, and which status / error codes can come back. Every narrative — flow diagrams, Saga steps, Best Effort strategy, Recovery Mechanisms, KVS update prose, `external_ref_key` rules, AC ownership prose, repo ownership prose — lives in `design.md`.

If a fact is not directly required to call the API or to handle its response, it does not belong in OpenAPI.

## Allowed Top-Level Description Content

Inside the `post:` (or other operation) `description:` block, the only allowed top-level sections are:

1. **Overview** — a one-line statement of what the endpoint does.
2. **Business Rules** — a numbered or bulleted list of caller-facing behavior rules. Each rule references AC IDs from `requirements.md` and may name a section of `design.md`. Do not re-derive the rule narrative.
3. **Dependencies** (optional) — a short one-row-per-system table or one-liner naming the external systems and storage involved, when callers genuinely need to know.

Nothing else belongs in the description block. Keep the description short.

## Forbidden Top-Level Description Content

Do not put any of these in the OpenAPI description:

- Flow diagrams (Mermaid or otherwise)
- "Detailed design" links
- "DB CRUD scenarios" links
- "Technical Specification" / "Key Design Decisions" sections
- Saga Step prose
- "Best Effort Strategy" prose
- "Recovery Mechanisms" prose
- "KVS Update Points" prose
- "`external_ref_key` Rules" or any persistence-rule prose
- "Internal Error Codes (Logging Only)" prose
- AC Ownership Matrix or repo-ownership prose
- An "Error Code List" markdown table inside the description (the response examples are the authoritative list)

All of these belong in `design.md`. If a caller really needs to know one of them, add a single sentence in the relevant `Business Rules` bullet that references the `design.md` section.

## Allowed Body

- `parameters:` — only headers, path, and query parameters that callers actually send.
- `requestBody:` — request schema reference and one realistic example.
- `responses:` — every HTTP status code the contract can return, each with:
  - a `description` that includes the **per-response Internal Code Table** (see below)
  - the response schema reference
  - **grouped error examples** (see below) for every internal error code that maps to that HTTP status
- `tags`, `summary`, `operationId`, and any custom extensions the local style already uses.

## Per-Response Internal Code Table Rule

Each non-2xx response `description:` block must list every internal error code that can produce that HTTP status, plus its caller-facing message. Use a small markdown table inside the `description:` so the codes are visible in both the source YAML and the rendered docs page next to the HTTP status they belong to. For example:

```yaml
'400':
  description: |
    Bad request.

    | Internal code | Message |
    |---------------|---------|
    | `E00001` | The `{field}` has an invalid value |
    | `E00002` | The `{field}` is empty |

    `{field}` is one of `easyId`, `txKey`, or `point`.
  content:
    ...
```

This per-response table replaces the old top-level "Error Code List" markdown table that previously lived in the operation `description:`. The top-level table is forbidden; the per-response tables are mandatory for every owned non-2xx response.

A 2xx response does not need an Internal Code Table.

## Grouped Error Examples Rule

For every owned `(HTTP status, internal error code)` pair, create exactly one named example under that response and `$ref` it to a separate file under `components/examples/errors/{code}-{slug}.yaml`. For example:

```yaml
'400':
  description: |
    Bad request.

    | Internal code | Message |
    |---------------|---------|
    | `E00001` | The `{field}` has an invalid value |
    | `E00002` | The `{field}` is empty |
  content:
    application/json:
      schema:
        $ref: '../components/schemas/errors/{Feature}ApiErrorResponse.yaml'
      examples:
        invalidEasyId:
          summary: Invalid easyId value (E00001)
          $ref: '../components/examples/errors/e00001-invalid-easy-id.yaml'
        emptyEasyId:
          summary: Empty easyId field (E00002)
          $ref: '../components/examples/errors/e00002-empty-easy-id.yaml'
```

The example summary should name the internal error code in parentheses so the generated docs make the grouping obvious.

If a single internal error code maps to multiple distinct caller scenarios (for example `E00001` for three different fields), each scenario gets its own example file and its own example entry under that response. Such per-field scenarios are still a single row in the Internal Code Table because the caller-facing message is identical.

## Skip the OpenAPI Half When

The OpenAPI half of Step 2 may be skipped only when the feature does not change any of these for the Internal API contract:

- path set
- request or response schema
- validation rule (`required`, `format`, `minLength`, `maxLength`, `minimum`, `maximum`, etc.)
- status code
- error code
- contract-visible behavior such as idempotency, async completion, or terminal-result semantics

Even when the OpenAPI half is skipped, the `design.md` half of Step 2 still applies.

## Dependency Order

If another repo depends on the Internal API contract, fix the OpenAPI half here first.
Then the downstream repo can continue in its own repository against that dependency.
