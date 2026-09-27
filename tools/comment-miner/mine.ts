import { renderBrief, summarize } from './aggregate.ts'
import { decide } from './decide.ts'
import { judgeHeuristic, namedCompetitors } from './heuristic.ts'
import { judgeWithJev } from './jev.ts'
import type {
  CommentInput,
  Decision,
  EngineName,
  MineOptions,
} from './types.ts'

export type MineResult = {
  engine: EngineName
  product: string
  audience: string
  generatedAt: string
  decisions: Array<Decision>
  markdown: string
}

async function judgeOne(
  comment: CommentInput,
  options: MineOptions,
  engine: EngineName,
) {
  if (engine === 'jev') return judgeWithJev(comment, options)
  return judgeHeuristic(comment)
}

export async function mineComments(
  comments: Array<CommentInput>,
  options: MineOptions,
): Promise<MineResult> {
  const engine: EngineName =
    options.engine === 'auto'
      ? options.apiKey || process.env.TYPESAFE_API_KEY
        ? 'jev'
        : 'heuristic'
      : options.engine
  const decisions: Array<Decision> = []
  for (const comment of comments) {
    const judgment = await judgeOne(comment, options, engine)
    decisions.push(decide(comment, judgment, namedCompetitors(comment.text)))
  }
  const generatedAt = options.generatedAt ?? new Date().toISOString()
  const summary = summarize(decisions)
  return {
    engine,
    product: options.product,
    audience: options.audience,
    generatedAt,
    decisions,
    markdown: renderBrief({
      product: options.product,
      audience: options.audience,
      engine,
      generatedAt,
      summary,
    }),
  }
}
