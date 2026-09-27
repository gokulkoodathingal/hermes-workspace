export type Theme =
  | 'price'
  | 'proof'
  | 'usability'
  | 'support'
  | 'comparison'
  | 'outcome'
  | 'trust'
  | 'feature_request'
  | 'other'

export type Stance =
  | 'praise'
  | 'complaint'
  | 'question'
  | 'suggestion'
  | 'story'
  | 'off_topic'

export type EngineName = 'heuristic' | 'jev'

export type CommentInput = {
  id: string
  text: string
  source: string
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

export type CommentAnswers = {
  theme: ChoiceAnswer
  stance: ChoiceAnswer
  buying_language: ScoreAnswer
  quotability: ScoreAnswer
  specificity: ScoreAnswer
  is_spam: NoulAnswer
  states_objection: NoulAnswer
  mentions_competitor: NoulAnswer
  asks_for_recommendation: NoulAnswer
  contains_proof: NoulAnswer
}

export type Judgment = {
  engine: EngineName
  answers: CommentAnswers
  usage: { input_tokens: number; output_tokens: number } | null
}

export type CommentAction = 'keep' | 'hold_spam' | 'review'

export type CommentFlag =
  | 'objection'
  | 'buying'
  | 'ready'
  | 'proof'
  | 'quotable'
  | 'competitor'
  | 'question'

export type Decision = {
  id: string
  text: string
  source: string
  theme: Theme
  themeConfidence: number
  stance: Stance
  buyingScore: number
  quotability: number
  specificity: number
  spamProbability: number
  objectionProbability: number
  competitorProbability: number
  recommendationProbability: number
  proofProbability: number
  action: CommentAction
  flags: Array<CommentFlag>
  competitors: Array<string>
}

export type MineOptions = {
  product: string
  audience: string
  engine: 'auto' | EngineName
  apiKey?: string
  apiUrl?: string
  model?: string
  fetchImpl?: typeof fetch
  generatedAt?: string
}
