import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { summarize } from './aggregate.ts'
import { decide } from './decide.ts'
import { judgeHeuristic } from './heuristic.ts'
import { judgeWithJev } from './jev.ts'
import { mineComments } from './mine.ts'
import { parseComments } from './parse.ts'
import { COMMENT_QUESTIONS } from './questions.ts'
import type { CommentInput, Judgment } from './types.ts'

const sample = parseComments(
  readFileSync(new URL('./sample-comments.json', import.meta.url), 'utf8'),
  'sample-comments.json',
)

function byId(id: string) {
  const comment = sample.comments.find((item) => item.id === id)
  if (!comment) throw new Error(`missing ${id}`)
  return comment
}

function judgment(overrides: Partial<Judgment['answers']> = {}): Judgment {
  const base = judgeHeuristic({
    id: 'x',
    text: 'A clear sentence about the dashboard connector and how the team uses it daily.',
    source: 'pasted',
  })
  return { ...base, answers: { ...base.answers, ...overrides } }
}

describe('parseComments', () => {
  it('reads the sample product and comments', () => {
    expect(sample.product).toBe('Northstar')
    expect(sample.comments).toHaveLength(18)
    expect(sample.comments[0].source).toBe('youtube')
  })

  it('splits a text file on blank lines', () => {
    const parsed = parseComments('First comment\n\nSecond comment', 'notes.txt')
    expect(parsed.comments.map((item) => item.text)).toEqual([
      'First comment',
      'Second comment',
    ])
  })

  it('reads a quoted csv', () => {
    const parsed = parseComments(
      'id,source,text\nyt-9,youtube,"Hello, world"\n',
      'comments.csv',
    )
    expect(parsed.comments[0]).toEqual({
      id: 'yt-9',
      source: 'youtube',
      text: 'Hello, world',
    })
  })
})

describe('gates', () => {
  const comment: CommentInput = {
    id: 'c1',
    text: 'We cut reporting time from 6 hours to 1.',
    source: 'youtube',
  }

  it('holds spam even when the line looks quotable', () => {
    const decision = decide(
      comment,
      judgment({ is_spam: { type: 'noul', noul: 0.91 } }),
      ['HubSpot'],
    )
    expect(decision.action).toBe('hold_spam')
    expect(decision.flags).not.toContain('quotable')
    expect(decision.competitors).toEqual([])
  })

  it('sets an unclear theme aside', () => {
    const decision = decide(
      comment,
      judgment({
        theme: {
          type: 'choice',
          choice: 'other',
          probabilities: { other: 0.4 },
          confidence: 0.4,
        },
      }),
      [],
    )
    expect(decision.action).toBe('review')
    expect(decision.flags).not.toContain('quotable')
  })
})

describe('sample batch', () => {
  it('mines the synthetic comments into a brief a marketer can use', async () => {
    const result = await mineComments(sample.comments, {
      product: 'Northstar',
      audience: 'in-house digital marketers',
      engine: 'heuristic',
      generatedAt: '2026-09-27T00:00:00.000Z',
    })
    const summary = summarize(result.decisions)
    const decision = (id: string) =>
      result.decisions.find((item) => item.id === id)

    expect(result.engine).toBe('heuristic')
    expect(decision('yt-spam')?.action).toBe('hold_spam')
    expect(decision('li-spam')?.action).toBe('hold_spam')
    expect(decision('li-1')?.action).toBe('review')
    expect(decision('yt-3')?.action).toBe('review')
    expect(decision('yt-2')?.flags).toEqual(
      expect.arrayContaining(['proof', 'quotable']),
    )
    expect(decision('g2-1')?.theme).toBe('price')
    expect(decision('g2-1')?.flags).toEqual(
      expect.arrayContaining(['objection', 'question', 'competitor']),
    )
    expect(decision('g2-4')?.flags).toContain('ready')
    expect(decision('yt-1')?.competitors).toContain('HubSpot')
    expect(summary.quotes.map((item) => item.id)).not.toContain('yt-spam')
    expect(result.markdown).toContain('judgments: heuristic')
    expect(result.markdown).toContain('1.2% CTR to 2.4%')
    const proofStart = result.markdown.indexOf('## Proof you can ask to cite')
    const questionsStart = result.markdown.indexOf(
      '## Questions they already asked',
    )
    expect(result.markdown.slice(proofStart, questionsStart)).not.toContain(
      'crypto airdrop',
    )
    expect(result.markdown).toContain('## Held as spam or promo')
    expect(result.markdown).toContain('crypto airdrop')
    expect(summary.competitors).toEqual(
      expect.arrayContaining(['HubSpot', 'Jasper', 'Mailchimp']),
    )
  })
})

describe('judgeWithJev', () => {
  it('sends the comment as state and keeps the key out of the body', async () => {
    const fetchImpl = vi.fn(() => {
      const heuristic = judgeHeuristic({
        id: 'c1',
        text: 'Is this worth $49/month?',
        source: 'g2',
      })
      return Promise.resolve(
        new Response(
          JSON.stringify({
            answers: heuristic.answers,
            usage: { input_tokens: 120, output_tokens: 0 },
          }),
          { status: 200 },
        ),
      )
    })
    await judgeWithJev(
      { id: 'c1', text: 'Is this worth $49/month?', source: 'g2' },
      {
        product: 'Northstar',
        audience: 'marketers',
        engine: 'jev',
        apiKey: 'secret-key',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      },
    )
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.typesafe.ai/v1/systemone')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer secret-key' })
    const body = JSON.parse(String(init.body))
    expect(body.state.comment).toBe('Is this worth $49/month?')
    expect(body.questions.theme.type).toBe(COMMENT_QUESTIONS.theme.type)
    expect(JSON.stringify(body)).not.toContain('secret-key')
  })

  it('refuses to call Jev without a key', async () => {
    const previous = process.env.TYPESAFE_API_KEY
    delete process.env.TYPESAFE_API_KEY
    await expect(
      judgeWithJev(
        { id: 'c1', text: 'Hello', source: 'pasted' },
        { product: 'Northstar', audience: 'marketers', engine: 'jev' },
      ),
    ).rejects.toThrow(/TYPESAFE_API_KEY/)
    if (previous) process.env.TYPESAFE_API_KEY = previous
  })
})
