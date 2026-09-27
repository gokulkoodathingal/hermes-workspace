import { COMMENT_QUESTIONS, STANCE_KEYS, THEME_KEYS } from './questions.ts'
import type {
  ChoiceAnswer,
  CommentInput,
  Judgment,
  NoulAnswer,
  ScoreAnswer,
  Stance,
  Theme,
} from './types.ts'

const THEME_RULES: Array<{ id: Theme; patterns: Array<RegExp> }> = [
  {
    id: 'price',
    patterns: [
      /\bprice\b/i,
      /\$\s?\d/,
      /\/\s?month/i,
      /\bbilling\b/i,
      /\brenewal\b/i,
      /\bcancell?ing\b/i,
      /\bworth\b/i,
      /\balready pay\b/i,
    ],
  },
  {
    id: 'proof',
    patterns: [
      /\d+(\.\d+)?\s*%/,
      /\bctr\b/i,
      /\bsame budget\b/i,
      /\bfrom\s+\d+.+\bto\s+\d+/i,
      /\d+\s*(hours?|days?|weeks?|months?)/i,
    ],
  },
  {
    id: 'usability',
    patterns: [
      /\bdashboard\b/i,
      /\bconfusing\b/i,
      /\bcan(?:'|’)t find\b/i,
      /\bsetup\b/i,
      /\bconnector\b/i,
      /\butm\b/i,
      /\blearning curve\b/i,
    ],
  },
  {
    id: 'support',
    patterns: [/\bsupport\b/i, /\bghosted\b/i, /\bticket\b/i, /\bno reply\b/i],
  },
  {
    id: 'comparison',
    patterns: [
      /\bswitched from\b/i,
      /\bcompared to\b/i,
      /\bversus\b/i,
      /\bvs\b/i,
      /\binstead of\b/i,
    ],
  },
  {
    id: 'outcome',
    patterns: [
      /\bcampaign\b/i,
      /\bleads?\b/i,
      /\breporting time\b/i,
      /\branking\b/i,
      /\bsales\b/i,
    ],
  },
  {
    id: 'trust',
    patterns: [
      /\bscam\b/i,
      /\bpassword\b/i,
      /\bprivacy\b/i,
      /\bsecurity\b/i,
      /\baffiliate\b/i,
      /\breal versus\b/i,
    ],
  },
  {
    id: 'feature_request',
    patterns: [
      /\bwe need\b/i,
      /\bwish\b/i,
      /\bplease add\b/i,
      /\bexport\b/i,
      /\bcan it\b/i,
      /\banyone know\b/i,
    ],
  },
]

const SPAM_PATTERNS = [
  /https?:\/\//i,
  /\b(dm me|whatsapp|telegram|crypto|airdrop|giveaway|link in bio|check my profile|free followers|click here)\b/i,
]

const KNOWN_COMPETITORS = [
  'HubSpot',
  'Mailchimp',
  'Jasper',
  'Salesforce',
  'Hootsuite',
  'Buffer',
  'Semrush',
  'Ahrefs',
  'Klaviyo',
  'Marketo',
]

function choiceAnswer(
  choice: string,
  keys: Array<string>,
  confidence: number,
): ChoiceAnswer {
  const others = keys.filter((key) => key !== choice)
  const share = others.length > 0 ? (1 - confidence) / others.length : 0
  const probabilities: Record<string, number> = {}
  for (const key of keys) {
    probabilities[key] = key === choice ? confidence : share
  }
  return { type: 'choice', choice, probabilities, confidence }
}

function scoreAnswer(
  level: number,
  confidence: number,
  criteria: ReadonlyArray<string>,
): ScoreAnswer {
  const probabilities = criteria.map((_, index) =>
    index === level ? confidence : (1 - confidence) / (criteria.length - 1),
  )
  const legend: Record<string, string> = {}
  criteria.forEach((label, index) => {
    legend[String(index)] = label
  })
  return { type: 'score', score: level, probabilities, confidence, legend }
}

function noul(probability: number): NoulAnswer {
  return { type: 'noul', noul: probability }
}

function hits(text: string, patterns: Array<RegExp>): number {
  return patterns.filter((pattern) => pattern.test(text)).length
}

function bestTheme(text: string): { choice: Theme; confidence: number } {
  const scored = THEME_RULES.map((rule) => ({
    id: rule.id,
    hits: hits(text, rule.patterns),
  }))
  const max = Math.max(...scored.map((item) => item.hits))
  if (max === 0) return { choice: 'other', confidence: 0.34 }
  const winners = scored.filter((item) => item.hits === max)
  if (winners.length === 1) {
    return {
      choice: winners[0].id,
      confidence: Math.min(0.92, 0.58 + max * 0.12),
    }
  }
  const priority: Array<Theme> = [
    'proof',
    'trust',
    'support',
    'price',
    'usability',
    'comparison',
    'outcome',
    'feature_request',
  ]
  const choice = priority.find((theme) =>
    winners.some((item) => item.id === theme),
  )
  return { choice: choice ?? 'other', confidence: 0.66 }
}

function bestStance(text: string): { choice: Stance; confidence: number } {
  const rules: Array<{ id: Stance; patterns: Array<RegExp> }> = [
    {
      id: 'question',
      patterns: [
        /\?/,
        /^(can|does|do|is|how|what|why|which|anyone|has anyone)\b/i,
      ],
    },
    {
      id: 'suggestion',
      patterns: [/\b(we need|wish|please add|would be better)\b/i],
    },
    {
      id: 'complaint',
      patterns: [
        /\b(ghosted|cancell?ing|confusing|can't|cannot|scam|broke|waste|jumped|slower)\b/i,
        /\bdidn't\b/i,
      ],
    },
    {
      id: 'praise',
      patterns: [/\b(love|finally|great|saved|works well)\b/i, /\bcut\b/i],
    },
    {
      id: 'story',
      patterns: [/\b(we|our|i switched|last month|after we)\b/i],
    },
  ]
  for (const rule of rules) {
    if (hits(text, rule.patterns) > 0) {
      return { choice: rule.id, confidence: 0.8 }
    }
  }
  if (text.trim().length < 16) return { choice: 'off_topic', confidence: 0.8 }
  return { choice: 'off_topic', confidence: 0.42 }
}

export function namedCompetitors(text: string): Array<string> {
  const found: Array<string> = []
  for (const name of KNOWN_COMPETITORS) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(text)) found.push(name)
  }
  return found
}

