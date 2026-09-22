import * as cheerio from 'cheerio'
import { DeterministicSeoAuditSchema } from './schema'
import type { DeterministicSeoAudit, SeoFinding } from './schema'

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function addFinding(findings: Array<SeoFinding>, finding: SeoFinding): void {
  findings.push(finding)
}

export function auditHtml(
  html: string,
  pageUrl: string,
): DeterministicSeoAudit {
  const $ = cheerio.load(html)
  const findings: Array<SeoFinding> = []
  const titles = $('title')
  const title = normalizeText(titles.first().text())
  const description = normalizeText(
    $('meta[name="description"]').first().attr('content') ?? '',
  )
  const h1Count = $('h1').length
  const h2Count = $('h2').length
  const bodyText = normalizeText($('body').text())
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0
  const images = $('img')
  const imagesMissingAlt = images
    .toArray()
    .filter((image) => !($(image).attr('alt') ?? '').trim()).length

  let internalLinkCount = 0
  let externalLinkCount = 0
  const origin = new URL(pageUrl).origin
  $('a[href]').each((_index, anchor) => {
    const href = $(anchor).attr('href')
    if (
      !href ||
      href.startsWith('#') ||
      /^(mailto:|tel:|javascript:)/i.test(href)
    )
      return
    try {
      const link = new URL(href, pageUrl)
      if (!/^https?:$/.test(link.protocol)) return
      if (link.origin === origin) internalLinkCount += 1
      else externalLinkCount += 1
    } catch {
      // Invalid links are outside this auditor's intentionally small rule set.
    }
  })

  if (!($('html').attr('lang') ?? '').trim()) {
    addFinding(findings, {
      id: 'document-language',
      severity: 'warning',
      title: 'Document language is missing',
      evidence: 'The <html> element has no lang attribute.',
      recommendation:
        'Set a valid lang attribute that matches the page language.',
    })
  }

  if (titles.length !== 1 || !title) {
    addFinding(findings, {
      id: 'title',
      severity: 'error',
      title: 'Page must have one non-empty title',
      evidence: `Found ${titles.length} title elements; first title length is ${title.length}.`,
      recommendation: 'Add one descriptive, unique <title> element.',
    })
  } else if (title.length < 30 || title.length > 60) {
    addFinding(findings, {
      id: 'title-length',
      severity: 'warning',
      title: 'Title length is outside the recommended range',
      evidence: `The title is ${title.length} characters; the target range is 30–60.`,
      recommendation:
        'Rewrite the title to describe the page clearly in 30–60 characters.',
    })
  }

  if (!description) {
    addFinding(findings, {
      id: 'meta-description',
      severity: 'error',
      title: 'Meta description is missing',
      evidence: 'No non-empty meta[name="description"] was found.',
      recommendation:
        'Add a unique summary that gives searchers a reason to visit.',
    })
  } else if (description.length < 120 || description.length > 160) {
    addFinding(findings, {
      id: 'meta-description-length',
      severity: 'warning',
      title: 'Meta description length is outside the recommended range',
      evidence: `The description is ${description.length} characters; the target range is 120–160.`,
      recommendation:
        'Keep the summary specific and within 120–160 characters.',
    })
  }

  const canonical = $('link[rel~="canonical"]').first().attr('href')
  if (!canonical) {
    addFinding(findings, {
      id: 'canonical',
      severity: 'warning',
      title: 'Canonical URL is missing',
      evidence: 'No link[rel="canonical"] was found.',
      recommendation:
        'Add a canonical link that identifies the preferred page URL.',
    })
  }

  if (!$('meta[name="viewport"]').length) {
    addFinding(findings, {
      id: 'viewport',
      severity: 'warning',
      title: 'Viewport metadata is missing',
      evidence: 'No meta[name="viewport"] was found.',
      recommendation: 'Add responsive viewport metadata for mobile rendering.',
    })
  }

  if (h1Count !== 1) {
    addFinding(findings, {
      id: 'h1-count',
      severity: 'error',
      title: 'Page should have one primary heading',
      evidence: `Found ${h1Count} h1 elements.`,
      recommendation: 'Use one descriptive h1 that states the page topic.',
    })
  }

  if (imagesMissingAlt > 0) {
    addFinding(findings, {
      id: 'image-alt',
      severity: 'warning',
      title: 'Images are missing alternative text',
      evidence: `${imagesMissingAlt} of ${images.length} images have missing or empty alt text.`,
      recommendation:
        'Add descriptive alt text, or use alt="" only for decorative images.',
    })
  }

  if (wordCount < 300) {
    addFinding(findings, {
      id: 'thin-content',
      severity: 'warning',
      title: 'Page has limited indexable copy',
      evidence: `Found approximately ${wordCount} words in the body.`,
      recommendation:
        'Ensure the page answers its target search intent completely; avoid padding.',
    })
  }

  if (internalLinkCount === 0) {
    addFinding(findings, {
      id: 'internal-links',
      severity: 'info',
      title: 'No internal links were found',
      evidence: 'The page has no crawlable links to the same origin.',
      recommendation:
        'Add relevant internal links where they help readers continue their journey.',
    })
  }

  const deductions = findings.reduce((total, finding) => {
    if (finding.severity === 'error') return total + 15
    if (finding.severity === 'warning') return total + 6
    return total + 2
  }, 0)

  return DeterministicSeoAuditSchema.parse({
    score: Math.max(0, 100 - deductions),
    metrics: {
      titleCount: titles.length,
      titleLength: title.length,
      metaDescriptionLength: description.length,
      h1Count,
      h2Count,
      wordCount,
      imageCount: images.length,
      imagesMissingAlt,
      internalLinkCount,
      externalLinkCount,
    },
    findings,
  })
}
