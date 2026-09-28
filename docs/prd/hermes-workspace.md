# Hermes Workspace — Product Requirements

Living product baseline. Section order matches [TEMPLATE.md](./TEMPLATE.md). Requirement IDs follow [README.md](./README.md).

## 1. Document control

| Field | Value |
| --- | --- |
| Product | Hermes Workspace |
| PRD status | Living |
| PRD version | 1.0 |
| Product baseline | 2.3.0, plus in-progress Conductor and desktop work recorded in the README roadmap |
| Owner | Product |
| Updated | 2026-09-28 |
| Related docs | [README](../../README.md), [features inventory](../../FEATURES-INVENTORY.md), [swarm](../swarm/README.md), [security](../../SECURITY.md) |

### Revision history

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-09-28 | Initial product baseline taken from the shipped workspace, swarm contract, and public roadmap |

## 2. Executive summary

Hermes Workspace is the local command center for [Hermes Agent](https://github.com/NousResearch/hermes-agent). An operator chats with agents, edits files, runs a terminal, curates memory and skills, and directs a role-based swarm from one interface.

The workspace runs on vanilla Hermes Agent. It does not fork the agent. Chat, sessions, memory, skills, jobs, MCP, terminal, dashboard, Agent View, and Operations talk to the stock gateway and dashboard. Conductor uses the dashboard mission API when that API is present and falls back to Workspace-native swarm dispatch when it is not.

This PRD records the product those surfaces must deliver at the 2.3.0 baseline, the journeys they support, and the later milestones already named in the public roadmap: a native desktop app, a hosted offering, and team collaboration.

## 3. Problem

### 3.1 Current situation

Hermes Agent already runs a gateway, a dashboard, sessions, skills, jobs, and MCP. Operators who want a daily surface still assemble chat, files, memory, terminal, and multi-agent control from separate tools. Swarm work adds another layer: persistent workers, role routing, checkpoints, and a human gate for risky actions.

### 3.2 Pain

| Pain | Who feels it | Evidence |
| --- | --- | --- |
| Agent work is spread across a gateway, a dashboard, a shell, and an editor | Solo operator, self-hoster | README positions the workspace as the single command center for chat, files, memory, skills, and terminal |
| Multi-agent runs need a person to route every task | Swarm operator | Swarm contract: one orchestrator translates intent into dispatch so a human is not the router (`docs/swarm/README.md`) |
| Missing upstream endpoints fail mid-action | All primary personas | Capability gates are a shipped product rule: features that need an upstream endpoint show a placeholder |
| A custom agent fork drifts from upstream | Self-hoster, contributor | v2.0.0 zero-fork release: clone and run on vanilla `hermes-agent` |
| Local and OpenAI-compatible models need the same session surface as hosted models | Local-model operator | README local-model path and changelog: local sessions persist in history |

### 3.3 Why now

Hermes Agent is installable as an upstream product. The workspace can sit on that install instead of carrying a private fork. Swarm mode is already specified as a control plane with roles, checkpoints, and a greenlight gate. The PRD freezes that baseline so feature work can trace to it.

## 4. Vision and product principles

### 4.1 Vision

An operator states an outcome once. The workspace routes it to the right Hermes Agent, keeps the work visible, and asks for a human decision only when the action is irreversible or externally visible.

### 4.2 Principles

| # | Principle | What it requires in the product |
| --- | --- | --- |
| 1 | One operating surface | Chat, files, memory, skills, jobs, terminal, dashboard, operations, and swarm control are reachable in the same app |
| 2 | Zero-fork | The workspace runs against vanilla Hermes Agent endpoints. Missing endpoints degrade through capability gates |
| 3 | Dispatch is a system | Swarm tasks travel as a SwarmBrief to a named role with a checkpoint contract |
| 4 | Judgment stays human | The Greenlight Gate holds irreversible or externally visible actions for approval |
| 5 | Local control | Default install is on a machine the operator controls, including Docker, a user service, PWA, and Tailscale |
| 6 | Evidence over status theater | Workers report proof-bearing checkpoints. The operator can open the worker runtime, files, or terminal |

## 5. Goals and non-goals

### 5.1 Goals

| ID | Goal | Baseline this serves |
| --- | --- | --- |
| G1 | An operator can install the workspace, attach it to a running Hermes Agent, and complete a chat | 2.3.0 |
| G2 | An operator can manage sessions, files, memory, skills, jobs, MCP, and a terminal without leaving the workspace | 2.3.0 |
| G3 | An operator can see swarm workers, dispatch role-based work, and review checkpoints from the control plane | 2.3.0 swarm |
| G4 | Risky or externally visible actions wait for explicit human approval | 2.3.0 |
| G5 | The same UI remains usable when an optional upstream endpoint is missing | 2.3.0 |
| G6 | The workspace can be installed as a desktop app | Native desktop milestone |
| G7 | More than one person can share a hosted workspace | Team collaboration milestone |

### 5.2 Non-goals

| ID | Non-goal | Where it lives instead |
| --- | --- | --- |
| NG1 | Replacing Hermes Agent, its gateway, or its model runtime | Upstream `NousResearch/hermes-agent` |
| NG2 | Maintaining a private fork of the agent as a requirement for core chat, sessions, memory, skills, jobs, MCP, or terminal | Zero-fork decision, changelog 2.0.0 |
| NG3 | Multi-tenant team collaboration in the 2.3.0 baseline | README roadmap, "Coming" |
| NG4 | A hosted cloud control plane in the 2.3.0 baseline | README roadmap, "Coming" |
| NG5 | HermesWorld game systems, lore, and live-ops | `docs/hermesworld/` |
| NG6 | Making the operator the manual router for every swarm task | Swarm contract |

## 6. Success metrics

Numeric targets are `TBD` until the workspace records these signals. Definitions are the contract.

| Metric | Definition | Target | Instrumentation |
| --- | --- | --- | --- |
| Time to first chat | Elapsed time from a documented install path to a completed assistant turn | TBD | Not instrumented |
| Pairing health | Share of boots where gateway `:8642`, dashboard `:9119`, and workspace sessions API all respond | TBD | Partial: health curls documented in README |
| Session resume rate | Share of existing sessions that reopen with prior history intact | TBD | Not instrumented |
| Capability-gate clarity | Share of missing-upstream attempts that show a placeholder instead of a mid-action failure | 100% of gated features | Product behavior; no aggregate metric |
| Checkpoint coverage | Share of swarm dispatches that end in a proof-bearing checkpoint or an explicit blocker | TBD | Not instrumented |
| Greenlight latency | Time from a held action to an approve or reject decision | TBD | Not instrumented |
| Unattended repair rate | Share of known swarm failures handled by the repair playbook before human escalation | TBD | Not instrumented |

Guardrail metrics:

| Guardrail | Definition | Limit |
| --- | --- | --- |
| Secret exposure | API keys, gateway tokens, or credential fields rendered to the client | Zero |
| Path escape | File or memory operations that resolve outside the allowed root | Zero |
| Duplicate gateway | Extra gateway processes started while `/api/sessions` already returns data | Zero in the documented pairing flow |
| Fork requirement | Core surfaces that require a patched Hermes Agent | Zero |

## 7. Users and jobs to be done

### 7.1 Personas

| Persona | Context | Success looks like |
| --- | --- | --- |
| Solo operator | Runs Hermes Agent locally and uses the workspace as the daily UI | One app for chat, files, memory, skills, and terminal |
| Swarm operator | Directs persistent role workers. The swarm narrative in `docs/swarm/README.md` names this seat as the person talking to Aurora | Intent becomes a routed mission, checkpoints land in Reports or Inbox, and only judgment calls wait for approval |
| Self-hoster | Uses Docker Compose, a user service, PWA, or Tailscale | The stack comes up on a machine they control and stays reachable on their network |
| Local-model operator | Uses Ollama, LM Studio, vLLM, Atomic Chat, or another OpenAI-compatible endpoint | Local sessions stream, persist, and appear in history |
| Contributor | Ships workspace changes against vanilla Hermes Agent | A change can be tested with gateway plus dashboard plus `pnpm dev` |

### 7.2 Jobs

| Job | Persona | Situation | Desired outcome |
| --- | --- | --- | --- |
| J1 | Solo operator | Starting or resuming work | A session streams a reply and stays in history |
| J2 | Solo operator | The answer depends on the repo | Files and a terminal are available beside the conversation |
| J3 | Solo operator | The agent should remember or gain a skill | Memory and skills can be browsed and updated in the workspace |
| J4 | Swarm operator | Work spans roles | The orchestrator routes a SwarmBrief, workers checkpoint, and the inbox shows what needs a person |
| J5 | Swarm operator | A worker looks stuck or unsafe | The operator can inspect runtime state and approve or stop the action |
| J6 | Self-hoster | Installing on a home lab or server | Docker or the documented attach path reaches a working UI |
| J7 | Local-model operator | Choosing a configured model | The selected local model is the one that answers, and the session persists |
| J8 | Contributor | Verifying a change | One gateway and one dashboard are enough; the UI probes them instead of spawning a second gateway |

### 7.3 Primary vs secondary

- Primary: solo operator, swarm operator, self-hoster.
- Secondary: local-model operator, contributor.
- Out of audience for this baseline: teams that need shared tenants, SSO, and a hosted control plane. That audience is G7.

## 8. Scope

### 8.1 In scope

| Item | Priority | Status | Notes |
| --- | --- | --- | --- |
| Chat with SSE streaming, sessions, and tool-call rendering | P0 | Shipped | README, features inventory |
| Files browser and Monaco editing, sandboxed to the workspace | P0 | Shipped | |
| Cross-platform PTY terminal | P0 | Shipped | |
| Memory browser and editor | P0 | Shipped | Local filesystem first |
| Skills browser, marketplace, and risk display | P0 | Shipped | |
| Scheduled jobs | P0 | Shipped | |
| Dashboard overview | P0 | Shipped | Sessions, model mix, cost ledger |
| Operations and Agent View | P0 | Shipped | |
| MCP catalog, marketplace, and sources, with config CRUD fallback | P0 | Shipped | |
| Settings and provider selection | P0 | Shipped | Configured providers only |
| Swarm control plane: orchestrator chat, workers, kanban, reports, inbox, runtime view | P0 | Shipped | `docs/swarm/` |
| Themes, PWA, Tailscale access | P1 | Shipped | |
| Capability gates for optional upstream endpoints | P0 | Shipped | |
| Conductor missions | P1 | In progress | UI shipped; dashboard mission API or native-swarm fallback |
| Native desktop app (Electron) | P1 | In progress | PWA path works today |
| Auth, CSP, path guards, exec approval | P0 | Shipped | `SECURITY.md` |
| Docker Compose and attach-to-existing-agent install | P0 | Shipped | |
| Cloud / hosted workspace | P2 | Planned | README roadmap |
| Team collaboration | P2 | Planned | Depends on hosted multi-tenant work |

### 8.2 Out of scope

| Item | Reason |
| --- | --- |
| Hermes Agent runtime internals | Upstream product |
| HermesWorld gameplay | Separate spec tree under `docs/hermesworld/` |
| Plugin enablement that is not recorded in `swarm.yaml` | Operating rule in `AGENTS.md` |
| A second gateway when sessions already respond | Pairing rule |

### 8.3 Assumptions

| ID | Assumption | If wrong |
| --- | --- | --- |
| A1 | The operator can run Hermes Agent gateway on a reachable host, typically `:8642`, with `API_SERVER_ENABLED=true` | Install and chat requirements fail closed with a visible connection state |
| A2 | Zero-fork installs also run `hermes dashboard` on `:9119` for config, sessions, skills, and jobs | Those surfaces show capability gates or the documented setup error |
| A3 | `API_SERVER_KEY`, when set, is copied to `HERMES_API_TOKEN` | Authenticated gateway calls fail until the token matches |
| A4 | Node.js 22 or newer is available for source installs | Contributor and `pnpm dev` paths are unsupported |
| A5 | Default model `gpt-5.4` / `openai-codex` has a live local Codex login when that model is selected | Chat cannot complete until `codex login` succeeds |

## 9. User journeys

### HW-JR-001 — First local chat

- Persona: solo operator
- Trigger: the operator wants a working workspace on a machine that may already run Hermes Agent
- Preconditions: Node.js 22+ for the source path, or Docker for the compose path

| Step | User action | System response | Requirement IDs |
| --- | --- | --- | --- |
| 1 | Install or clone, configure `.env`, start gateway, dashboard, and workspace | UI loads on port 3000 | `HW-FR-PLAT-001` |
| 2 | Open Chat | Empty state explains how to start; connection state reflects gateway health | `HW-FR-CHAT-001`, `HW-UX-001` |
| 3 | Send a message | Tokens stream over SSE, tool calls render as they arrive, the turn is stored on the session | `HW-FR-CHAT-002` |
| 4 | Leave and return | The session is listed and reopens with history | `HW-FR-CHAT-003` |

- Done when: the same session shows the user turn and the completed assistant turn after a reload.
- Failure the product must absorb: gateway down → the connection state stays visible and the composer does not pretend the turn succeeded.

### HW-JR-002 — Work in the repo

- Persona: solo operator
- Trigger: the task needs code or command output
- Preconditions: a workspace root is configured

| Step | User action | System response | Requirement IDs |
| --- | --- | --- | --- |
| 1 | Open Files | Tree is limited to the workspace root and skips ignored directories | `HW-FR-FILE-001`, `HW-SEC-002` |
| 2 | Open a file | Monaco loads the contents; save writes back to that path | `HW-FR-FILE-002` |
| 3 | Open Terminal | A PTY session streams output; resize and input work | `HW-FR-TERM-001` |

- Done when: a file edit and a shell command are both visible in the workspace.
- Failure the product must absorb: a path outside the root is rejected.

### HW-JR-003 — Dispatch a swarm mission

- Persona: swarm operator
- Trigger: an outcome needs more than one role
- Preconditions: swarm profiles exist for the roles in `swarm.yaml`

| Step | User action | System response | Requirement IDs |
| --- | --- | --- | --- |
| 1 | Ask the orchestrator for an outcome | Intent becomes one or more SwarmBriefs routed to role workers | `HW-FR-SWARM-001` |
| 2 | Watch the control plane | Each worker shows role, state, task, and recent signal | `HW-FR-SWARM-002` |
| 3 | Open the task board | The mission appears in backlog, ready, running, review, blocked, or done | `HW-FR-SWARM-003` |
| 4 | Read Reports and Inbox | Checkpoints, blockers, and items that need a person are listed | `HW-FR-SWARM-004` |
| 5 | Approve a held action | Greenlight releases that action and withholds unapproved ones | `HW-FR-SWARM-005`, `HW-SEC-004` |

- Done when: the mission has a checkpoint the operator can review, or an explicit blocker in the inbox.
- Failure the product must absorb: tmux is unavailable → runtime view falls back to a shell or log stream (`HW-FR-SWARM-006`).

### HW-JR-004 — Use a local model

- Persona: local-model operator
- Trigger: the operator selects a configured local or OpenAI-compatible provider
- Preconditions: the provider is configured in Hermes and reachable from the gateway

| Step | User action | System response | Requirement IDs |
| --- | --- | --- | --- |
| 1 | Open the model picker | Only configured providers and models are listed | `HW-FR-SET-001` |
| 2 | Select a local model and send a message | The turn uses that model | `HW-FR-CHAT-004` |
| 3 | Reload history | The local session remains in the session list | `HW-FR-CHAT-003` |

- Done when: the session list contains the local session and a later turn still uses the selected model.
- Failure the product must absorb: Codex-backed default model without `codex login` → chat reports the auth gap instead of silently switching models.

## 10. Information architecture

### 10.1 Surfaces

| Surface | Route or entry | Job it serves |
| --- | --- | --- |
| Chat | `/chat`, `/chat/$sessionKey` | J1, J7 |
| Dashboard | `/dashboard` | J5, pairing and cost overview |
| Files | `/files` | J2 |
| Terminal | `/terminal` | J2 |
| Memory | `/memory` | J3 |
| Skills | `/skills` | J3 |
| Jobs | `/jobs` | standing automation beside J4 |
| MCP | `/mcp` | tool sources for J1 and J4 |
| Settings | `/settings`, `/settings/providers` | J6, J7 |
| Operations | `/operations` | J5 |
| Conductor | `/conductor` | J4 |
| Swarm control plane | Swarm surfaces in the workspace shell | J4, J5 |
| Agent View | panel inside chat | J5 |

### 10.2 Objects

| Object | Owner | Lifetime | Notes |
| --- | --- | --- | --- |
| Session | Gateway, or local store for portable and local sessions | Until the operator deletes it | Tombstones clean up deleted sessions |
| Memory file | `HERMES_HOME` filesystem | Until edited or removed | `MEMORY.md` and dated memory files |
| Skill | Hermes skills registry plus installed set | Until uninstalled | Marketplace entries carry a risk level |
| Job | Dashboard jobs API | Until deleted | Cron-style schedule, pause, and resume |
| Swarm worker | Hermes profile plus tmux or fallback runtime | Across tasks until stopped | Role, profile, mission, checkpoint |
| SwarmBrief | Orchestrator | For the dispatch | Canonical task shape |
| Checkpoint | Worker | For the mission record | Proof-bearing status |
| Mission | Conductor via dashboard API or native swarm | Until completed or cancelled | Fallback mode is `native-swarm` |

## 11. Functional requirements

### 11.1 Chat

Intent: a session streams, renders tools, and survives reload.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-CHAT-001` | The product shall open a chat surface with session create, rename, delete, pin, search, and fork | P0 | Shipped | Given the workspace is paired, when the operator uses each session action, then the session list matches that action after reload |
| `HW-FR-CHAT-002` | The product shall stream assistant output over SSE and render tool calls, reasoning, and markdown in the transcript | P0 | Shipped | Given a live gateway, when the operator sends a message that invokes a tool, then text and the tool pill appear before the turn completes |
| `HW-FR-CHAT-003` | The product shall persist sessions, including local-model sessions, and restore them from history | P0 | Shipped | Given a completed local or gateway turn, when the operator reloads, then that session is listed and its transcript is intact |
| `HW-FR-CHAT-004` | The product shall send the turn to the model the operator selected, including configured local and OpenAI-compatible providers | P0 | Shipped | Given a configured local model, when the operator selects it and sends a message, then the request is routed to that model |
| `HW-FR-CHAT-005` | The product shall support slash commands for new, clear, model, save, skills, skin, and help from the composer | P1 | Shipped | Given focus in the composer, when the operator opens the slash menu, then those commands are available |
| `HW-FR-CHAT-006` | The product shall accept image attachments and voice input on the composer | P1 | Shipped | Given a supported browser, when the operator attaches an image or starts voice input, then the composer holds that input for the next send |
| `HW-FR-CHAT-007` | The product shall show context consumption and warn as the session approaches the token limit | P1 | Shipped | Given a session with known token usage, when usage crosses the warning threshold, then the context alert is visible |

### 11.2 Files

Intent: the operator can read and edit the workspace without escaping it.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-FILE-001` | The product shall browse the workspace tree with configurable depth and entry caps, skipping dependency and VCS directories | P0 | Shipped | Given a repo with `node_modules` and `.git`, when Files loads, then those directories are omitted and the tree stays within the cap |
| `HW-FR-FILE-002` | The product shall open, edit, save, create, rename, delete, upload, and mkdir inside the workspace root | P0 | Shipped | Given a file inside the root, when the operator saves an edit, then the file on disk matches the editor buffer |
| `HW-FR-FILE-003` | The product shall preview images and other readable files inline | P1 | Shipped | Given an image in the workspace, when the operator opens it, then the preview renders |

### 11.3 Terminal

Intent: a real shell session is available in the UI.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-TERM-001` | The product shall attach a PTY, stream output, accept input, and honor resize | P0 | Shipped | Given the terminal page, when the operator runs a command and resizes the panel, then output streams and the shell dimensions follow the panel |
| `HW-FR-TERM-002` | The product shall default to zsh on macOS, bash on Linux, and PowerShell on Windows | P1 | Shipped | Given each platform, when a new terminal starts with no shell override, then that default shell starts |
| `HW-FR-TERM-003` | The product shall keep the terminal usable from a touch device | P2 | Shipped | Given a mobile viewport, when the operator opens Terminal, then an input path for touch is available |

### 11.4 Memory

Intent: agent memory is browsable and editable from the local Hermes home.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-MEM-001` | The product shall list memory files from `HERMES_HOME`, with `MEMORY.md` first and daily files ordered by date | P0 | Shipped | Given memory files on disk, when Memory opens, then the list matches those files and does not require the gateway |
| `HW-FR-MEM-002` | The product shall search memory text and return line-level hits up to a bounded result count | P1 | Shipped | Given a known phrase in a memory file, when the operator searches it, then the hit includes that line |
| `HW-FR-MEM-003` | The product shall edit markdown memory files and preview the rendered result | P0 | Shipped | Given `MEMORY.md`, when the operator saves a new line, then the file on disk contains that line |

### 11.5 Skills

Intent: the operator can find, inspect, and install skills with a visible risk signal.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-SKILL-001` | The product shall browse installed, marketplace, and featured skills with search, category, and sort | P0 | Shipped | Given the skills index, when the operator filters by category and query, then the list narrows to matches |
| `HW-FR-SKILL-002` | The product shall show a security risk level for marketplace skills before install | P0 | Shipped | Given a marketplace skill, when the operator opens it, then a risk level is visible before install |
| `HW-FR-SKILL-003` | The product shall install and remove skills for the active Hermes home | P0 | Shipped | Given an installable skill, when the operator installs it, then it appears under Installed |

### 11.6 Jobs

Intent: scheduled agent work can be created and inspected.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-JOB-001` | The product shall create, edit, delete, pause, resume, and trigger jobs with schedule, prompt, delivery, and skill fields | P0 | Shipped | Given the jobs API, when the operator pauses a job, then the job no longer shows an imminent run until resumed |
| `HW-FR-JOB-002` | The product shall show last run, next run, and job output | P1 | Shipped | Given a triggered job, when the operator opens output, then the latest execution result is visible |

### 11.7 Dashboard, Operations, and Agent View

Intent: the operator can see cost, sessions, and live agents.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-DASH-001` | The product shall show an overview of sessions, model mix, cost, and items that need attention | P0 | Shipped | Given paired services with session data, when Dashboard opens, then those summaries render |
| `HW-FR-OPS-001` | The product shall list agents with role and model, and shall pause, steer, and stop a live agent | P0 | Shipped | Given a live agent, when the operator stops it from Operations, then the agent leaves the running set |
| `HW-FR-OPS-002` | The product shall mark profiles that still need setup | P1 | Shipped | Given a preset profile without required config, when Operations lists it, then the row shows that setup is still required |
| `HW-FR-OPS-003` | The product shall show the active agent in chat with queue, history, and usage | P1 | Shipped | Given an active chat agent, when Agent View is open, then queue and usage are visible |

### 11.8 Conductor

Intent: missions can be dispatched even when the dashboard mission API is missing.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-COND-001` | The product shall dispatch and decompose missions from Conductor | P1 | In progress | Given Conductor is available, when the operator starts a mission, then workers and live output are visible |
| `HW-FR-COND-002` | The product shall use the dashboard mission API when it exists | P1 | In progress | Given a dashboard that exposes missions, when a mission starts, then the dashboard API receives it |
| `HW-FR-COND-003` | The product shall fall back to Workspace-native swarm dispatch (`native-swarm`) when the dashboard mission API is absent | P0 | Shipped | Given a dashboard without the mission endpoint, when the operator dispatches, then the mission runs through swarm dispatch and the UI stays on the zero-fork path |

### 11.9 Swarm

Intent: role workers execute under an orchestrator, with checkpoints and a human gate.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-SWARM-001` | The product shall let the orchestrator turn an operator request into a SwarmBrief routed to a role worker | P0 | Shipped | Given orchestrator and builder profiles, when the operator asks for an implementation task, then a builder brief is created |
| `HW-FR-SWARM-002` | The product shall show each worker's role, state, current task, model, and recent signal | P0 | Shipped | Given a running worker, when the control plane is open, then those fields are visible |
| `HW-FR-SWARM-003` | The product shall track mission cards across backlog, ready, running, review, blocked, and done | P0 | Shipped | Given a dispatched card, when its state changes, then the board shows it in the matching lane |
| `HW-FR-SWARM-004` | The product shall surface checkpoints, blockers, handoffs, and review requests in Reports and Inbox | P0 | Shipped | Given a worker checkpoint that needs review, when Inbox is open, then that item is present |
| `HW-FR-SWARM-005` | The product shall hold irreversible or externally visible actions at the Greenlight Gate until a person approves them | P0 | Shipped | Given a held action, when it is unapproved, then it does not run; when approved, then that action proceeds |
| `HW-FR-SWARM-006` | The product shall attach to a tmux-backed worker and fall back to a shell or log stream when tmux is unavailable | P1 | Shipped | Given tmux is absent, when the operator opens runtime view, then a live shell or log stream is shown |
| `HW-FR-SWARM-007` | The product shall start role workers from presets aligned with `swarm.yaml` | P0 | Shipped | Given Add Swarm, when the operator picks a preset, then the worker starts with that role's default mission shape |
| `HW-FR-SWARM-008` | The product shall apply the repair playbook to known failures before escalating to a person | P1 | Shipped | Given a mapped failure, when it occurs, then the playbook repair runs or the inbox receives an escalation |

### 11.10 MCP and settings

Intent: tools and providers are configurable without exposing secrets.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-MCP-001` | The product shall manage MCP catalog, marketplace, and sources, and fall back to local config CRUD when the full page cannot load | P0 | Shipped | Given MCP config on disk, when the MCP page cannot reach the catalog, then local entries can still be created and edited |
| `HW-FR-SET-001` | The product shall list models from the gateway's configured providers | P0 | Shipped | Given a subset of providers in Hermes config, when the picker opens, then unconfigured providers are absent |
| `HW-FR-SET-002` | The product shall apply theme and workspace preferences from Settings | P1 | Shipped | Given a theme change, when the operator reloads, then the selected theme persists |

### 11.11 Platform

Intent: the documented install paths reach the same product.

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-FR-PLAT-001` | The product shall be installable by Docker Compose, the one-line installer, or attach-to-existing-agent | P0 | Shipped | Given each documented path and a healthy gateway, when the operator opens port 3000, then the shell loads |
| `HW-FR-PLAT-002` | The product shall install as a PWA and remain usable over Tailscale | P1 | Shipped | Given a Tailscale address, when the operator installs the PWA, then chat loads from that origin |
| `HW-FR-PLAT-003` | The product shall ship a native desktop shell that starts the required local services | P1 | In progress | Given the Electron app, when the operator launches it, then gateway, dashboard, and workspace are running or the app reports which one failed |
| `HW-FR-PLAT-004` | The product shall offer a hosted multi-user deployment | P2 | Planned | Given a hosted workspace, when two accounts sign in, then each sees only their tenant's sessions |

## 12. Experience requirements

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-UX-001` | The product shall show connection state for the gateway and dashboard on surfaces that depend on them | P0 | Shipped | Given a stopped gateway, when Chat is open, then the UI shows offline and does not render a fake completed turn |
| `HW-UX-002` | The product shall show a capability-gate placeholder when a feature's upstream endpoint is missing | P0 | Shipped | Given Conductor or another gated feature without its endpoint, when the operator opens it, then a placeholder explains the gap |
| `HW-UX-003` | The product shall provide an empty state for chat, sessions, jobs, and swarm lanes that tells the operator the next action | P1 | Shipped | Given no sessions, when Chat opens, then the empty state offers a way to start |
| `HW-UX-004` | The product shall keep primary navigation usable at mobile widths and in the installed PWA | P1 | Shipped | Given a narrow viewport, when the operator opens Chat, Files, and Settings, then each surface is reachable and its primary action is usable |
| `HW-UX-005` | The product shall support the documented theme set in light and dark | P2 | Shipped | Given Settings, when the operator selects Hermes, Nous, Bronze, Slate, or Mono, then the shell repaints in that theme |
| `HW-UX-006` | The product shall keep destructive confirms distinct from routine actions | P1 | Shipped | Given session delete or agent stop, when the operator invokes it, then a confirm is required before the action runs |

## 13. Non-functional requirements

| ID | Class | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- | --- |
| `HW-NFR-001` | Compatibility | The product shall run the source install on Node.js 22 or newer | P0 | Shipped | Given Node 22, when `pnpm dev` starts, then the workspace serves the shell |
| `HW-NFR-002` | Compatibility | The product shall treat vanilla Hermes Agent as the supported agent runtime for core surfaces | P0 | Shipped | Given upstream gateway and dashboard, when core surfaces load, then they operate through documented endpoints |
| `HW-NFR-003` | Reliability | The product shall treat one gateway and one dashboard as the canonical local pair | P0 | Shipped | Given `/api/sessions` already returns data, when the operator refreshes, then the UI reprobes instead of instructing a second gateway start |
| `HW-NFR-004` | Reliability | The product shall survive a dropped SSE stream by preserving the transcript already received and exposing a reconnect path | P1 | Shipped | Given a stream that drops mid-turn, when the operator reloads the session, then prior messages remain |
| `HW-NFR-005` | Performance | The product shall cap file-tree depth and entry count so a large repo cannot lock the files page | P1 | Shipped | Given a tree over the cap, when Files loads, then the listing stops at the configured maximum |
| `HW-NFR-006` | Operability | The product shall be runnable as a user-level service after `pnpm build` | P1 | Shipped | Given `scripts/install-dashboard-service.sh`, when it completes, then the workspace listens without an open terminal |
| `HW-NFR-007` | Accessibility | The product shall expose names for primary navigation, composer send, and dialog actions | P1 | In progress | Given keyboard-only use, when the operator tabs through the shell, then those controls are reachable and named |
| `HW-NFR-008` | Compatibility | The product shall keep Windows install and spawn behavior working for the desktop shell, including `cmd /c` spawn and `%TEMP%` logs | P1 | Shipped | Given Windows, when Electron starts a service, then spawn uses `cmd /c` and logs land under the user temp directory |

## 14. System context and dependencies

### 14.1 Context

```text
Operator
  -> Hermes Workspace (:3000, PWA, or Electron)
       -> Hermes gateway (:8642) for agent API, models, and streaming
       -> Hermes dashboard (:9119) for config, sessions, skills, jobs, and missions
       -> local filesystem (workspace root, HERMES_HOME, terminal PTY)
       -> optional local model server (Ollama, LM Studio, vLLM, Atomic Chat)
  Swarm path:
  Operator -> orchestrator -> role workers (tmux or fallback) -> checkpoints -> inbox
```

Runtime configuration uses `CLAUDE_API_URL`, `CLAUDE_API_TOKEN`, and `CLAUDE_DASHBOARD_URL`. Setup docs also accept `HERMES_API_URL`, `HERMES_API_TOKEN`, and `HERMES_DASHBOARD_URL`.

### 14.2 Dependencies

| Dependency | What we need from it | If it is absent |
| --- | --- | --- |
| Hermes gateway | Health, models, chat streaming, API server enabled | Chat and model picker show offline. Workspace does not spawn a replacement gateway when sessions already respond |
| Hermes dashboard | Config, sessions, skills, jobs, optional missions | Matching surfaces gate. Conductor uses `native-swarm` when missions are missing |
| Codex CLI login | Auth for the default `gpt-5.4` / `openai-codex` model | That model cannot chat until `codex login` succeeds |
| tmux | Persistent swarm worker sessions | Runtime view falls back to shell or log tail |
| Local model server | OpenAI-compatible completions for local routing | Local-model journeys fail with a connection error for that provider |
| Docker | Compose install path | Source and attach paths remain available |

### 14.3 Compatibility

| Constraint | Requirement |
| --- | --- |
| Hermes Agent | Vanilla install. Workspace 2.x targets the zero-fork endpoints introduced for `hermes-agent` 0.10.0+ |
| Node.js | `>=22` for source, desktop, and contributor flows |
| OS | macOS, Linux, and Windows. Shell and spawn defaults differ by platform |
| Browser | Current Chromium, Firefox, and Safari for the web shell. PWA install is Chromium-first |
| Network | Default bind is loopback. Remote bind fails closed unless explicitly configured. Tailscale is the supported remote path |

## 15. Data, privacy, and security

### 15.1 Data inventory

| Data | Where it lives | Leaves the machine? | Notes |
| --- | --- | --- | --- |
| Chat transcripts | Gateway session store, or local session store for portable mode | Only if the selected model provider is remote | Local models stay on the configured model host |
| Memory markdown | `HERMES_HOME` | No, unless the operator syncs that directory | Memory reads are local-filesystem first |
| Workspace files | Workspace root | No | Writes are confined to the root |
| Skills | Hermes skills directories | Install may download from a marketplace | Risk level is shown before install |
| API tokens and provider keys | Server environment and Hermes config | No | Responses redact credentials. Client bundles do not receive raw provider keys |
| Terminal I/O | PTY process and the browser stream | No | High-risk routes are rate limited |
| Swarm checkpoints | Worker reports and inbox | No | May quote command output; treat as local operator data |
| Cost and usage | Dashboard aggregates | No | Shown in Dashboard and Agent View |

### 15.2 Security requirements

| ID | Requirement | Priority | Status | Acceptance |
| --- | --- | --- | --- | --- |
| `HW-SEC-001` | The product shall authenticate API routes and compare session tokens in constant time | P0 | Shipped | Given a request without a valid session, when it hits a private API route, then the route refuses it |
| `HW-SEC-002` | The product shall reject file and memory paths that resolve outside the allowed root | P0 | Shipped | Given a `..` or absolute path outside the root, when Files or Memory is asked to open it, then the request is rejected |
| `HW-SEC-003` | The product shall redact credentials from config responses and keep provider tokens on the server | P0 | Shipped | Given a stored API key, when the client fetches config, then the key value is absent |
| `HW-SEC-004` | The product shall require an explicit in-UI approval before a sensitive exec runs | P0 | Shipped | Given a sensitive exec request, when the operator has not approved it, then the command does not run |
| `HW-SEC-005` | The product shall restrict browser CORS to the workspace origin and lock browser-proxy and screenshot routes to that origin | P0 | Shipped | Given a cross-origin browser call, when it targets those routes, then it is refused |
| `HW-SEC-006` | The product shall rate limit terminal input, terminal stream, restart, and update-check routes | P1 | Shipped | Given more than the configured limit per minute from one IP, when the next call arrives, then it is rejected |
| `HW-SEC-007` | The product shall scan marketplace skills for suspicious patterns and show the result before install | P0 | Shipped | Given a flagged skill, when the operator views it, then the risk flags are visible before install |
| `HW-SEC-008` | The product shall fail closed when asked to bind beyond loopback without an explicit remote configuration | P0 | Shipped | Given a non-loopback bind without that configuration, when the server starts, then it refuses the bind |

Disclosure and supported-version policy live in [SECURITY.md](../../SECURITY.md).

### 15.3 Abuse and safety boundaries

| Action class | Product behavior |
| --- | --- |
| Read local files, memory, and session history | Allowed inside the sandbox for an authenticated operator |
| Edit workspace files and memory markdown | Allowed inside the sandbox. Memory writes stay on markdown files |
| Shell commands in the workspace terminal | Allowed for the authenticated operator, with rate limits on the terminal routes |
| Sensitive agent exec | Held for in-UI approval |
| Swarm actions that are irreversible or externally visible | Held at the Greenlight Gate |
| Installing a marketplace skill | Allowed after the risk scan is shown |

## 16. Analytics and operational signals

The baseline is local-first. Product analytics are operator-visible health, not a third-party telemetry sink.

| Signal | Question it answers | Source | PII rule |
| --- | --- | --- | --- |
| Gateway `/health` | Is the agent API up? | Gateway | No transcript bodies |
| Dashboard `/api/status` | Is the dashboard API up? | Dashboard | No tokens |
| Workspace `/api/sessions` | Is the pair already serving sessions? | Workspace | Session metadata only in the operator's own UI |
| Connection banner | Should the operator refresh instead of starting another gateway? | Workspace UI | No secrets |
| Context meter | Is this session near its token limit? | Chat | Counts, not message text in logs |
| Job last-run status | Did the schedule succeed? | Jobs API | Prompt text stays in the job record, not in a remote metric |
| Checkpoint state | Did the worker finish, block, or request review? | Swarm reports | Command output stays in the local report |
| Cost ledger | What did sessions spend? | Dashboard | Aggregates in the local dashboard |

## 17. Release, rollout, and acceptance

### 17.1 Milestones

| Milestone | User-visible outcome | Exit criteria |
| --- | --- | --- |
| 1.0 foundation | Chat, files, memory, skills, terminal, dashboard, settings | Historical. Shipped 2026-04-10 |
| 2.0 zero-fork | Core surfaces run on vanilla Hermes Agent. Conductor and Operations exist | Shipped 2026-04-20. `HW-NFR-002`, `HW-FR-COND-003` |
| 2.3 current baseline | Swarm control plane, MCP, PWA, themes, capability gates, multi-provider chat | P0 rows marked Shipped in this PRD |
| Desktop | Electron launches the three local services | `HW-FR-PLAT-003` Shipped |
| Hosted + teams | Shared tenant workspace | `HW-FR-PLAT-004` Shipped, with new security requirements before launch |

### 17.2 Rollout

| Stage | Audience | Entry | Exit / rollback |
| --- | --- | --- | --- |
| Local default | Operators on the documented install paths | Merge to `main` and the published image | Revert the release commit or pin the previous image tag |
| Desktop | Operators who want a windowed app | Electron milestone accepted | PWA and browser paths remain the supported fallback |
| Hosted | Invited tenants | Separate threat model accepted | Feature stays off in the local baseline |

### 17.3 Release acceptance

The 2.3.0 baseline is accepted when every in-scope P0 row marked Shipped still passes the acceptance line below.

| Check | Owner | Evidence |
| --- | --- | --- |
| Gateway, dashboard, and sessions health | Operator | `curl` the three health URLs in the README attach section |
| Chat stream and reload | QA | HW-JR-001 on a paired stack |
| File sandbox reject | QA | Request a path outside the workspace root and confirm rejection |
| Local model session persistence | QA | HW-JR-004 against a configured local provider |
| Swarm checkpoint or blocker | QA | HW-JR-003 with orchestrator and one role worker |
| Missing mission API | QA | Dispatch Conductor with the mission endpoint absent and confirm `native-swarm` |
| Credential redaction | Reviewer | Config response contains no raw provider key |

## 18. Risks and mitigations

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| R1 | Upstream Hermes endpoints move and core surfaces break | Med | High | Zero-fork contract, capability gates, pairing health checks | Maintainer |
| R2 | Operators start a second gateway because the UI still says offline | Med | Med | `HW-NFR-003`: reprobe when sessions already return data | Product |
| R3 | A swarm worker takes an external action without approval | Low | High | Greenlight Gate and exec approval (`HW-FR-SWARM-005`, `HW-SEC-004`) | Orchestrator role |
| R4 | Marketplace skill content is hostile | Med | High | Risk scan and display before install (`HW-SEC-007`) | Skills |
| R5 | File APIs escape the workspace root | Low | High | Path guard on file and memory routes (`HW-SEC-002`) | Security |
| R6 | Conductor's two backends diverge | Med | Med | `HW-FR-COND-002` and `HW-FR-COND-003` name both paths. Feature PRDs must say which path they change | Builder |
| R7 | Hosted multi-tenant work reuses local-trust assumptions | Med | High | G7 stays planned until a new security section is accepted | Product |
| R8 | Desktop spawn differences on Windows regress service start | Med | Med | `HW-NFR-008` locks `cmd /c` and temp log paths | Desktop |

## 19. Open questions and decisions

### 19.1 Open questions

| ID | Question | Needed before | Owner |
| --- | --- | --- | --- |
| Q1 | Which numeric targets replace the TBD cells in section 6? | The first instrumented release | Product |
| Q2 | Does Conductor stay dual-backend, or become native-swarm only? | Conductor milestone exit | Product |
| Q3 | What tenant, auth, and data-isolation model does the hosted offering use? | Any hosted implementation | Product |
| Q4 | Which accessibility bar closes `HW-NFR-007` (keyboard only, or a named WCAG target)? | Desktop milestone | Product |
| Q5 | Should HermesWorld be a workspace surface with its own feature PRDs, or remain a separate spec tree? | Any HermesWorld scheduling inside this repo | Product |

### 19.2 Decisions

| ID | Decision | Date | Consequence |
| --- | --- | --- | --- |
| D1 | Zero-fork. Core workspace runs on vanilla Hermes Agent | 2026-04-20 | No private gateway fork is required for the P0 surfaces |
| D2 | One gateway on `:8642` and one dashboard on `:9119` are the canonical local pair | 2026-06-01 | Offline UI reprobes before anyone starts a second gateway |
| D3 | Conductor falls back to `native-swarm` when the dashboard mission API is absent | Recorded in README for issue 262 | Feature work must name the backend it touches |
| D4 | Greenlight Gate is the human boundary for irreversible or externally visible swarm actions | Swarm v1 contract | Those actions are P0 requirements, not conventions |
| D5 | Cloud hosting and team collaboration are later milestones | README roadmap | They are P2 in this baseline |

## 20. Traceability

| Requirement | Journey | Metric | Test or doc |
| --- | --- | --- | --- |
| `HW-FR-CHAT-002` | HW-JR-001 | Time to first chat | README chat surface; features inventory §1.1 |
| `HW-FR-CHAT-003` | HW-JR-001, HW-JR-004 | Session resume rate | Changelog: local-model session persistence |
| `HW-FR-FILE-001` | HW-JR-002 | Path escape guardrail | Features inventory §1.3 |
| `HW-FR-SWARM-001` | HW-JR-003 | Checkpoint coverage | `docs/swarm/README.md` |
| `HW-FR-SWARM-005` | HW-JR-003 | Greenlight latency | `docs/swarm/README.md` Greenlight Gate |
| `HW-FR-COND-003` | HW-JR-003 | Capability-gate clarity | README Conductor note, issue 262 |
| `HW-SEC-002` | HW-JR-002 | Path escape guardrail | `SECURITY.md` path traversal |
| `HW-SEC-003` | — | Secret exposure guardrail | `SECURITY.md` credential redaction |
| `HW-NFR-003` | HW-JR-001 | Duplicate gateway guardrail | README pairing rule |
| `HW-FR-PLAT-004` | — | TBD hosted metric | README roadmap |

Feature PRDs add rows here when they introduce requirements.

## 21. Appendix

### 21.1 Glossary

| Term | Meaning |
| --- | --- |
| Hermes Agent | The upstream agent runtime this workspace attaches to |
| Gateway | Hermes API server, default `:8642` |
| Dashboard | Hermes dashboard API, default `:9119`, used for config, sessions, skills, jobs, and missions |
| Workspace | This product's UI and its own API, default `:3000` |
| Zero-fork | Running on stock Hermes Agent endpoints |
| Capability gate | A placeholder shown when an optional upstream endpoint is missing |
| SwarmBrief | The task shape the orchestrator sends to a worker |
| Checkpoint | The proof-bearing status a worker returns |
| Greenlight Gate | Human approval for irreversible or externally visible actions |
| Native swarm | Conductor's fallback dispatch mode when the dashboard mission API is absent |
| HERMES_HOME | The local Hermes directory that holds memory and related agent state |

### 21.2 Related documents

- [PRD index](./README.md)
- [Product template](./TEMPLATE.md)
- [Feature template](./FEATURE-TEMPLATE.md)
- [README](../../README.md)
- [Features inventory](../../FEATURES-INVENTORY.md)
- [Future features](../../FUTURE-FEATURES.md)
- [Swarm mode](../swarm/README.md)
- [Swarm roles](../swarm/ROLES.md)
- [Security policy](../../SECURITY.md)
- [Changelog](../../CHANGELOG.md)

### 21.3 How to change this baseline

1. Add a feature PRD from [FEATURE-TEMPLATE.md](./FEATURE-TEMPLATE.md) for any new behavior.
2. Add new requirement rows with the next free ID. Do not renumber shipped IDs.
3. When the behavior ships, set status to `Shipped` and link the test in section 20.
4. Record the decision in section 19.2 if it changes a non-goal, a dependency, or a milestone.
