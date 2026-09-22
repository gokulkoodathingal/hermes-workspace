import { describe, expect, it } from 'vitest'
import { auditHtml } from './checks'

describe('auditHtml', () => {
  it('returns a healthy report for a well-formed page', () => {
    const html = `<!doctype html>
      <html lang="en">
        <head>
          <title>A practical guide to deterministic on-page SEO audits</title>
          <meta name="description" content="${'Useful search-focused guidance for teams that want repeatable, evidence-based page reviews without relying on a model. '.repeat(2).slice(0, 145)}">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="canonical" href="https://example.com/guide">
        </head>
        <body>
          <h1>Deterministic on-page SEO audits</h1>
          <h2>Start with page evidence</h2>
          <p>${'Search-friendly content should answer the reader clearly. '.repeat(45)}</p>
          <a href="/about">About us</a>
          <img src="/chart.png" alt="SEO audit score chart">
        </body>
      </html>`

    const result = auditHtml(html, 'https://example.com/guide')

    expect(result.metrics).toMatchObject({
      titleCount: 1,
      h1Count: 1,
      imageCount: 1,
      imagesMissingAlt: 0,
      internalLinkCount: 1,
    })
    expect(
      result.findings.filter((finding) => finding.severity === 'error'),
    ).toEqual([])
    expect(result.score).toBeGreaterThanOrEqual(90)
  })

  it('reports actionable deterministic findings for common SEO defects', () => {
    const html = `<!doctype html>
      <html>
        <head><title>Short</title></head>
        <body>
          <h1>First heading</h1><h1>Second heading</h1>
          <img src="/product.png">
          <a href="https://other.example/path">External</a>
        </body>
      </html>`

    const result = auditHtml(html, 'https://example.com/product')
    const findingIds = result.findings.map((finding) => finding.id)

    expect(findingIds).toEqual(
      expect.arrayContaining([
        'document-language',
        'title-length',
        'meta-description',
        'canonical',
        'viewport',
        'h1-count',
        'image-alt',
        'thin-content',
      ]),
    )
    expect(result.score).toBeLessThan(70)
  })

  it('excludes non-visible elements and accepts decorative empty alt text', () => {
    const html = `<html lang="en">
      <head>
        <title>A sufficiently descriptive title for the test page</title>
        <meta name="description" content="${'A useful description. '.repeat(8)}">
        <meta name="viewport" content="width=device-width">
        <link rel="canonical" href="https://example.com/page">
        <style>${'hidden style words '.repeat(200)}</style>
      </head>
      <body>
        <h1>Short visible page</h1>
        <p>Only these visible words should count.</p>
        <script>${'hidden script words '.repeat(200)}</script>
        <img src="/decoration.svg" alt="">
        <a href="/next">Next</a>
      </body>
    </html>`

    const result = auditHtml(html, 'https://example.com/page')

    expect(result.metrics.wordCount).toBeLessThan(20)
    expect(result.metrics.imagesMissingAlt).toBe(0)
    expect(result.findings.map((finding) => finding.id)).toContain(
      'thin-content',
    )
    expect(result.findings.map((finding) => finding.id)).not.toContain(
      'image-alt',
    )
  })
})
