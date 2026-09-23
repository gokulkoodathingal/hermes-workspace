import { describe, expect, it } from 'vitest'
import {
  AGENT_PRESETS,
  listVisibleAgentPresets,
} from './agent-presets'

describe('SEO Auditor preset', () => {
  const prompt = AGENT_PRESETS['seo-auditor'].systemPrompt

  it('is offered as a visible Operations template named SEO Auditor', () => {
    const preset = listVisibleAgentPresets().find(
      (entry) => entry.id === 'seo-auditor',
    )

    expect(preset).toMatchObject({
      name: 'SEO Auditor',
      emoji: '🔎',
      description:
        'On-page and answer-engine auditor with evidence-backed findings',
    })
    expect(preset?.systemPrompt).toBe(prompt)
    expect(
      listVisibleAgentPresets().some((entry) => entry.id.startsWith('pc1-')),
    ).toBe(false)
  })

  it('requires an evidence-backed report and a structured handoff', () => {
    expect(prompt.startsWith('You are the SEO Auditor.')).toBe(true)
    expect(prompt).toContain('untrusted evidence')
    expect(prompt).toContain('Do not predict ranking movement or revenue.')
    expect(prompt).toContain('### Audit')
    expect(prompt).toContain('### Findings')
    expect(prompt).toContain('### Handoff')
    expect(prompt).toContain('"summary"')
    expect(prompt).toContain('"searchIntent"')
    expect(prompt).toContain('"strengths"')
    expect(prompt).toContain('"opportunities"')
    expect(prompt).toContain('hide text, cloak, spin doorway pages')
    expect(prompt.length).toBeGreaterThan(3000)
  })
})
