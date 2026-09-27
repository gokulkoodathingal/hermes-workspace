# Research radar

Use case 1 from the Jev catalog: label a saved pile of videos, posts, docs, and repos, then keep five for today.

Each item is judged on four independent lanes: live marketing work, AI and agents, security awareness, and networking for delivery. Hype with no work consequence is skipped. The brief gives a signal, why it matters, the source, and one move.

Jev answers the questions when `TYPESAFE_API_KEY` is set. Otherwise a local keyword heuristic runs the same gates. The brief names the engine.

## Run the sample

```bash
pnpm radar
```

## Run a saved pile

JSON object with `items`: `id`, `source`, `title`, `text`, `url`. Sources: `youtube`, `blog`, `wikipedia`, `search`, `github`, `huggingface`, `social`, `comments`, `reviews`, `other`.

```bash
node --experimental-strip-types tools/research-radar/run.ts \
  --input ./saved.json \
  --limit 5 \
  --out ./radar.md
```

Paste titles and excerpts. The radar reads text. It does not watch video or open a login.
