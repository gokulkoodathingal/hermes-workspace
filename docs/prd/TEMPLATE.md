# <Product or initiative name> — Product Requirements

> Copy this file. Keep every section. Replace angle-bracket prompts. Write `TBD` for unknowns. Do not delete a section to hide a gap.

## 1. Document control

| Field | Value |
| --- | --- |
| Product | `<name>` |
| PRD status | `Draft` \| `In review` \| `Accepted` \| `Living` |
| PRD version | `<x.y>` |
| Product baseline | `<release this PRD describes>` |
| Owner | `<role>` |
| Updated | `<YYYY-MM-DD>` |
| Related docs | `<links>` |

### Revision history

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | `<YYYY-MM-DD>` | Initial draft |

## 2. Executive summary

`<Three to six sentences. Who it is for, what outcome it creates, and which baseline this document describes.>`

## 3. Problem

### 3.1 Current situation

`<What people do today, with the tools they already have.>`

### 3.2 Pain

| Pain | Who feels it | Evidence |
| --- | --- | --- |
| `<pain>` | `<persona>` | `<observation, issue, or doc — or TBD>` |

### 3.3 Why now

`<What changed that makes this product or revision necessary.>`

## 4. Vision and product principles

### 4.1 Vision

`<One paragraph. The durable outcome, independent of a single release.>`

### 4.2 Principles

| # | Principle | What it requires in the product |
| --- | --- | --- |
| 1 | `<principle>` | `<concrete consequence>` |

## 5. Goals and non-goals

### 5.1 Goals

| ID | Goal | Baseline this serves |
| --- | --- | --- |
| G1 | `<outcome>` | `<release>` |

### 5.2 Non-goals

| ID | Non-goal | Where it lives instead |
| --- | --- | --- |
| NG1 | `<explicit exclusion>` | `<other doc, later milestone, or out of product>` |

## 6. Success metrics

Define the metric even when a baseline number does not exist yet. Mark instrumentation honestly.

| Metric | Definition | Target | Instrumentation |
| --- | --- | --- | --- |
| `<name>` | `<how it is counted>` | `<number or TBD>` | `Instrumented` \| `Not instrumented` |

Guardrail metrics (things that must not get worse):

| Guardrail | Definition | Limit |
| --- | --- | --- |
| `<name>` | `<how it is counted>` | `<limit or TBD>` |

## 7. Users and jobs to be done

### 7.1 Personas

| Persona | Context | Success looks like |
| --- | --- | --- |
| `<name>` | `<when they show up>` | `<observable outcome>` |

### 7.2 Jobs

| Job | Persona | Situation | Desired outcome |
| --- | --- | --- | --- |
| J1 | `<persona>` | `<when>` | `<so that>` |

### 7.3 Primary vs secondary

- Primary: `<personas this baseline optimizes for>`
- Secondary: `<personas who must still succeed>`
- Out of audience: `<who this product is not trying to serve>`

## 8. Scope

### 8.1 In scope

| Item | Priority | Status | Notes |
| --- | --- | --- | --- |
| `<capability>` | `P0` \| `P1` \| `P2` | `Shipped` \| `In progress` \| `Planned` | `<note>` |

### 8.2 Out of scope

| Item | Reason |
| --- | --- |
| `<capability>` | `<why it is excluded from this baseline>` |

### 8.3 Assumptions

| ID | Assumption | If wrong |
| --- | --- | --- |
| A1 | `<assumption>` | `<what we revisit>` |

## 9. User journeys

Write the path a person actually takes. One journey per primary job.

### HW-JR-001 — `<journey name>`

- Persona: `<persona>`
- Trigger: `<what starts it>`
- Preconditions: `<what must already be true>`

| Step | User action | System response | Requirement IDs |
| --- | --- | --- | --- |
| 1 | `<action>` | `<response>` | `<HW-FR-...>` |

- Done when: `<observable end state>`
- Failure the product must absorb: `<failure>` → `<expected behavior>`

## 10. Information architecture

### 10.1 Surfaces

| Surface | Route or entry | Job it serves |
| --- | --- | --- |
| `<name>` | `<route>` | `<job>` |

### 10.2 Objects