/**
 * Deterministic stand-in for Jev. Same answer shape, so the brief and the
 * gates do not change when a TYPESAFE_API_KEY is added. Keyword rules are the
 * practice field for question design; they are not the model.
 */
export function judgeHeuristic(comment: CommentInput): Judgment {
  const text = comment.text
  const theme = bestTheme(text)
  const stance = bestStance(text)
  const competitors = namedCompetitors(text)
  const spam = hits(text, SPAM_PATTERNS) > 0
  const proof =
    /\d+(\.\d+)?\s*%/.test(text) ||
    /\bctr\b/i.test(text) ||
    /\d+\s*(hours?|days?|weeks?|months?)/i.test(text) ||
    /\bfrom\s+\d+.+\bto\s+\d+/i.test(text)
  const objection =
    /\b(too expensive|not worth|cancell?ing|ghosted|scam|jumped|can't|cannot|didn't|already pay|drop)\b/i.test(
      text,
    )
  const competitor =
    competitors.length > 0 ||
    /\b(switched from|compared to|versus|instead of)\b/i.test(text)
  const recommendation =
    /\b(anyone know|what should i|which tool|recommend a|looking for)\b/i.test(
      text,
    ) || /\bdoes anyone\b/i.test(text)
  const specific =
    proof ||
    competitor ||
    /\b(dashboard|connector|export|password|utm)\b/i.test(text)
  let buying = 0
  if (
    /\b(would switch|switch today|sign up|start today|cancell?ing)\b/i.test(
      text,
    )
  ) {
    buying = 3
  } else if (
    competitor ||
    /\b(worth|already pay|too expensive|\$\s?\d)\b/i.test(text)
  ) {
    buying = 2
  } else if (stance.choice === 'question') {
    buying = 1
  }
  let specificity = 0
  if (proof) specificity = 3
  else if (specific) specificity = 2
  else if (text.trim().length > 40) specificity = 1
  let quotability = 0
  if (proof && text.trim().length > 40) quotability = 3
  else if (text.trim().length > 50 && specificity >= 2) quotability = 2
  else if (text.trim().length > 28) quotability = 1

  return {
    engine: 'heuristic',
    usage: null,
    answers: {
      theme: choiceAnswer(theme.choice, THEME_KEYS, theme.confidence),
      stance: choiceAnswer(stance.choice, STANCE_KEYS, stance.confidence),
      buying_language: scoreAnswer(
        buying,
        0.74,
        COMMENT_QUESTIONS.buying_language.criteria,
      ),
      quotability: scoreAnswer(
        quotability,
        0.7,
        COMMENT_QUESTIONS.quotability.criteria,
      ),
      specificity: scoreAnswer(
        specificity,
        0.7,
        COMMENT_QUESTIONS.specificity.criteria,
      ),
      is_spam: noul(spam ? 0.93 : 0.08),
      states_objection: noul(objection ? 0.86 : 0.12),
      mentions_competitor: noul(competitor ? 0.9 : 0.1),
      asks_for_recommendation: noul(recommendation ? 0.88 : 0.1),
      contains_proof: noul(proof ? 0.9 : 0.08),
    },
  }
}
