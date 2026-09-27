# High-Quality Prompt Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, validate, and locally install a general-purpose Cursor skill plus standalone meta-prompt that produce one high-quality prompt from user input.

**Architecture:** The committed skill and standalone prompt live together under `skills/generating-high-quality-prompts/`. A structural Vitest suite protects their metadata and output contracts. A local Cursor plugin uses default skill discovery and links to the committed skill directory, avoiding duplicate source files.

**Tech Stack:** Markdown, YAML frontmatter, JSON, Vitest, Node.js filesystem APIs, Cursor local plugins.

## Global Constraints

- Ask no more than three focused clarification questions, and only when critical information is missing.
- Produce exactly one polished, ready-to-copy prompt.
- Adapt prompt sections and length to the request instead of using a fixed large template.
- Do not execute the generated prompt or invent unsupported requirements.
- Keep `/workspace/skills/generating-high-quality-prompts/` as the source of truth.
- Install the local plugin at `~/.cursor/plugins/local/high-quality-prompt-generator/`.

---

### Task 1: Establish Behavioral Baselines

**Files:**
- Create: `/opt/cursor/artifacts/prompt-generator-baseline.md`

**Interfaces:**
- Consumes: Five fixed user requests covering vague, complete, creative, analytical, and constraint-heavy tasks.
- Produces: Recorded no-guidance outputs and a list of observed failures used to shape the skill.

- [ ] **Step 1: Run five fresh no-guidance samples**

Use one fresh general-purpose subagent for each request:

1. `Make me a prompt for marketing.`
2. `Create a prompt that asks an AI to summarize the supplied quarterly report for executives in five bullets, preserving all stated figures and flagging missing data.`
3. `I need a prompt for writing a short science-fiction story.`
4. `Write a prompt for comparing three CRM platforms using pricing, integrations, security, migration effort, and support quality. Require a markdown decision matrix and evidence citations.`
5. `Generate a prompt for revising a privacy policy. It must preserve defined terms, use plain English, identify legally uncertain claims, avoid legal conclusions, and return a change log after the revised policy.`

Each subagent receives only its request and this instruction:

```text
Act as a prompt generator. Respond to the user's request as you naturally would.
```

- [ ] **Step 2: Record outputs and classify failures**

Write `/opt/cursor/artifacts/prompt-generator-baseline.md` with each request, complete output, and observed failures under these categories:

- unnecessary or missing clarification
- invented assumptions
- generic or bloated structure
- missing output contract
- multiple prompt variants
- execution of the requested task instead of prompt generation

- [ ] **Step 3: Confirm the baseline exposes at least one target failure**

Run:

```bash
test -s /opt/cursor/artifacts/prompt-generator-baseline.md
```

Expected: exit code `0`, with at least one concrete behavior for the skill to correct.

---

### Task 2: Add Failing Structural Tests

**Files:**
- Create: `skills/generating-high-quality-prompts/skill.test.ts`

**Interfaces:**
- Consumes: The file and behavior contracts in the approved design.
- Produces: A Vitest suite that fails while `SKILL.md` and `standalone-prompt.md` are absent.

- [ ] **Step 1: Create the contract test**

Create `skills/generating-high-quality-prompts/skill.test.ts`:

```ts
import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const skillUrl = new URL('./SKILL.md', import.meta.url)
const standaloneUrl = new URL('./standalone-prompt.md', import.meta.url)

describe('high-quality prompt generator artifacts', () => {
  it('declares discoverable skill frontmatter', async () => {
    const skill = await readFile(skillUrl, 'utf8')

    expect(skill).toMatch(/^---\nname: generating-high-quality-prompts\n/)
    expect(skill).toMatch(
      /\ndescription: Use when [^\n]+(?:create|write|rewrite|improve|optimize)[^\n]*prompts?/i,
    )
  })

  it.each([
    ['skill', skillUrl],
    ['standalone prompt', standaloneUrl],
  ])('%s enforces the clarification and output contracts', async (_name, url) => {
    const contents = await readFile(url, 'utf8')

    expect(contents).toMatch(/up to three|maximum of three/i)
    expect(contents).toMatch(/critical (?:information|details|context)/i)
    expect(contents).toMatch(/exactly one|one ready-to-copy/i)
    expect(contents).toMatch(/fenced code block/i)
    expect(contents).toMatch(/do not execute|never execute/i)
    expect(contents).toMatch(/invent(?:ed|ing)? (?:facts|requirements|details|constraints)/i)
  })

  it('keeps the standalone prompt independent of Cursor and Hermes', async () => {
    const prompt = await readFile(standaloneUrl, 'utf8')

    expect(prompt).not.toMatch(/\bCursor\b|\bHermes\b/)
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm vitest run skills/generating-high-quality-prompts/skill.test.ts
```

