import { laneLabel } from './decide.ts'
import type { Decision } from './types.ts'

export type RadarBoard = {
  radar: Array<Decision>
  later: Array<Decision>
  skipped: Array<Decision>
}

export function board(decisions: Array<Decision>, limit: number): RadarBoard {
  const skipped = decisions.filter((item) => item.action === 'skip')
  const kept = decisions
    .filter((item) => item.action === 'keep')
    .sort((a, b) => b.leverage - a.leverage || a.id.localeCompare(b.id))
  return {
    radar: kept.slice(0, limit),
    later: kept.slice(limit),
    skipped,
  }
}

function block(item: Decision, index: number): string {
  const lanes = item.lanes.map((lane) => laneLabel(lane)).join(', ')
  const link = item.url ? item.url : item.source
  return `### ${index}. ${item.title}

- Signal: ${item.title}
- Note: ${item.text}
- Why it matters: ${item.why}
- Source: ${item.source} · ${link}
- Lane: ${lanes}
- Move: ${item.move}`
}

export function renderRadar(input: {
  operator: string
  engine: string
  generatedAt: string
  board: RadarBoard
}): string {
  const { operator, engine, generatedAt, board: ranked } = input
  const today =
    ranked.radar.length === 0
      ? '_Nothing cleared the bar. Widen the source list or lower the hype gate._'
      : ranked.radar.map((item, index) => block(item, index + 1)).join('\n\n')
  const later =
    ranked.later.length === 0
      ? '_None._'
      : ranked.later
          .map(
            (item) =>
              `- ${item.title} (${item.lanes.map((lane) => laneLabel(lane)).join(', ')})`,
          )
          .join('\n')
  const skipped =
    ranked.skipped.length === 0
      ? '_None._'
      : ranked.skipped.map((item) => `- ${item.title}`).join('\n')
  return `# Research radar

${generatedAt} · ${operator} · judgments: ${engine}

${ranked.radar.length} for today. ${ranked.later.length} can wait. ${ranked.skipped.length} skipped.

## Today

${today}

## Later

${later}

## Skipped

${skipped}
`
}
