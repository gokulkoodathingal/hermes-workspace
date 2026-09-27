import type { Decision, Theme } from './types.ts'

const THEME_LABELS: Record<Theme, string> = {
  price: 'Price',
  proof: 'Proof',
  usability: 'Usability',
  support: 'Support',
  comparison: 'Comparison',
  outcome: 'Outcome',
  trust: 'Trust',
  feature_request: 'Feature request',
  other: 'Other',
}

export type ThemeCount = { theme: Theme; label: string; count: number }

export type CommentSummary = {
  total: number
  kept: number
  spam: number
  review: number
  themes: Array<ThemeCount>
  objections: Array<Decision>
  buying: Array<Decision>
  ready: Array<Decision>
  proof: Array<Decision>
  quotes: Array<Decision>
  questions: Array<Decision>
  competitors: Array<string>
  needsLook: Array<Decision>
  spamHeld: Array<Decision>
}

function byFlag(
  decisions: Array<Decision>,
  flag: Decision['flags'][number],
): Array<Decision> {
  return decisions.filter((item) => item.flags.includes(flag))
}

export function summarize(decisions: Array<Decision>): CommentSummary {
  const kept = decisions.filter((item) => item.action === 'keep')
  const counts = new Map<Theme, number>()
  for (const item of kept) {
    counts.set(item.theme, (counts.get(item.theme) ?? 0) + 1)
  }
  const themes = [...counts.entries()]
    .map(([theme, count]) => ({ theme, label: THEME_LABELS[theme], count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  const competitors = [
    ...new Set(decisions.flatMap((item) => item.competitors)),
  ].sort()
  return {
    total: decisions.length,
    kept: kept.length,
    spam: decisions.filter((item) => item.action === 'hold_spam').length,
    review: decisions.filter((item) => item.action === 'review').length,
    themes,
    objections: byFlag(decisions, 'objection'),
    buying: byFlag(decisions, 'buying'),
    ready: byFlag(decisions, 'ready'),
    proof: byFlag(decisions, 'proof').filter(
      (item) => item.stance !== 'complaint',
    ),
    quotes: byFlag(decisions, 'quotable').sort(
      (a, b) => b.quotability - a.quotability || b.specificity - a.specificity,
    ),
    questions: byFlag(decisions, 'question'),
    competitors,
    needsLook: decisions.filter((item) => item.action === 'review'),
    spamHeld: decisions.filter((item) => item.action === 'hold_spam'),
  }
}

function quoteBlock(items: Array<Decision>, limit = 5): string {
  if (items.length === 0) return '_None in this batch._'
  return items
    .slice(0, limit)
    .map(
      (item) =>
        `> ${item.text}\n>\n> ${item.source} · ${item.id} · ${THEME_LABELS[item.theme]}`,
    )
    .join('\n\n')
}

function moves(summary: CommentSummary): Array<string> {
  const list: Array<string> = []
  if (summary.spam / Math.max(summary.total, 1) >= 0.1) {
    list.push(
      'Hold spam and promo comments out of any testimonial widget. Review the held list before deleting it; a real complaint can look loud.',
    )
  }
  if (
    (summary.themes.length > 0 && summary.themes[0].theme === 'price') ||
    summary.objections.some((item) => item.theme === 'price')
  ) {
    list.push(
      'Answer the price objection on the page: what they already pay, what this replaces, and the number a customer would need to see.',
    )
  }
  if (summary.proof.length > 0) {
    list.push(
      'Use the measured lines as proof candidates. Get permission, name the timeframe, and keep the number exact.',
    )
  }
  if (summary.competitors.length > 0) {
    list.push(
      `Write a comparison note that names ${summary.competitors.join(', ')} the way commenters already do.`,
    )
  }
  if (summary.questions.length > 0) {
    list.push(
      'Turn the questions into one FAQ block or a video chapter. Those people already asked.',
    )
  }
  if (summary.themes.length > 0 && summary.themes[0].theme === 'trust') {
    list.push(
      'Put the trust answer next to the claim: what access you ask for, what you never ask for, and how to revoke it.',
    )
  }
  if (
    summary.themes.length > 0 &&
    (summary.themes[0].theme === 'usability' ||
      summary.themes[0].theme === 'support')
  ) {
    list.push(
      'Fix or document the friction they named before spending more to acquire people who will hit the same wall.',
    )
  }
  if (list.length === 0) {
    list.push(
      'Collect a larger batch from one source. This set is too thin to change a page.',
    )
  }
  return list.slice(0, 3)
}

export function renderBrief(input: {
  product: string
  audience: string
  engine: string
  generatedAt: string
  summary: CommentSummary
}): string {
  const { product, audience, engine, generatedAt, summary } = input
  const topCount = summary.themes[0]?.count ?? 0
  const leaders = summary.themes.filter((item) => item.count === topCount)
  const lead =
    leaders.length === 0
      ? 'No kept comment had a clear theme.'
      : leaders.length === 1
        ? `The strongest kept theme is ${leaders[0].label.toLowerCase()} (${leaders[0].count}).`
        : `The kept comments split evenly across ${leaders
            .map((item) => item.label.toLowerCase())
            .join(', ')} (${topCount} each).`
  const themeRows =
    summary.themes.length === 0
      ? '| — | 0 |'
      : summary.themes
          .map((item) => `| ${item.label} | ${item.count} |`)
          .join('\n')
  const moveList = moves(summary)
    .map((item) => `- ${item}`)
    .join('\n')
  return `# Comment brief: ${product}

${generatedAt} · audience: ${audience} · judgments: ${engine}

${summary.total} comments. ${summary.kept} kept, ${summary.spam} held as spam or promo, ${summary.review} set aside because the theme was unclear. ${lead}

Quotes below are candidates. Publish one only after the person agrees.

## Themes in the kept comments

| Theme | Count |
| --- | ---: |
${themeRows}

## Objections

${quoteBlock(summary.objections)}

## Buying, switching, or cancelling

${quoteBlock(summary.ready.length > 0 ? summary.ready : summary.buying)}

## Proof you can ask to cite

${quoteBlock(summary.proof)}

## Questions they already asked

${quoteBlock(summary.questions)}

## Alternatives they named

${
  summary.competitors.length > 0
    ? summary.competitors.join(', ')
    : '_No named alternative in the kept comments._'
}

## Needs a human

${quoteBlock(summary.needsLook)}

## Held as spam or promo

${quoteBlock(summary.spamHeld, 8)}

## Moves this week

${moveList}
`
}
