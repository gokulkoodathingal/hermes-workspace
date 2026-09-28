# <Feature name> — Feature PRD

> Copy this file to `docs/prd/features/<kebab-name>.md`. A feature PRD slices the product baseline. It does not replace [hermes-workspace.md](./hermes-workspace.md).

## 1. Document control

| Field | Value |
| --- | --- |
| Feature | `<name>` |
| Status | `Draft` \| `In review` \| `Accepted` \| `Shipped` |
| Parent product PRD | [hermes-workspace.md](./hermes-workspace.md) |
| Parent requirement IDs | `<HW-FR-...>` |
| Owner | `<role>` |
| Updated | `<YYYY-MM-DD>` |

## 2. Summary

`<What the user can do after this ships, in one paragraph.>`

## 3. Problem and job

| Job | Persona | Pain this removes |
| --- | --- | --- |
| `<J# from the product PRD, or a new job>` | `<persona>` | `<pain>` |

## 4. Scope

### In

- `<behavior>`

### Out

- `<behavior this feature will not take on>`

## 5. Journey delta

How [journey ID] changes.

| Step | Before | After |
| --- | --- | --- |
| `<step>` | `<current>` | `<new>` |

## 6. Requirements

| ID | Requirement | Priority | Acceptance |
| --- | --- | --- | --- |
| `HW-FR-<AREA>-NNN` | `<The product shall ...>` | `P0` | `<Given / When / Then>` |

Use the next free ID in that area. If this feature adds a product-level requirement, add the same row to the product PRD.

## 7. Experience

| ID | Requirement | Acceptance |
| --- | --- | --- |
| `HW-UX-NNN` | `<empty, error, loading, or capability-gate behavior>` | `<acceptance>` |

## 8. Dependencies and compatibility

| Dependency | Need | Absent behavior |
| --- | --- | --- |
| `<system>` | `<contract>` | `<what the user sees>` |

## 9. Data and security

| Data touched | Security requirement |
| --- | --- |
| `<data>` | `<HW-SEC-... or new requirement>` |

## 10. Success and rollout

| Metric | Expected movement | How verified |
| --- | --- | --- |
| `<metric from product PRD>` | `<direction>` | `<test or observation>` |

Rollout: `<default on / flag / docs-only>`. Rollback: `<how to revert user impact>`.

## 11. Open questions

| ID | Question | Needed before |
| --- | --- | --- |
| Q1 | `<question>` | `<implementation / release>` |

## 12. Traceability

| Feature requirement | Product requirement | Test |
| --- | --- | --- |
| `<id>` | `<id>` | `<command, file, or TBD>` |
