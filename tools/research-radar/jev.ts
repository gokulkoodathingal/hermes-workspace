import { RADAR_QUESTIONS } from './questions.ts'
import type {
  Judgment,
  RadarAnswers,
  RadarItem,
  RadarOptions,
} from './types.ts'

const DEFAULT_URL = 'https://api.typesafe.ai/v1/systemone'
const DEFAULT_MODEL = 'jev-latest'

type JevResponse = {
  answers?: RadarAnswers
  usage?: { input_tokens?: number; output_tokens?: number }
}

function fieldType(record: Record<string, unknown>, key: string): unknown {
  const field = record[key]
  if (!field || typeof field !== 'object') return undefined
  return (field as Record<string, unknown>).type
}

function isAnswers(value: unknown): value is RadarAnswers {
  if (!value || typeof value !== 'object') return false
  const answers = value as Record<string, unknown>
  const hype = answers.is_hype
  const hypeProbability =
    hype && typeof hype === 'object'
      ? (hype as Record<string, unknown>).noul
      : undefined
  return (
    fieldType(answers, 'relevant_to_work') === 'noul' &&
    fieldType(answers, 'learn_ai') === 'noul' &&
    fieldType(answers, 'learn_security') === 'noul' &&
    fieldType(answers, 'learn_networking') === 'noul' &&
    fieldType(answers, 'worth_a_lesson') === 'score' &&
    fieldType(answers, 'time_to_use') === 'score' &&
    fieldType(answers, 'is_hype') === 'noul' &&
    typeof hypeProbability === 'number'
  )
}

export async function judgeWithJev(
  item: RadarItem,
  options: RadarOptions,
): Promise<Judgment> {
  const apiKey = options.apiKey ?? process.env.TYPESAFE_API_KEY
  if (!apiKey) {
    throw new Error(
      'TYPESAFE_API_KEY is missing. Run with the local heuristic or add a key from console.typesafe.ai.',
    )
  }
  const fetchImpl = options.fetchImpl ?? fetch
  const response = await fetchImpl(options.apiUrl ?? DEFAULT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model ?? DEFAULT_MODEL,
      state: {
        operator: options.operator,
        source: item.source,
        title: item.title,
        text: item.text,
        url: item.url,
      },
      questions: RADAR_QUESTIONS,
    }),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(
      `Jev request failed (${response.status}): ${detail.slice(0, 240)}`,
    )
  }
  const body = (await response.json()) as JevResponse
  if (!isAnswers(body.answers)) {
    throw new Error('Jev response did not include the expected radar answers.')
  }
  return {
    engine: 'jev',
    answers: body.answers,
    usage: {
      input_tokens: body.usage?.input_tokens ?? 0,
      output_tokens: body.usage?.output_tokens ?? 0,
    },
  }
}
