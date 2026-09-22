# On-Page SEO Auditor

The auditor is a small, server-side LangChain agent for reviewing one public HTML page.
It produces JSON that is useful in a terminal, CI job, or a larger agent workflow.

## What it checks

The deterministic layer always runs and does not require credentials. It checks:

- document language, title presence/count/length, and meta description length;
- canonical and viewport metadata;
- primary and secondary heading counts;
- approximate visible word count;
- missing image alternative text; and
- internal and external link counts.

Every finding includes severity, observed evidence, and a recommendation. The score is
a transparent prioritization aid based on those findings, not a search-ranking forecast.

The optional LangChain layer receives only compact page evidence plus deterministic
findings. It uses structured output to add search-intent interpretation, strengths, and
prioritized content opportunities. It is deliberately not used for facts that HTML rules
can determine reliably.

## Usage

Install dependencies, then run a deterministic audit:

```bash
pnpm install
pnpm seo:audit -- https://example.com/page --pretty
```

Public destinations are required by default. This prevents untrusted URLs and redirects
from reaching loopback, private-network, link-local, or cloud metadata addresses. For a
trusted local development page, opt in explicitly:

```bash
pnpm seo:audit -- http://127.0.0.1:3000/page --allow-private --pretty
```

Enable the LangChain analysis layer explicitly:

```bash
OPENAI_API_KEY=your-key \
SEO_AUDITOR_MODEL=gpt-4.1-mini \
pnpm seo:audit -- https://example.com/page --llm --pretty
```

Configuration:

| Variable            | Required          | Default        | Purpose                                 |
| ------------------- | ----------------- | -------------- | --------------------------------------- |
| `OPENAI_API_KEY`    | Only with `--llm` | none           | OpenAI or compatible API credential     |
| `SEO_AUDITOR_MODEL` | No                | `gpt-4.1-mini` | Chat model used for structured analysis |
| `OPENAI_BASE_URL`   | No                | OpenAI API     | OpenAI-compatible endpoint              |

Do not commit credentials. Deterministic mode is the default and never calls an LLM API.
The fetcher accepts only HTTP(S) HTML responses, validates resolved addresses and every
redirect target, pins each connection to its validated addresses to prevent DNS
rebinding, times out after 10 seconds, and stops reading response bodies once they exceed
2 MB.

## Output

The report is validated with Zod and has this stable top-level shape:

```json
{
  "url": "https://example.com/page",
  "requestedUrl": "https://example.com/page",
  "status": 200,
  "generatedAt": "2026-09-22T11:00:00.000Z",
  "analysisMode": "deterministic",
  "deterministic": {
    "score": 88,
    "metrics": {},
    "findings": []
  },
  "llmAnalysis": null
}
```

With `--llm`, `analysisMode` becomes `deterministic+llm` and `llmAnalysis` contains the
validated summary, inferred search intent, strengths, and prioritized opportunities.

## Development

Run focused, offline tests:

```bash
pnpm exec vitest run src/lib/seo-auditor
```

The ingestion tests inject `fetch`, and the orchestration tests inject an analyzer. No
test needs network access or an API key.
