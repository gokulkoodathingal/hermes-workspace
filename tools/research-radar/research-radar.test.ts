import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { board } from './aggregate.ts'
import { decide } from './decide.ts'
import { judgeHeuristic } from './heuristic.ts'
import { judgeWithJev } from './jev.ts'
import { parseRadar } from './parse.ts'
import { RADAR_QUESTIONS } from './questions.ts'
import { buildRadar } from './radar.ts'
import type { Judgment, RadarItem } from './types.ts'

const sample = parseRadar(
  readFileSync(new URL('./sample-items.json', import.meta.url), 'utf8'),
)

function byId(id: string): RadarItem {
  const item = sample.items.find((entry) => entry.id === id)
  if (!item) throw new Error(`missing ${id}`)
  return item
}

describe('parseRadar', () => {
  it('reads the sample pile', () => {
    expect(sample.items).toHaveLength(12)
    expect(sample.items[0].source).toBe('youtube')
  })
})

describe('gates', () => {
  const item = byId('ads-ai-max')

  it('skips hype that does not change the work', () => {
    const base = judgeHeuristic(item)
    const judgment: Judgment = {
      ...base,
      answers: {
        ...base.answers,
        relevant_to_work: { type: 'noul', noul: 0.2 },
        learn_ai: { type: 'noul', noul: 0.9 },
        is_hype: { type: 'noul', noul: 0.93 },
      },
    }
    expect(decide(item, judgment).action).toBe('skip')
  })

  it('keeps a work item even when the wording is promotional', () => {
    const base = judgeHeuristic(item)
    const judgment: Judgment = {
      ...base,
      answers: {
        ...base.answers,
        relevant_to_work: { type: 'noul', noul: 0.91 },
        is_hype: { type: 'noul', noul: 0.8 },
      },
    }
    const decision = decide(item, judgment)
    expect(decision.action).toBe('keep')
    expect(decision.lanes).toContain('work')
  })
})

describe('sample radar', () => {
  it('keeps five work items and skips hype and celebrity posts', async () => {
    const result = await buildRadar(sample.items, {
      operator: 'Digital marketing specialist',
      engine: 'heuristic',
      limit: 5,
      generatedAt: '2026-09-27T00:00:00.000Z',
    })
    const ranked = board(result.decisions, 5)
    expect(result.engine).toBe('heuristic')
    expect(ranked.radar.map((item) => item.id)).toEqual([
      'g2-access',
      'ga4-thread',
      'phish-meta',
      'ads-ai-max',
      'meta-policy',
    ])
    expect(ranked.skipped.map((item) => item.id).sort()).toEqual([
      'celebrity',
      'hype-10x',
    ])
    expect(ranked.later.map((item) => item.id)).toEqual(
      expect.arrayContaining(['agent-mechanism', 'dmarc-page', 'wiki-dns']),
    )
    expect(result.markdown).toContain('judgments: heuristic')
    expect(result.markdown).toContain('GA4 attribution dropped')
    const today = result.markdown.slice(
      result.markdown.indexOf('## Today'),
      result.markdown.indexOf('## Later'),
    )
    expect(today).not.toContain('10x your income')
    expect(
      result.decisions.find((item) => item.id === 'phish-meta')?.move,
    ).toContain('Stop before any exploit detail')
  })
})

describe('judgeWithJev', () => {
  it('sends the title and keeps the key out of the body', async () => {
    const fetchImpl = vi.fn(() => {
      const heuristic = judgeHeuristic(byId('dmarc-page'))
      return Promise.resolve(
        new Response(
          JSON.stringify({
            answers: heuristic.answers,
            usage: { input_tokens: 80, output_tokens: 0 },
          }),
          { status: 200 },
        ),
      )
    })
    await judgeWithJev(byId('dmarc-page'), {
      operator: 'marketer',
      engine: 'jev',
      limit: 5,
      apiKey: 'secret-key',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.typesafe.ai/v1/systemone')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer secret-key' })
    const body = JSON.parse(String(init.body))
    expect(body.state.title).toBe(byId('dmarc-page').title)
    expect(body.questions.learn_networking.type).toBe(
      RADAR_QUESTIONS.learn_networking.type,
    )
    expect(JSON.stringify(body)).not.toContain('secret-key')
  })

  it('refuses to call Jev without a key', async () => {
    const previous = process.env.TYPESAFE_API_KEY
    delete process.env.TYPESAFE_API_KEY
    await expect(
      judgeWithJev(byId('wiki-dns'), {
        operator: 'marketer',
        engine: 'jev',
        limit: 5,
      }),
    ).rejects.toThrow(/TYPESAFE_API_KEY/)
    if (previous) process.env.TYPESAFE_API_KEY = previous
  })
})
