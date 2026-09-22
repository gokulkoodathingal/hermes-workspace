import * as cheerio from 'cheerio'
import { auditHtml } from './checks'
import { SeoAuditReportSchema, SeoLlmAnalysisSchema } from './schema'
import type { SeoAuditReport } from './schema'
import type { IngestedPage } from './ingest'

export type SeoAnalysisInput = {
  url: string
  title: string
  metaDescription: string
  primaryHeading: string
  visibleTextExcerpt: string
  deterministicScore: number
  deterministicFindings: Array<{
    severity: 'error' | 'warning' | 'info'
    title: string
    evidence: string
  }>
}

export type SeoAnalyzer = (input: SeoAnalysisInput) => Promise<unknown>

function compactPageEvidence(
  page: IngestedPage,
  deterministic: ReturnType<typeof auditHtml>,
): SeoAnalysisInput {
  const $ = cheerio.load(page.html)
  const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()
  $('script, style, noscript, template').remove()

  return {
    url: page.finalUrl,
    title: normalize($('title').first().text()),
    metaDescription: normalize(
      $('meta[name="description"]').first().attr('content') ?? '',
    ),
    primaryHeading: normalize($('h1').first().text()),
    visibleTextExcerpt: normalize($('body').text()).slice(0, 4_000),
    deterministicScore: deterministic.score,
    deterministicFindings: deterministic.findings.map(
      ({ severity, title, evidence }) => ({ severity, title, evidence }),
    ),
  }
}

export async function runSeoAudit(
  page: IngestedPage,
  options: { analyzer?: SeoAnalyzer } = {},
): Promise<SeoAuditReport> {
  const deterministic = auditHtml(page.html, page.finalUrl)
  const llmAnalysis = options.analyzer
    ? SeoLlmAnalysisSchema.parse(
        await options.analyzer(compactPageEvidence(page, deterministic)),
      )
    : null

  return SeoAuditReportSchema.parse({
    url: page.finalUrl,
    requestedUrl: page.requestedUrl,
    status: page.status,
    generatedAt: new Date().toISOString(),
    analysisMode: llmAnalysis ? 'deterministic+llm' : 'deterministic',
    deterministic,
    llmAnalysis,
  })
}
