export type SourceKind =
  | 'youtube'
  | 'blog'
  | 'wikipedia'
  | 'search'
  | 'github'
  | 'huggingface'
  | 'social'
  | 'comments'
  | 'reviews'
  | 'other'

export type EngineName = 'heuristic' | 'jev'

export type RadarLane =
  | 'work'
  | 'learn_ai'
  | 'learn_security'
  | 'learn_networking'

export type RadarItem = {
  id: string
  source: SourceKind
  title: string
  text: string
  url: string
  author: string
}

export type ChoiceAnswer = {
  type: 'choice'
  choice: string
  probabilities: Record<string, number>
  confidence: number
}

export type ScoreAnswer = {
  type: 'score'
  score: number
  probabilities: Array<number>
  confidence: number
  legend: Record<string, string>
}

export type NoulAnswer = {
  type: 'noul'
  noul: number
}

export type RadarAnswers = {
  relevant_to_work: NoulAnswer
  learn_ai: NoulAnswer
  learn_security: NoulAnswer
  learn_networking: NoulAnswer
  worth_a_lesson: ScoreAnswer
  time_to_use: ScoreAnswer
  is_hype: NoulAnswer
}

export type Judgment = {
  engine: EngineName
  answers: RadarAnswers
  usage: { input_tokens: number; output_tokens: number } | null
}

export type RadarAction = 'keep' | 'skip'

export type Decision = {
  id: string
  source: SourceKind
  title: string
  text: string
  url: string
  author: string
  action: RadarAction
  lanes: Array<RadarLane>
  lessonScore: number
  timeToUse: number
  hypeProbability: number
  workProbability: number
  leverage: number
  why: string
  move: string
}

export type RadarOptions = {
  operator: string
  engine: 'auto' | EngineName
  limit: number
  apiKey?: string
  apiUrl?: string
  model?: string
  fetchImpl?: typeof fetch
  generatedAt?: string
}
