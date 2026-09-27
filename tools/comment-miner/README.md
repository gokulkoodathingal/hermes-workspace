# Comment miner

Use case 2 from the Jev catalog: read a batch of comments and reviews, label each one, and write a voice-of-customer brief.

Jev, when you have a key, answers ten closed questions per comment and returns probabilities. This tool applies the gates in code. Spam is held. An unclear theme is set aside for you. A line becomes a quote candidate only when it is specific and the spam probability is low. The tool never publishes.

Without `TYPESAFE_API_KEY`, the same questions run through a local keyword heuristic so you can practice the rubric. The brief names which engine ran. The heuristic is a stand-in, not a model.

## Run the sample

```bash
pnpm comments:mine
```

That reads `tools/comment-miner/sample-comments.json` and prints a brief. The sample is synthetic.

## Run your own comments

Accepts JSON (`{ "product", "audience", "comments": [{ "id", "source", "text" }] }`), a JSON array, CSV with a `text` column, or a text file with one comment per blank line.

```bash
node --experimental-strip-types tools/comment-miner/run.ts \
  --input ./my-comments.json \
  --product "Client name" \
  --audience "in-house marketers" \
  --out ./brief.md
```

With a TypeSafe key, the same command calls `https://api.typesafe.ai/v1/systemone`:

```bash
export TYPESAFE_API_KEY="sk-..."
node --experimental-strip-types tools/comment-miner/run.ts --input ./my-comments.json --engine jev
```

`--engine auto` uses Jev when the key is set, and the heuristic otherwise.

## What to do with the brief

Keep the objections, the measured proof lines, and the questions. Ask before you quote anyone. Use a writing model only on the comments the brief kept.