| Object | Owner | Lifetime | Notes |
| --- | --- | --- | --- |
| `<session, mission, worker, ...>` | `<system>` | `<lifetime>` | `<notes>` |

## 11. Functional requirements

Group by surface. Each row is testable. Acceptance is one sentence a QA pass can execute.

### 11.1 `<Surface>`

Intent: `<one sentence>`

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-<AREA>-001` | `<The product shall ...>` | `P0` | `Planned` | `<Given / When / Then, compressed to one line>` |

## 12. Experience requirements

Cross-surface behavior: empty states, errors, capability gates, language, density, and input methods.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-UX-001` | `<The product shall ...>` | `P0` | `Planned` | `<acceptance>` |

## 13. Non-functional requirements

Performance, reliability, compatibility, accessibility, and operability.

| ID | Class | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- | --- |
| `HW-NFR-001` | `<class>` | `<The product shall ...>` | `P0` | `Planned` | `<acceptance>` |

## 14. System context and dependencies

### 14.1 Context

```text
<actor> -> <this product> -> <upstream systems>
```

### 14.2 Dependencies

| Dependency | What we need from it | If it is absent |
| --- | --- | --- |
| `<system>` | `<contract>` | `<degraded behavior>` |

### 14.3 Compatibility

| Constraint | Requirement |
| --- | --- |
| `<runtime, OS, upstream version>` | `<constraint>` |

## 15. Data, privacy, and security

### 15.1 Data inventory

| Data | Where it lives | Leaves the machine? | Notes |
| --- | --- | --- | --- |
| `<class>` | `<store>` | `Yes` \| `No` \| `Only if the operator configures it` | `<notes>` |

### 15.2 Security requirements

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-SEC-001` | `<The product shall ...>` | `P0` | `Planned` | `<acceptance>` |

### 15.3 Abuse and safety boundaries

| Action class | Product behavior |
| --- | --- |
| `<reversible local action>` | `<behavior>` |
| `<irreversible or externally visible action>` | `<behavior>` |

## 16. Analytics and operational signals

| Signal | Question it answers | Source | PII rule |
| --- | --- | --- | --- |
| `<signal>` | `<question>` | `<log, health endpoint, UI>` | `<what must not be recorded>` |

## 17. Release, rollout, and acceptance

### 17.1 Milestones

| Milestone | User-visible outcome | Exit criteria |
| --- | --- | --- |
| `<name>` | `<outcome>` | `<which requirement IDs are Shipped>` |

### 17.2 Rollout

| Stage | Audience | Entry | Exit / rollback |
| --- | --- | --- | --- |
| `<stage>` | `<who>` | `<gate>` | `<rollback>` |

### 17.3 Release acceptance

The baseline is accepted when every in-scope `P0` row is `Shipped` and its acceptance line has been executed.

| Check | Owner | Evidence |
| --- | --- | --- |
| `<check>` | `<role>` | `<test, screenshot, or command>` |

## 18. Risks and mitigations

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| R1 | `<risk>` | `Low` \| `Med` \| `High` | `Low` \| `Med` \| `High` | `<mitigation>` | `<role>` |

## 19. Open questions and decisions

### 19.1 Open questions

| ID | Question | Needed before | Owner |
| --- | --- | --- | --- |
| Q1 | `<question>` | `<milestone>` | `<role>` |

### 19.2 Decisions

| ID | Decision | Date | Consequence |
| --- | --- | --- | --- |
| D1 | `<decision>` | `<YYYY-MM-DD>` | `<what it locks>` |

## 20. Traceability

| Requirement | Journey | Metric | Test or doc |
| --- | --- | --- | --- |
| `<HW-FR-...>` | `<HW-JR-...>` | `<metric name>` | `<link or TBD>` |

## 21. Appendix

### 21.1 Glossary

| Term | Meaning |
| --- | --- |
| `<term>` | `<meaning>` |

### 21.2 Related documents

- `<link>`

### 21.3 Writing rules

- Requirements use "shall".
- Each requirement has one behavior.
- Acceptance names the setup, the action, and the observable result.
- Status changes when behavior ships. IDs do not change.
- Unknowns stay as `TBD` in the matching section.
