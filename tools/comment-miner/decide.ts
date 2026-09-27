import { GATES, THEME_KEYS } from './questions.ts'
import type {
  CommentAction,
  CommentFlag,
  CommentInput,
  Decision,
  Judgment,
  Stance,
  Theme,
} from './types.ts'

function asTheme(
  value: string,
  confidence: number,
): { theme: Theme; confidence: number } {
  if ((THEME_KEYS as Array<string>).includes(value)) {
    return { theme: value as Theme, confidence }
  }
  return { theme: 'other', confidence: 0 }
}

function asStance(value: string): Stance {
  const allowed: Array<Stance> = [
    'praise',
    'complaint',
    'question',
    'suggestion',
    'story',
    'off_topic',
  ]
  return allowed.includes(value as Stance) ? (value as Stance) : 'off_topic'
}

export function decide(
  comment: CommentInput,
  judgment: Judgment,
  competitors: Array<string>,
): Decision {
  const answers = judgment.answers
  const theme = asTheme(answers.theme.choice, answers.theme.confidence)
  const spam = answers.is_spam.noul
  let action: CommentAction = 'keep'
  if (spam >= GATES.spamHold) action = 'hold_spam'
  else if (theme.confidence < GATES.themeReviewBelow) action = 'review'

  const flags: Array<CommentFlag> = []
  const quotable =
    action === 'keep' &&
    spam < GATES.spamQuoteCeiling &&
    answers.quotability.score >= GATES.quotable &&
    answers.specificity.score >= GATES.specificEnough
  if (
    action !== 'hold_spam' &&
    answers.states_objection.noul >= GATES.objection
  ) {
    flags.push('objection')
  }
  if (action !== 'hold_spam' && answers.buying_language.score >= GATES.buying) {
    flags.push('buying')
  }
  if (action !== 'hold_spam' && answers.buying_language.score >= GATES.ready) {
    flags.push('ready')
  }
  if (action !== 'hold_spam' && answers.contains_proof.noul >= GATES.proof) {
    flags.push('proof')
  }
  if (quotable) flags.push('quotable')
  if (
    action !== 'hold_spam' &&
    answers.mentions_competitor.noul >= GATES.competitor
  ) {
    flags.push('competitor')
  }
  if (
    action !== 'hold_spam' &&
    (answers.asks_for_recommendation.noul >= GATES.recommendation ||
      asStance(answers.stance.choice) === 'question')
  ) {
    flags.push('question')
  }

  return {
    id: comment.id,
    text: comment.text.trim(),
    source: comment.source,
    theme: theme.theme,
    themeConfidence: theme.confidence,
    stance: asStance(answers.stance.choice),
    buyingScore: answers.buying_language.score,
    quotability: answers.quotability.score,
    specificity: answers.specificity.score,
    spamProbability: spam,
    objectionProbability: answers.states_objection.noul,
    competitorProbability: answers.mentions_competitor.noul,
    recommendationProbability: answers.asks_for_recommendation.noul,
    proofProbability: answers.contains_proof.noul,
    action,
    flags,
    competitors: action === 'hold_spam' ? [] : competitors,
  }
}