Expected: FAIL because `SKILL.md` and `standalone-prompt.md` do not exist.

- [ ] **Step 3: Commit the failing test**

```bash
git add skills/generating-high-quality-prompts/skill.test.ts
git commit -m "test: define prompt generator contracts"
git push -u origin cursor/prompt-generator-skill-e1a6
```

---

### Task 3: Implement the Skill and Standalone Prompt

**Files:**
- Create: `skills/generating-high-quality-prompts/SKILL.md`
- Create: `skills/generating-high-quality-prompts/standalone-prompt.md`
- Modify: `skills/generating-high-quality-prompts/skill.test.ts` only if baseline evidence reveals a missing structural contract.

**Interfaces:**
- Consumes: User requests and optional answers to focused clarification questions.
- Produces: Either up to three focused questions or exactly one prompt in a fenced code block.

- [ ] **Step 1: Write minimal guidance from baseline evidence**

Implement both artifacts with this shared sequence:

1. Extract outcome, audience, context, inputs, constraints, output format, and success criteria when relevant.
2. Decide whether missing information can materially change the prompt.
3. Ask up to three concise questions only for critical missing information.
4. If the user asks to proceed, state minimal assumptions and continue.
5. Build only the relevant prompt sections: role, objective, context, inputs, requirements, process, output format, and quality checks.
6. Silently check specificity, completeness, consistency, concision, and factual grounding.
7. Return exactly one prompt in a fenced code block without executing it.

The skill frontmatter must be:

```yaml
---
name: generating-high-quality-prompts
description: Use when users ask to create, write, rewrite, improve, optimize, or engineer a prompt for a general-purpose task.
---
```

The standalone file must begin with:

```text
You are a prompt generator. Transform the user's request into exactly one polished, ready-to-copy prompt for another AI.
```

Include one complete example showing a vague request, focused clarification, a user answer, and one final prompt. Keep both artifacts concise and behaviorally equivalent.

- [ ] **Step 2: Run the focused tests and verify GREEN**

Run:

```bash
pnpm vitest run skills/generating-high-quality-prompts/skill.test.ts
```

Expected: all prompt-generator contract tests pass.

- [ ] **Step 3: Run formatting validation**

Run:

```bash
pnpm prettier --check skills/generating-high-quality-prompts docs/superpowers
```

Expected: all checked files use repository formatting.

- [ ] **Step 4: Commit the implementation**

```bash
git add skills/generating-high-quality-prompts docs/superpowers
git commit -m "feat: add high-quality prompt generator skill"
git push -u origin cursor/prompt-generator-skill-e1a6
```

---

### Task 4: Verify Behavior and Refine

**Files:**
- Create: `/opt/cursor/artifacts/prompt-generator-validation.md`
- Modify: `skills/generating-high-quality-prompts/SKILL.md` when a guided run violates the contract.
- Modify: `skills/generating-high-quality-prompts/standalone-prompt.md` to preserve behavioral equivalence after refinements.

**Interfaces:**
- Consumes: The five requests from Task 1 plus the implemented skill.
- Produces: Guided outputs, contract verdicts, and any minimal wording refinements.

- [ ] **Step 1: Run five fresh skill-guided samples**

Dispatch one fresh general-purpose subagent per Task 1 request. Instruct each subagent to read and follow `skills/generating-high-quality-prompts/SKILL.md` before responding.

- [ ] **Step 2: Score every guided result**

For each result, record pass or fail for:

- asks questions only when information is critical
- asks no more than three questions
- preserves all user constraints
- avoids invented facts and requirements
- returns exactly one prompt when context is sufficient
- uses a fenced code block
- does not execute the generated prompt
- adapts detail to task complexity

Save the full evidence to `/opt/cursor/artifacts/prompt-generator-validation.md`.

- [ ] **Step 3: Refine and re-run failed scenarios**

For each failure, add the smallest positive instruction that defines the correct output shape. Keep `SKILL.md` and `standalone-prompt.md` behaviorally aligned, then re-run the failed scenario with a fresh subagent until it passes.

