import { RADAR_QUESTIONS } from './questions.ts'
import type { Judgment, NoulAnswer, RadarItem, ScoreAnswer } from './types.ts'

const WORK = [
  /\bgoogle ads\b/i,
  /\bmeta ads\b/i,
  /\bmeta business\b/i,
  /\bga4\b/i,
  /\bsearch console\b/i,
  /\bconsent mode\b/i,
  /\battribution\b/i,
  /\bad policy\b/i,
  /\blanding page\b/i,
  /\bad account\b/i,
]

const AI = [
  /\bagentic\b/i,
  /\bagents?\b/i,
  /\bllm\b/i,
  /\bmodel card\b/i,
  /\bembedding\b/i,
  /\brag\b/i,
  /\bhugging face\b/i,
  /\btool use\b/i,
]

const SECURITY = [
  /\bphish/i,
  /\bimpersonat/i,
  /\bpassword\b/i,
  /\boauth\b/i,
  /\bad account\b/i,
  /\b2fa\b/i,
  /\bmfa\b/i,
  /\bconsent\b/i,
  /\bprivacy\b/i,
  /\bbrand safety\b/i,
]

const NETWORKING = [
  /\bdns\b/i,
  /\bspf\b/i,
  /\bdkim\b/i,
  /\bdmarc\b/i,
  /\bcdn\b/i,
  /\bredirects?\b/i,
  /\bnameserver\b/i,
  /\bsmtp\b/i,
  /\btracking domain\b/i,
]

const HYPE = [
  /\b10x\b/i,
  /\bovernight\b/i,
  /\bsecret hack\b/i,
  /\bguaranteed\b/i,
  /\byou won't believe\b/i,
]

function hits(text: string, patterns: Array<RegExp>): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

function noul(probability: number): NoulAnswer {
  return { type: 'noul', noul: probability }
}

function scoreAnswer(
  level: number,
  criteria: ReadonlyArray<string>,
): ScoreAnswer {
  const confidence = 0.74
  const probabilities = criteria.map((_, index) =>
    index === level ? confidence : (1 - confidence) / (criteria.length - 1),
  )
  const legend: Record<string, string> = {}
  criteria.forEach((label, index) => {
    legend[String(index)] = label
  })
  return { type: 'score', score: level, probabilities, confidence, legend }
}

/**
 * Same answer shape as Jev, so the gates stay put when a key is added.
 * Keyword hits are the practice field for the radar questions.
 */
export function judgeHeuristic(item: RadarItem): Judgment {
  const blob = `${item.title}\n${item.text}`
  const work = hits(blob, WORK)
  const learnAi = hits(blob, AI)
  const learnSecurity = hits(blob, SECURITY)
  const learnNetworking = hits(blob, NETWORKING)
  const hype = hits(blob, HYPE)
  let timeToUse = 0
  if (item.source === 'wikipedia')
    timeToUse = learnNetworking || learnAi ? 1 : 0
  else if (work) timeToUse = 3
  else if (learnAi || learnSecurity || learnNetworking) timeToUse = 2
  let lesson = 0
  if ((learnAi || learnSecurity || learnNetworking) && work) lesson = 3
  else if (learnAi || learnSecurity || learnNetworking) lesson = 2
  else if (work) lesson = 1

  return {
    engine: 'heuristic',
    usage: null,
    answers: {
      relevant_to_work: noul(work ? 0.9 : 0.08),
      learn_ai: noul(learnAi ? 0.9 : 0.08),
      learn_security: noul(learnSecurity ? 0.9 : 0.08),
      learn_networking: noul(learnNetworking ? 0.9 : 0.08),
      worth_a_lesson: scoreAnswer(
        lesson,
        RADAR_QUESTIONS.worth_a_lesson.criteria,
      ),
      time_to_use: scoreAnswer(timeToUse, RADAR_QUESTIONS.time_to_use.criteria),
      is_hype: noul(hype ? 0.92 : 0.1),
    },
  }
}
