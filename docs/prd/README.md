# Product requirements

This folder is the product-requirements home for Hermes Workspace. Feature notes, swarm specs, and design docs stay where they are. A PRD is the document that states the user problem, the scope, the requirements, and the acceptance bar.

## Document types

| Document | Use it when | Start from |
| --- | --- | --- |
| Product PRD | You are defining or revising the product baseline: who it is for, what it must do, and how a release is accepted. | [TEMPLATE.md](./TEMPLATE.md) |
| Feature PRD | You are adding or changing one capability and need requirements that trace back to the product baseline. | [FEATURE-TEMPLATE.md](./FEATURE-TEMPLATE.md) |
| Current baseline | You need the living PRD for Hermes Workspace as shipped and planned. | [hermes-workspace.md](./hermes-workspace.md) |

Copy a template into a new file. Keep the section numbers. Empty sections stay in the doc with `TBD` so reviewers can see what is still open.

## Canonical section order

Every product PRD uses these sections, in this order:

1. Document control
2. Executive summary
3. Problem
4. Vision and product principles
5. Goals and non-goals
6. Success metrics
7. Users and jobs to be done
8. Scope
9. User journeys
10. Information architecture
11. Functional requirements
12. Experience requirements
13. Non-functional requirements
14. System context and dependencies
15. Data, privacy, and security
16. Analytics and operational signals
17. Release, rollout, and acceptance
18. Risks and mitigations
19. Open questions and decisions
20. Traceability
21. Appendix

Feature PRDs use the shorter order in [FEATURE-TEMPLATE.md](./FEATURE-TEMPLATE.md). They must cite at least one product requirement ID.

## Requirement IDs

IDs are stable. Do not renumber a requirement because a neighboring row moved.

| Prefix | Meaning | Example |
| --- | --- | --- |
| `HW-FR-<AREA>-NNN` | Functional requirement | `HW-FR-CHAT-001` |
| `HW-NFR-NNN` | Non-functional requirement | `HW-NFR-004` |
| `HW-UX-NNN` | Experience requirement | `HW-UX-002` |
| `HW-SEC-NNN` | Security or privacy requirement | `HW-SEC-003` |
| `HW-JR-NNN` | User journey | `HW-JR-001` |

Area codes for functional requirements:

| Code | Surface |
| --- | --- |
| `CHAT` | Chat and sessions |
| `FILE` | Files |
| `TERM` | Terminal |
| `MEM` | Memory |
| `SKILL` | Skills |
| `JOB` | Scheduled jobs |
| `DASH` | Dashboard |
| `OPS` | Operations and Agent View |
| `COND` | Conductor |
| `SWARM` | Swarm control plane |
| `MCP` | MCP |
| `SET` | Settings and providers |
| `PLAT` | Install, desktop, PWA, hosting |

Priority is `P0` (release blocker for the stated baseline), `P1` (required for the next milestone), or `P2` (later). Status is `Shipped`, `In progress`, or `Planned`.

## Lifecycle

1. Open a feature PRD, or edit the product baseline, from the matching template.
2. Fill problem, scope, and acceptance before solution detail.
3. Give every P0 requirement an ID, a priority, a status, and a testable acceptance line.
4. Record decisions in section 19. Leave unresolved items in Open questions.
5. Link the implementation PR to the requirement IDs it satisfies.
6. When behavior ships, change status to `Shipped` in the product baseline. Do not delete the requirement.

## What stays outside a PRD

- Implementation plans and task breakdowns live with the change, not in this folder.
- Swarm role contracts stay in `docs/swarm/` and `swarm.yaml`.
- HermesWorld gameplay specs stay in `docs/hermesworld/`.
- One-off tool analyses stay in `docs/requirements/`.

## Related docs

- [Hermes Workspace PRD](./hermes-workspace.md)
- [Product template](./TEMPLATE.md)
- [Feature template](./FEATURE-TEMPLATE.md)
- [Swarm mode](../swarm/README.md)
- [Features inventory](../../FEATURES-INVENTORY.md)
- [Security policy](../../SECURITY.md)
