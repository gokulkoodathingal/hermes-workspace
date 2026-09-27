import type { CommentInput } from './types.ts'

export type ParsedComments = {
  product?: string
  audience?: string
  comments: Array<CommentInput>
}

function asComment(value: unknown, index: number): CommentInput | null {
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text) return null
    return { id: `c${index + 1}`, text, source: 'pasted' }
  }
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const text = String(record.text ?? record.comment ?? record.body ?? '').trim()
  if (!text) return null
  const id = String(record.id ?? `c${index + 1}`)
  const source = String(record.source ?? 'pasted')
  return { id, text, source }
}

function parseCsv(raw: string): Array<CommentInput> {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) return []
  const headers = splitCsvLine(lines[0]).map((cell) =>
    cell.trim().toLowerCase(),
  )
  const textIndex = headers.findIndex((header) =>
    ['text', 'comment', 'body', 'review'].includes(header),
  )
  if (textIndex < 0) {
    throw new Error('CSV needs a text, comment, body, or review column.')
  }
  const sourceIndex = headers.indexOf('source')
  const idIndex = headers.indexOf('id')
  const comments: Array<CommentInput> = []
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line)
    const text = (cells[textIndex] ?? '').trim()
    if (!text) continue
    const idCell = idIndex >= 0 ? (cells[idIndex] ?? '') : ''
    const sourceCell = sourceIndex >= 0 ? (cells[sourceIndex] ?? '') : ''
    comments.push({
      id: idCell.trim() || `c${comments.length + 1}`,
      text,
      source: sourceCell.trim() || 'pasted',
    })
  }
  return comments
}

function splitCsvLine(line: string): Array<string> {
  const cells: Array<string> = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        quoted = !quoted
      }
      continue
    }
    if (char === ',' && !quoted) {
      cells.push(current)
      current = ''
      continue
    }
    current += char
  }
  cells.push(current)
  return cells
}

export function parseComments(
  raw: string,
  filename = 'comments.txt',
): ParsedComments {
  const trimmed = raw.trim()
  if (!trimmed) return { comments: [] }
  if (filename.endsWith('.csv')) return { comments: parseCsv(trimmed) }
  if (
    filename.endsWith('.json') ||
    trimmed.startsWith('{') ||
    trimmed.startsWith('[')
  ) {
    const data = JSON.parse(trimmed) as unknown
    if (Array.isArray(data)) {
      return {
        comments: data
          .map((item, index) => asComment(item, index))
          .filter((item): item is CommentInput => item !== null),
      }
    }
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>
      const list = Array.isArray(record.comments) ? record.comments : []
      return {
        product:
          typeof record.product === 'string' ? record.product : undefined,
        audience:
          typeof record.audience === 'string' ? record.audience : undefined,
        comments: list
          .map((item, index) => asComment(item, index))
          .filter((item): item is CommentInput => item !== null),
      }
    }
  }
  const blocks = trimmed.includes('\n\n')
    ? trimmed.split(/\n\s*\n/)
    : trimmed.split(/\r?\n/)
  return {
    comments: blocks
      .map((block) => block.trim())
      .filter(Boolean)
      .map((text, index) => ({ id: `c${index + 1}`, text, source: 'pasted' })),
  }
}
