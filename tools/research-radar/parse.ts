import type { RadarItem, SourceKind } from './types.ts'

const SOURCES: Array<SourceKind> = [
  'youtube',
  'blog',
  'wikipedia',
  'search',
  'github',
  'huggingface',
  'social',
  'comments',
  'reviews',
  'other',
]

export type ParsedRadar = {
  operator?: string
  items: Array<RadarItem>
}

function asSource(value: unknown): SourceKind {
  const source = String(value ?? 'other')
  return SOURCES.includes(source as SourceKind)
    ? (source as SourceKind)
    : 'other'
}

function asItem(value: unknown, index: number): RadarItem | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const title = String(record.title ?? '').trim()
  const text = String(record.text ?? record.body ?? record.excerpt ?? '').trim()
  if (!title && !text) return null
  return {
    id: String(record.id ?? `r${index + 1}`),
    source: asSource(record.source),
    title: title || text.slice(0, 80),
    text,
    url: String(record.url ?? ''),
    author: String(record.author ?? ''),
  }
}

export function parseRadar(raw: string): ParsedRadar {
  const trimmed = raw.trim()
  if (!trimmed) return { items: [] }
  const data = JSON.parse(trimmed) as unknown
  if (Array.isArray(data)) {
    return {
      items: data
        .map((item, index) => asItem(item, index))
        .filter((item): item is RadarItem => item !== null),
    }
  }
  if (!data || typeof data !== 'object') return { items: [] }
  const record = data as Record<string, unknown>
  const list = Array.isArray(record.items) ? record.items : []
  return {
    operator: typeof record.operator === 'string' ? record.operator : undefined,
    items: list
      .map((item, index) => asItem(item, index))
      .filter((item): item is RadarItem => item !== null),
  }
}