- [ ] **Step 4: Re-run automated checks**

Run:

```bash
pnpm vitest run skills/generating-high-quality-prompts/skill.test.ts
pnpm prettier --check skills/generating-high-quality-prompts docs/superpowers
```

Expected: both commands pass with no errors.

- [ ] **Step 5: Commit refinements**

```bash
git add skills/generating-high-quality-prompts
git commit -m "refine: tighten prompt generator behavior"
git push -u origin cursor/prompt-generator-skill-e1a6
```

Skip this commit when validation requires no repository changes.

---

### Task 5: Install the Local Cursor Plugin

**Files:**
- Create: `/home/ubuntu/.cursor/plugins/local/high-quality-prompt-generator/.cursor-plugin/plugin.json`
- Create: `/home/ubuntu/.cursor/plugins/local/high-quality-prompt-generator/README.md`
- Create: `/home/ubuntu/.cursor/plugins/local/high-quality-prompt-generator/LICENSE`
- Create symlink: `/home/ubuntu/.cursor/plugins/local/high-quality-prompt-generator/skills/generating-high-quality-prompts`

**Interfaces:**
- Consumes: `/workspace/skills/generating-high-quality-prompts/`.
- Produces: A locally discoverable Cursor plugin named `high-quality-prompt-generator`.

- [ ] **Step 1: Create the local plugin directories**

```bash
mkdir -p /home/ubuntu/.cursor/plugins/local/high-quality-prompt-generator/{.cursor-plugin,skills}
```

- [ ] **Step 2: Write the manifest**

Write `.cursor-plugin/plugin.json`:

```json
{
  "name": "high-quality-prompt-generator",
  "displayName": "High-Quality Prompt Generator",
  "version": "1.0.0",
  "description": "Creates one polished, ready-to-copy prompt from a user's general-purpose request.",
  "author": {
    "name": "Gokul"
  },
  "license": "MIT",
  "keywords": [
    "prompt-generation",
    "prompt-engineering",
    "writing"
  ],
  "skills": "./skills/"
}
```

- [ ] **Step 3: Add plugin documentation and license**

`README.md` states that the plugin creates one adaptive prompt, is invoked by asking Cursor to create or improve a prompt, and requires **Developer: Reload Window** after installation.

`LICENSE` contains the standard MIT license text with copyright year `2026` and holder `Gokul`.

- [ ] **Step 4: Link the repository skill**

```bash
ln -s /workspace/skills/generating-high-quality-prompts \
  /home/ubuntu/.cursor/plugins/local/high-quality-prompt-generator/skills/generating-high-quality-prompts
```

- [ ] **Step 5: Validate the installed plugin**

Run:

```bash
node -e "const fs=require('fs'); const p='/home/ubuntu/.cursor/plugins/local/high-quality-prompt-generator'; const m=JSON.parse(fs.readFileSync(p+'/.cursor-plugin/plugin.json','utf8')); if(m.name!=='high-quality-prompt-generator'||m.skills!=='./skills/'||!fs.realpathSync(p+'/skills/generating-high-quality-prompts').startsWith('/workspace/skills/generating-high-quality-prompts')) process.exit(1)"
```

Expected: exit code `0`.

- [ ] **Step 6: Record installation evidence**

Append the validated manifest, resolved skill path, and reload instruction to `/opt/cursor/artifacts/prompt-generator-validation.md`.

---

### Task 6: Final Repository Verification

**Files:**
- Verify: all committed files on `cursor/prompt-generator-skill-e1a6`

**Interfaces:**
- Consumes: The complete repository implementation and local installation.
- Produces: Final test evidence, clean Git status, and an updated pull request.

- [ ] **Step 1: Run targeted and repository checks**

Check setup completion first, then run:

```bash
pnpm vitest run skills/generating-high-quality-prompts/skill.test.ts
pnpm prettier --check skills/generating-high-quality-prompts docs/superpowers
git diff --check
```

Expected: all commands pass.

- [ ] **Step 2: Inspect repository state**

```bash
git status --short --branch
git log -3 --oneline
```

Expected: clean working tree on `cursor/prompt-generator-skill-e1a6` with implementation commits pushed.

- [ ] **Step 3: Update the pull request**

Update the existing draft pull request summary with the implemented skill, standalone prompt, behavioral validation, structural tests, and local installation result.
