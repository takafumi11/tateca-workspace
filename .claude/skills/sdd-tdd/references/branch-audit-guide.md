# Branch Audit Guide

Run this before modifying an existing method.

## Steps

1. List every branch:
   - `if` / `else`
   - `switch`
   - early return
   - `try` / `catch`
   - idempotent no-op path
   - feature-flag or config branch
2. Map existing unit tests to those branches.
3. Add missing coverage before or alongside the new behavior.

## Output

```md
| Branch | Existing test? | Change needed? |
|--------|----------------|----------------|
| authorized + changed value | Yes | Extend assertions |
| authorized + same value | No | Add unit test |
```

Do not add a new branch without deciding how it is covered.
