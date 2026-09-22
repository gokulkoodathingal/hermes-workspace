import { z } from 'zod'

export const SeoSeveritySchema = z.enum(['error', 'warning', 'info'])

export const SeoFindingSchema = z.object({
  id: z.string(),
  severity: SeoSeveritySchema,
  title: z.string(),
  evidence: z.string(),
  recommendation: z.string(),
})

export const SeoMetricsSchema = z.object({
  titleCount: z.number().int().nonnegative(),
  titleLength: z.number().int().nonnegative(),
  metaDescriptionLength: z.number().int().nonnegative(),
  h1Count: z.number().int().nonnegative(),
  h2Count: z.number().int().nonnegative(),
  wordCount: z.number().int().nonnegative(),
  imageCount: z.number().int().nonnegative(),
  imagesMissingAlt: z.number().int().nonnegative(),
  internalLinkCount: z.number().int().nonnegative(),
  externalLinkCount: z.number().int().nonnegative(),
})

export const DeterministicSeoAuditSchema = z.object({
  score: z.number().int().min(0).max(100),
  metrics: SeoMetricsSchema,
  findings: z.array(SeoFindingSchema),
})

export const SeoOpportunitySchema = z.object({
  priority: z.enum(['high', 'medium', 'low']),
  recommendation: z.string(),
  rationale: z.string(),
})

export const SeoLlmAnalysisSchema = z.object({
  summary: z.string(),
  searchIntent: z.string(),
  strengths: z.array(z.string()),
  opportunities: z.array(SeoOpportunitySchema),
})

export const SeoAuditReportSchema = z.object({
  url: z.string().url(),
  requestedUrl: z.string().url(),
  status: z.number().int(),
  generatedAt: z.string().datetime(),
  analysisMode: z.enum(['deterministic', 'deterministic+llm']),
  deterministic: DeterministicSeoAuditSchema,
  llmAnalysis: SeoLlmAnalysisSchema.nullable(),
})

export type SeoFinding = z.infer<typeof SeoFindingSchema>
export type DeterministicSeoAudit = z.infer<typeof DeterministicSeoAuditSchema>
export type SeoLlmAnalysis = z.infer<typeof SeoLlmAnalysisSchema>
export type SeoAuditReport = z.infer<typeof SeoAuditReportSchema>
