import type { Theme } from './types.ts'

/** Closed questions sent with every comment. Jev answers all of them in one pass. */
export const COMMENT_QUESTIONS = {
  theme: {
    type: 'choice' as const,
    instructions:
      'What is this comment mostly about, given the product and audience in state?',
    criteria: {
      price: 'Cost, billing, discounts, or whether it is worth the money',
      proof: 'Results, numbers, or whether a claim is believable',
      usability: 'Ease of use, setup, learning curve, or daily workflow',
      support: 'Help, response time, bugs, or reliability after purchase',
      comparison: 'Another product, switching, or which option to choose',
      outcome: 'A result they got or want: leads, sales, time, or ranking',
      trust: 'Privacy, security, scams, or whether the seller is legitimate',
      feature_request: 'A missing capability they want added',
      other: 'None of the themes above',
    },
  },
  stance: {
    type: 'choice' as const,
    instructions: 'What is the person doing in this comment?',
    criteria: {
      praise: 'Reporting a positive experience',
      complaint: 'Reporting a problem or disappointment',
      question: 'Asking how something works or what to choose',
      suggestion: 'Proposing a change or an idea',
      story: 'Telling what happened, without a clear ask',
      off_topic: 'Not about the product, the category, or a decision',
    },
  },
  buying_language: {
    type: 'score' as const,
    instructions:
      'How close is this person to acting: buying, switching, or cancelling?',
    criteria: [
      'No decision. A reaction, joke, or general remark',
      'Curious. Asking what it is or how it works',
      'Comparing options or naming a constraint such as price or fit',
      'Ready to act: buy, switch, start, or cancel',
    ],
  },
  quotability: {
    type: 'score' as const,
    instructions:
      'How usable is the wording as a customer quote after the person gives permission?',
    criteria: [
      'Not usable. Vague, sarcastic without a point, or only a reaction',
      'Useful as context, but the sentence is messy or incomplete',
      'A clear sentence a marketer could trim and cite',
      'A specific line that can be quoted with little editing',
    ],
  },
  specificity: {
    type: 'score' as const,
    instructions: 'How concrete is the experience described?',
    criteria: [
      'No detail. A label such as love it or waste of money',
      'A general reason without a number, name, or step',
      'A concrete situation: a feature, competitor, or workflow',
      'A measured detail: a number, timeframe, or before-and-after',
    ],
  },
  is_spam: {
    type: 'noul' as const,
    instructions:
      'This comment is spam, a scam pitch, engagement bait, or an unsolicited promotion',
    criteria: {
      true: 'Link drop, follow-for-follow, crypto pitch, copied promo, or bot-like solicitation',
      false:
        'A real reaction, question, or experience, including a negative one',
    },
  },
  states_objection: {
    type: 'noul' as const,
    instructions:
      'The person states a reason not to buy, switch, stay, or trust this',
    criteria: {
      true: 'A concrete reason to hesitate, leave, or refuse',
      false: 'No reason against the product is stated',
    },
  },
  mentions_competitor: {
    type: 'noul' as const,
    instructions:
      'The person names or clearly points at another product or method they use, pay for, or prefer',
    criteria: {
      true: 'Another product, vendor, or current way of working is identifiable',
      false: 'No alternative is named or pointed at',
    },
  },
  asks_for_recommendation: {
    type: 'noul' as const,
    instructions: 'The person is asking others what to use, buy, or do',
    criteria: {
      true: 'They want a recommendation or a which-one answer',
      false: 'They are not asking for a recommendation',
    },
  },
  contains_proof: {
    type: 'noul' as const,
    instructions:
      'The person reports a result with a number, a timeframe, or a before-and-after',
    criteria: {
      true: 'A quantity, duration, or from-to change is part of the claim',
      false: 'The comment has no measured result',
    },
  },
}

export const THEME_KEYS = Object.keys(
  COMMENT_QUESTIONS.theme.criteria,
) as Array<Theme>

export const STANCE_KEYS = Object.keys(COMMENT_QUESTIONS.stance.criteria)

/**
 * Actions stay in code. A lone model verdict never publishes a quote.
 * Spam is costly to treat as a customer. Holding a comment is cheap.
 */
export const GATES = {
  spamHold: 0.75,
  themeReviewBelow: 0.55,
  objection: 0.65,
  competitor: 0.65,
  recommendation: 0.65,
  proof: 0.7,
  buying: 2,
  ready: 3,
  quotable: 2,
  specificEnough: 2,
  spamQuoteCeiling: 0.4,
}
