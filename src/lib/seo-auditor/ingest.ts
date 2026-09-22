export type IngestedPage = {
  requestedUrl: string
  finalUrl: string
  status: number
  contentType: string
  html: string
}

export type PageIngestionOptions = {
  fetcher?: typeof fetch
  maxBytes?: number
  timeoutMs?: number
  userAgent?: string
}

const DEFAULT_MAX_BYTES = 2_000_000
const DEFAULT_TIMEOUT_MS = 10_000

function validateUrl(input: string): URL {
  const url = new URL(input)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http: and https: URLs are supported')
  }
  if (url.username || url.password) {
    throw new Error('URLs containing credentials are not supported')
  }
  return url
}

export async function ingestPage(
  input: string,
  options: PageIngestionOptions = {},
): Promise<IngestedPage> {
  const url = validateUrl(input)
  const fetcher = options.fetcher ?? fetch
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  const response = await fetcher(url.toString(), {
    redirect: 'follow',
    signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    headers: {
      accept: 'text/html,application/xhtml+xml;q=0.9',
      'user-agent':
        options.userAgent ??
        'Hermes-OnPage-SEO-Auditor/1.0 (+https://github.com/gokulkoodathingal/hermes-workspace)',
    },
  })

  if (!response.ok) {
    throw new Error(`Page request failed with HTTP ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!/^(text\/html|application\/xhtml\+xml)(?:;|$)/i.test(contentType)) {
    throw new Error(
      `Expected an HTML response, received "${contentType || 'unknown'}"`,
    )
  }

  const declaredLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error(`Page exceeds the ${maxBytes} byte limit`)
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength > maxBytes) {
    throw new Error(`Page exceeds the ${maxBytes} byte limit`)
  }

  return {
    requestedUrl: url.toString(),
    finalUrl: response.url || url.toString(),
    status: response.status,
    contentType,
    html: new TextDecoder().decode(bytes),
  }
}
