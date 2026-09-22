import { describe, expect, it, vi } from 'vitest'
import { runSeoAudit } from './auditor'

const html = `<!doctype html>
  <html lang="en">
    <head>
      <title>A useful page title that has an appropriate search length</title>
      <meta name="description" content="${'A concise and useful page summary for searchers. '.repeat(4).slice(0, 140)}">
      <meta name="viewport" content="width=device-width">
      <link rel="canonical" href="https://example.com/page">
    </head>
    <body><h1>Useful page</h1><p>${'Relevant copy. '.repeat(80)}</p></body>
  </html>`

describe('runSeoAudit', () => {
  it('returns a complete deterministic report without an LLM', async () => {
    const report = await runSeoAudit({
      requestedUrl: 'https://example.com/page',
      finalUrl: 'https://example.com/page',
      status: 200,
      contentType: 'text/html',
      html,
    })

    expect(report).toMatchObject({
      url: 'https://example.com/page',
      analysisMode: 'deterministic',
      llmAnalysis: null,
    })
    expect(report.generatedAt).toEqual(expect.any(String))
    expect(report.deterministic.score).toEqual(expect.any(Number))
  })

  it('passes compact page evidence to an analyzer and validates its structured output', async () => {
    const analyzer = vi.fn(() =>
      Promise.resolve({
        summary:
          'The page has sound fundamentals and can sharpen search intent.',
        searchIntent: 'Informational',
        strengths: ['Clear primary heading'],
        opportunities: [
          {
            priority: 'medium' as const,
            recommendation: 'Clarify the first paragraph.',
            rationale: 'It makes the answer easier to extract.',
          },
        ],
      }),
    )

    const report = await runSeoAudit(
      {
        requestedUrl: 'https://example.com/page',
        finalUrl: 'https://example.com/page',
        status: 200,
        contentType: 'text/html',
        html,
      },
      { analyzer },
    )

    expect(analyzer).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://example.com/page',
        title: expect.stringContaining('useful page title'),
        deterministicFindings: expect.any(Array),
      }),
    )
    expect(report.analysisMode).toBe('deterministic+llm')
    expect(report.llmAnalysis?.searchIntent).toBe('Informational')
  })

  it('fails closed when analyzer output does not match the report schema', async () => {
    await expect(
      runSeoAudit(
        {
          requestedUrl: 'https://example.com/page',
          finalUrl: 'https://example.com/page',
          status: 200,
          contentType: 'text/html',
          html,
        },
        { analyzer: () => Promise.resolve({ summary: 'Incomplete output' }) },
      ),
    ).rejects.toThrow()
  })
})
