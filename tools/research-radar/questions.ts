/** Closed questions for one research item. Lanes are independent, so an item can be both work and a lesson. */
export const RADAR_QUESTIONS = {
  relevant_to_work: {
    type: 'noul' as const,
    instructions:
      'This item can change a live marketing decision this month: channel, creative, SEO, ads, measurement, lifecycle, or platform policy',
    criteria: {
      true: 'A marketer would check a live account, page, or report because of this',
      false:
        'Interesting in general, with no consequence for a live account this month',
    },
  },
  learn_ai: {
    type: 'noul' as const,
    instructions:
      'This item teaches a mechanism of AI or agentic systems that a marketer can apply',
    criteria: {
      true: 'It explains models, tools, memory, agents, evaluation, or a concrete marketing use',
      false: 'It only names AI as a slogan',
    },
  },
  learn_security: {
    type: 'noul' as const,
    instructions:
      'This item is professional security awareness for a marketer: privacy, consent, account protection, brand impersonation, or ad fraud',
    criteria: {
      true: 'A marketer should change access, consent, or brand checks because of this',
      false: 'It is not a security or privacy issue for marketing work',
    },
  },
  learn_networking: {
    type: 'noul' as const,
    instructions:
      'This item teaches networking only as far as marketing delivery needs it: DNS, CDN, redirects, email authentication, tracking domains, or site speed',
    criteria: {
      true: 'It helps a marketer brief engineering or debug delivery',
      false: 'It is not about delivery, domains, or email authentication',
    },
  },
  worth_a_lesson: {
    type: 'score' as const,
    instructions:
      'How much teaching value does this have for a 12-year marketer?',
    criteria: [
      'No lesson. A reaction or a recap with no mechanism',
      'A definition he can look up later',
      'A mechanism he can explain after 20 minutes',
      'A mechanism plus a task he can ship this week',
    ],
  },
  time_to_use: {
    type: 'score' as const,
    instructions: 'How soon can he apply this in his own work?',
    criteria: [
      'No application',
      'Background only',
      'Useful after a short study session',
      'He can act on a live account or lesson this week',
    ],
  },
  is_hype: {
    type: 'noul' as const,
    instructions:
      'This item is a vendor pitch or growth promise with no mechanism, date, or primary source',
    criteria: {
      true: 'Income promises, secret hacks, or tool lists with no mechanism',
      false: 'It states a change, a mechanism, or a source he can check',
    },
  },
}

export const GATES = {
  lane: 0.62,
  hypeSkip: 0.75,
  workKeepsHype: 0.7,
}

export const LANE_LABELS = {
  work: 'Work',
  learn_ai: 'Learn AI',
  learn_security: 'Learn security',
  learn_networking: 'Learn networking',
} as const
