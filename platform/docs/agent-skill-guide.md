# Agent Skill Guide

Use this file when updating SDD docs or using SDD skills in this repository as an agent or maintainer.

## Execution Context

- Open this repository (`tateca-workspace`) directly.
- Tateca SDD documents live under `platform/docs/` and `products/tateca/docs/`.
- Tateca API Contract files live under `products/tateca/contracts/internal-api/`.
- Agent-specific SDD skills are maintained from a shared SDD skill source via user-level symlinks. Do not copy skill bodies into this repository unless the project intentionally changes that strategy.
- Existing committed agent guidance lives in `CLAUDE.md`.

## Source Of Truth

| Location | Owns | Edit here first when... |
|----------|------|-------------------------|
| `platform/docs/` | Tateca-local SDD / reverse SDD process rules, testing strategy, review-loop rules, and artifact boundaries | The rule applies to Tateca feature work or Tateca artifact layout |
| `products/tateca/docs/specs/{feature}/` | Feature-specific requirements, design, frontend requirements, and review records | The change affects one feature's behavior or ownership |
| `products/tateca/contracts/internal-api/` | Tateca API Contract source files | The request/response schema, path, validation, or error contract changes |
| Shared SDD skill source | Shared skill trigger metadata, workflow, and deep references | The change should affect all projects using the shared SDD skills |
| `CLAUDE.md` | Committed agent guidance for this repository | Commands, repo conventions, or high-level workflow guidance changes |
| `platform/docs/STEERING.md` | Human and agent project map | Tateca product, domain, architecture, or operations context changes |

## Reverse Skill Model

- Normal SDD uses Step 1 to Step 5 as both process order and artifact slots.
- Reverse SDD uses phases for process order, but it reconstructs the same artifact slots.
- Keep reverse-only shared behavior in `platform/docs/sdd-reverse-process.md`.
- Reverse skills may reuse the matching normal-step references as quality bars.
- Do not create one skill per reverse phase unless the work cannot be routed by artifact slot.

## Skill Usage Rules

- Choose normal SDD or reverse SDD before selecting a step skill.
- Read `platform/docs/sdd-process.md` or `platform/docs/sdd-reverse-process.md` before starting the step.
- Use `platform/docs/testing.md` when deciding test ownership or test type.
- Use `platform/docs/review-record-template.md` for review records.
- Keep duplicate process text out of feature specs; link to shared docs instead.

## Editing Notes

- Keep Tateca docs specific to the current repository layout.
- Do not reintroduce product-specific examples from another project.
- If a shared skill references external shared-doc paths, interpret the artifact destination through this repository's docs unless the skill is explicitly asking to edit the shared skill source.
