import { board, renderRadar } from './aggregate.ts'
import { decide } from './decide.ts'
import { judgeHeuristic } from './heuristic.ts'
import { judgeWithJev } from './jev.ts'
import type { Decision, EngineName, RadarItem, RadarOptions } from './types.ts'

export type RadarResult = {
  engine: EngineName
  operator: string
  generatedAt: string
  decisions: Array<Decision>
  markdown: string
}

export async function buildRadar(
  items: Array<RadarItem>,
  options: RadarOptions,
): Promise<RadarResult> {
  const engine: EngineName =
    options.engine === 'auto'
      ? options.apiKey || process.env.TYPESAFE_API_KEY
        ? 'jev'
        : 'heuristic'
      : options.engine
  const decisions: Array<Decision> = []
  for (const item of items) {
    const judgment =
      engine === 'jev'
        ? await judgeWithJev(item, options)
        : judgeHeuristic(item)
    decisions.push(decide(item, judgment))
  }
  const generatedAt = options.generatedAt ?? new Date().toISOString()
  const ranked = board(decisions, options.limit)
  return {
    engine,
    operator: options.operator,
    generatedAt,
    decisions,
    markdown: renderRadar({
      operator: options.operator,
      engine,
      generatedAt,
      board: ranked,
    }),
  }
}
