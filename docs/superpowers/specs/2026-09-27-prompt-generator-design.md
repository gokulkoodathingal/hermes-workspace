# High-Quality Prompt Generator Design

## Purpose

Create a reusable Hermes skill and a standalone copy-paste meta-prompt that turn a user's general-purpose request into one polished prompt. The generator should improve clarity and execution quality without inventing requirements or forcing every request into a large fixed template.

## Deliverables

1. `skills/generating-high-quality-prompts/SKILL.md`
   - Loads when a user asks to create, improve, rewrite, or optimize a prompt.
   - Defines the adaptive generation workflow, quality checks, and output contract.
2. `skills/generating-high-quality-prompts/standalone-prompt.md`
   - Contains a self-contained prompt that can be pasted into a capable language model.
   - Produces the same user-facing behavior without relying on the Hermes skill runtime.
3. A local Cursor plugin at `~/.cursor/plugins/local/high-quality-prompt-generator/`
   - Uses a valid `.cursor-plugin/plugin.json` manifest and default `skills/` discovery.
   - Links its discovered skill to the repository copy so there is one source of truth.
   - Includes local installation documentation and the MIT license.

## Behavior

The generator extracts the following information when it is relevant:

- desired outcome
- target audience or end user
- context and source material
- expected inputs
- constraints and exclusions
- output format
- success criteria

It distinguishes critical missing information from optional detail. If critical information is missing, it asks up to three focused questions before generating. Questions should be concise, easy to answer, and limited to details that can materially change the resulting prompt. If the user declines to answer or requests immediate output, the generator states minimal assumptions and proceeds.

When enough context is available, the generator returns exactly one ready-to-copy prompt in a fenced code block. It does not execute the generated prompt, produce multiple variants, or add commentary unless a brief assumption note is necessary.

## Prompt Construction

The generated prompt uses only the sections needed for the request. It may include:

1. Role or perspective
2. Objective
3. Relevant context and inputs
4. Requirements and constraints
5. Execution guidance
6. Output format
7. Quality criteria

The generator preserves concrete facts supplied by the user, replaces avoidable ambiguity with precise instructions, and avoids unsupported facts. User-provided values are embedded directly; reusable unknown values use clearly named placeholders.

Before returning the prompt, the generator silently checks that it is:

- specific about the intended result
- complete enough to execute
- internally consistent
- explicit about important constraints and output shape
- concise relative to task complexity
- free of invented requirements

## Boundaries and Failure Handling

- Potentially harmful or disallowed requests remain subject to the host model's safety rules.
- Contradictory requirements trigger one focused clarification instead of silent resolution.
- Requests that are already complete skip clarification.
- Requests outside the generator's knowledge should receive a prompt that instructs the executing model to verify uncertain facts rather than fabricate them.
- Formatting instructions are treated as requirements only when the user supplies them or the task clearly needs them.

## Validation Strategy

Skill development follows a RED-GREEN-REFACTOR process:

1. Run baseline agents without the skill on vague, detailed, creative, analytical, and constraint-heavy requests.
2. Record missing clarifications, invented assumptions, bloated templates, weak output contracts, and accidental task execution.
3. Author the minimum skill guidance that corrects observed failures.
4. Run the same scenarios with the skill and compare outputs against the contract.
5. Refine wording for any new failure mode and re-run the affected scenarios.

Repository checks will validate YAML frontmatter, required files, internal links, formatting, and the absence of unresolved placeholders. Test evidence will be saved under `/opt/cursor/artifacts/`.

## Cursor Installation

Cursor does not document a personal custom-skill upload flow in the account web dashboard. The supported local installation is a plugin under `~/.cursor/plugins/local/`; it becomes available in Cursor's Customize interface after a window reload or application restart. This local installation is specific to the current machine and does not publish the skill to a public or team marketplace.

The plugin uses a symbolic link from `~/.cursor/plugins/local/high-quality-prompt-generator/skills/generating-high-quality-prompts` to `/workspace/skills/generating-high-quality-prompts`. The link keeps the committed repository files authoritative while making the skill immediately discoverable by the local Cursor profile.

## Acceptance Criteria

- Both deliverables exist and are self-contained for their intended environments.
- The skill frontmatter uses a valid kebab-case name and a trigger-only description beginning with `Use when`.
- The local Cursor plugin manifest has a valid name and only relative component paths.
- The plugin's discovered skill resolves to the committed repository skill.
- Vague requests receive no more than three material clarification questions.
- Complete requests receive one prompt without unnecessary questioning.
- Final output contains one copy-ready prompt, not task results or multiple variants.
- The prompt adapts its structure and level of detail to the request.
- Skill-enabled validation scenarios satisfy the quality and output contracts.
