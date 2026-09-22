import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import ipaddr from 'ipaddr.js'
import { Agent, fetch as undiciFetch } from 'undici'
import type { Dispatcher } from 'undici'

export type IngestedPage = {
  requestedUrl: string
  finalUrl: string
  status: number
  contentType: string
  html: string
}

export type PageIngestionOptions = {
  allowPrivateHosts?: boolean
  fetcher?: PageFetcher
  maxBytes?: number
  maxRedirects?: number
  resolveHost?: (hostname: string) => Promise<Array<string>>
  timeoutMs?: number
  userAgent?: string
}

type PageBody = {
  cancel: (reason?: unknown) => Promise<void>
  getReader: () => {
    cancel: (reason?: unknown) => Promise<void>
    read: () => Promise<{ done: boolean; value?: Uint8Array }>
  }
}
type PageResponse = {
  body: PageBody | null
  headers: { get: (name: string) => string | null }
  ok: boolean
  status: number
}
type PageRequestInit = {
  dispatcher?: Dispatcher
  headers: Record<string, string>
  redirect: 'manual'
  signal: AbortSignal
}
type PageFetcher = (
  input: string,
  init: PageRequestInit,
) => Promise<PageResponse>

const DEFAULT_MAX_BYTES = 2_000_000
const DEFAULT_MAX_REDIRECTS = 5
const DEFAULT_TIMEOUT_MS = 10_000
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

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

function isPublicIp(address: string): boolean {
  const normalized = address.replace(/^\[|\]$/g, '').split('%')[0]
  return (
    ipaddr.isValid(normalized) && ipaddr.parse(normalized).range() === 'unicast'
  )
}

async function defaultResolveHost(hostname: string): Promise<Array<string>> {
  const normalized = hostname.replace(/^\[|\]$/g, '')
  if (isIP(normalized)) return [normalized]
  const records = await lookup(normalized, { all: true, verbatim: true })
  return records.map((record) => record.address)
}

async function assertPublicTarget(
  url: URL,
  resolveHost: (hostname: string) => Promise<Array<string>>,
): Promise<Array<string>> {
  const normalizedHostname = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(normalizedHostname)
    ? [normalizedHostname]
    : await resolveHost(normalizedHostname)
  if (
    addresses.length === 0 ||
    addresses.some((address) => !isPublicIp(address))
  ) {
    throw new Error(
      `Refusing to fetch non-public address for "${url.hostname}"`,
    )
  }
  return addresses
}

function createPinnedDispatcher(addresses: Array<string>): Agent {
  return new Agent({
    connect: {
      lookup(_hostname, lookupOptions, callback) {
        const records = addresses.map((address) => ({
          address,
          family: isIP(address),
        }))
        if (lookupOptions.all) {
          callback(null, records)
          return
        }
        const first = records[0]
        callback(null, first.address, first.family)
      },
    },
  })
}

async function readBoundedBody(
  response: PageResponse,
  maxBytes: number,
): Promise<Uint8Array> {
  if (!response.body) return new Uint8Array()

  const reader = response.body.getReader()
  const chunks: Array<Uint8Array> = []
  let totalBytes = 0

  let result = await reader.read()
  while (!result.done) {
    const { value } = result
    if (!value) {
      result = await reader.read()
      continue
    }
    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      throw new Error(`Page exceeds the ${maxBytes} byte limit`)
    }
    chunks.push(value)
    result = await reader.read()
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

export async function ingestPage(
  input: string,
  options: PageIngestionOptions = {},
): Promise<IngestedPage> {
  const requestedUrl = validateUrl(input)
  const fetcher: PageFetcher =
    options.fetcher ?? ((url, init) => undiciFetch(url, init))
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS
  const resolveHost = options.resolveHost ?? defaultResolveHost
  let currentUrl = requestedUrl
  let response: PageResponse | undefined
  const dispatchers: Array<Agent> = []

  try {
    for (
      let redirectCount = 0;
      redirectCount <= maxRedirects;
      redirectCount += 1
    ) {
      const addresses = options.allowPrivateHosts
        ? []
        : await assertPublicTarget(currentUrl, resolveHost)
      const dispatcher =
        addresses.length > 0 ? createPinnedDispatcher(addresses) : undefined
      if (dispatcher) dispatchers.push(dispatcher)

      response = await fetcher(currentUrl.toString(), {
        dispatcher,
        redirect: 'manual',
        signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
        headers: {
          accept: 'text/html,application/xhtml+xml;q=0.9',
          'user-agent':
            options.userAgent ??
            'Hermes-OnPage-SEO-Auditor/1.0 (+https://github.com/gokulkoodathingal/hermes-workspace)',
        },
      })

      if (!REDIRECT_STATUSES.has(response.status)) break
      const location = response.headers.get('location')
      await response.body?.cancel()
      if (!location) {
        throw new Error(
          `Redirect response ${response.status} is missing a location header`,
        )
      }
      if (redirectCount === maxRedirects) {
        throw new Error(`Page exceeded the ${maxRedirects} redirect limit`)
      }
      currentUrl = validateUrl(new URL(location, currentUrl).toString())
    }

    if (!response) throw new Error('Page request did not return a response')

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

    const bytes = await readBoundedBody(response, maxBytes)

    return {
      requestedUrl: requestedUrl.toString(),
      finalUrl: currentUrl.toString(),
      status: response.status,
      contentType,
      html: new TextDecoder().decode(bytes),
    }
  } finally {
    await Promise.all(dispatchers.map((dispatcher) => dispatcher.close()))
  }
}
