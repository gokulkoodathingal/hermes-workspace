import { COMMENT_QUESTIONS } from './questions.ts'
import type {
  CommentAnswers,
  CommentInput,
  Judgment,
  MineOptions,
} from './types.ts'

const DEFAULT_URL = 'https://api.typesafe.ai/v1/systemone'
const DEFAULT_MODEL = 'jev-latest'

type JevResponse = {
  answers?: CommentAnswers
  usage?: { input_tokens?: number; output_tokens?: number }
}

function fieldType(record: Record<string, unknown>, key: string): unknown {
  const field = record[key]
  if (!field || typeof field !== 'object') return undefined
  return (field as Record<string, unknown>).type
}

function isAnswers(value: unknown): value is CommentAnswers {
  if (!value || typeof value !== 'object') return false
  const answers = value as Record<string, unknown>
  const spam = answers.is_spam
  const spamProbability =
    spam && typeof spam === 'object'
      ? (spam as Record<string, unknown>).noul
      : undefined
  return (
    fieldType(answers, 'theme') === 'choice' &&
    fieldType(answers, 'stance') === 'choice' &&
    fieldType(answers, 'buying_language') === 'score' &&
    fieldType(answers, 'quotability') === 'score' &&
    fieldType(answers, 'specificity') === 'score' &&
    fieldType(answers, 'is_spam') === 'noul' &&
    typeof spamProbability === 'number' &&
    fieldType(answers, 'states_objection') === 'noul' &&
    fieldType(answers, 'mentions_competitor') === 'noul' &&
    fieldType(answers, 'asks_for_recommendation') === 'noul' &&
    fieldType(answers, 'contains_proof') === 'noul'
  )
}

export async function judgeWithJev(
  comment: CommentInput,
  options: MineOptions,
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
        product: options.product,
        audience: options.audience,
        source: comment.source,
        comment: comment.text,
      },
      questions: COMMENT_QUESTIONS,
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
    throw new Error('Jev response did not include the expected answer fields.')
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
