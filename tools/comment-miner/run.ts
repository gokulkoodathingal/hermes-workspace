import { readFileSync, writeFileSync } from 'node:fs'
import { mineComments } from './mine.ts'
import { parseComments } from './parse.ts'

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  if (index < 0) return undefined
  return process.argv[index + 1]
}

async function main() {
  const inputPath = arg('--input')
  if (!inputPath) {
    console.error(
      'Usage: node --experimental-strip-types tools/comment-miner/run.ts --input comments.json [--product Name] [--audience Who] [--out brief.md] [--engine auto|heuristic|jev]',
    )
    process.exit(1)
  }
  const raw = readFileSync(inputPath, 'utf8')
  const parsed = parseComments(raw, inputPath)
  const engineArg = arg('--engine') ?? 'auto'
  if (
    engineArg !== 'auto' &&
    engineArg !== 'heuristic' &&
    engineArg !== 'jev'
  ) {
    throw new Error('--engine must be auto, heuristic, or jev')
  }
  const result = await mineComments(parsed.comments, {
    product: arg('--product') ?? parsed.product ?? 'This product',
    audience: arg('--audience') ?? parsed.audience ?? 'customers and prospects',
    engine: engineArg,
  })
  const outPath = arg('--out')
  if (outPath) writeFileSync(outPath, result.markdown)
  process.stdout.write(result.markdown)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
})
