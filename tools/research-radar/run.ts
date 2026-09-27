import { readFileSync, writeFileSync } from 'node:fs'
import { parseRadar } from './parse.ts'
import { buildRadar } from './radar.ts'

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  if (index < 0) return undefined
  return process.argv[index + 1]
}

const DEFAULT_OPERATOR =
  'Digital marketing specialist, 12 years, learning AI, agentic AI, cybersecurity, and networking'

async function main() {
  const inputPath = arg('--input')
  if (!inputPath) {
    console.error(
      'Usage: node --experimental-strip-types tools/research-radar/run.ts --input items.json [--limit 5] [--out radar.md] [--engine auto|heuristic|jev]',
    )
    process.exit(1)
  }
  const parsed = parseRadar(readFileSync(inputPath, 'utf8'))
  const engineArg = arg('--engine') ?? 'auto'
  if (
    engineArg !== 'auto' &&
    engineArg !== 'heuristic' &&
    engineArg !== 'jev'
  ) {
    throw new Error('--engine must be auto, heuristic, or jev')
  }
  const limitArg = Number(arg('--limit') ?? '5')
  const result = await buildRadar(parsed.items, {
    operator: arg('--operator') ?? parsed.operator ?? DEFAULT_OPERATOR,
    engine: engineArg,
    limit: Number.isFinite(limitArg) && limitArg > 0 ? limitArg : 5,
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
